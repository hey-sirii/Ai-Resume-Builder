const generateBtn = document.getElementById("generateBtn");
const loading = document.getElementById("loading");
const preview = document.getElementById("resumePreview");
const downloadBtn = document.getElementById("downloadBtn");
const copyBtn = document.getElementById("copyBtn");

generateBtn.addEventListener("click", async () => {
  const apiKey = document.getElementById("apiKey").value;

  if (!apiKey) {
    alert("Please enter your Gemini API Key");
    return;
  }

  // Collect form data
  const data = {
    resumeType: document.getElementById("resumeType").value,
    personalInfo: document.getElementById("personalInfo").value,
    education: document.getElementById("education").value,
    experience: document.getElementById("experience").value,
    projects: document.getElementById("projects").value,
    skills: document.getElementById("skills").value,
    extracurricular: document.getElementById("extracurricular").value,
  };

  loading.classList.add("active");
  generateBtn.disabled = true;

  try {
    const prompt = `
Create a professional ATS-friendly resume in clean HTML format.

Resume Type: ${data.resumeType}

Personal Info:
${data.personalInfo}

Education:
${data.education}

Experience:
${data.experience}

Projects:
${data.projects}

Skills:
${data.skills}

Extracurricular:
${data.extracurricular}

Instructions:
- Use proper HTML structure
- Use headings and bullet points
- Keep it clean and professional
- No CSS, only HTML content
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Failed to generate resume from API");
    }

    const result = await response.json();

    let text =
      result.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Error generating resume.";

    // Remove markdown code block backticks if the model returns them
    text = text.replace(/```html/gi, "").replace(/```/gi, "");

    preview.innerHTML = text;

  } catch (error) {
    preview.innerHTML = `<p style="color:red; padding: 20px;">Error: ${error.message}</p>`;
  }

  loading.classList.remove("active");
  generateBtn.disabled = false;
});


// 📋 Copy HTML
copyBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(preview.innerHTML);
  alert("Resume HTML copied!");
});


// 📄 Download PDF
downloadBtn.addEventListener("click", () => {
  const printWindow = window.open("", "", "width=800,height=600");
  printWindow.document.write(`
    <html>
      <head>
        <title>Resume</title>
      </head>
      <body>
        ${preview.innerHTML}
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.print();
});

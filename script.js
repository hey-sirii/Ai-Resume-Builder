const API_KEY = 'AIzaSyDv3uAQ3k9c7pye68myYA3_QwoZsS0YUNs';

// ===== Global Variables =====
let currentStep = 1;
let currentGenerationType = null;
let generatedContent = null;

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', function () {
    addEducation();
    addExperience();
    addProject();
});

// ===== Step Navigation =====
function nextStep() {
    if (currentStep < 6) {
        document.getElementById('step-' + currentStep).classList.add('hidden');
        currentStep++;
        document.getElementById('step-' + currentStep).classList.remove('hidden');
        updateProgressBar();
    }
}

function prevStep() {
    if (currentStep > 1) {
        document.getElementById('step-' + currentStep).classList.add('hidden');
        currentStep--;
        document.getElementById('step-' + currentStep).classList.remove('hidden');
        updateProgressBar();
    }
}

function updateProgressBar() {
    const percentage = Math.round((currentStep / 6) * 100);
    document.getElementById('progress-bar').style.width = percentage + '%';
    document.getElementById('step-percentage').textContent = percentage + '%';

    const stepLabels = [
        'Basic Information',
        'Education',
        'Work Experience',
        'Projects',
        'Skills',
        'Generation Hub'
    ];
    document.getElementById('step-label').textContent = `Step ${currentStep} of 6: ${stepLabels[currentStep - 1]}`;
}

// ===== Dynamic Form Management - Education =====
function addEducation() {
    const container = document.getElementById('education-container');
    const id = Date.now();
    const educationHTML = `
        <div class="entry-card" id="edu-${id}">
            <button onclick="removeElement('edu-${id}')" class="btn-close-remove">✕</button>
            <div class="entry-fields">
                <input type="text" placeholder="Institution (e.g., MIT)" class="edu-institution form-input">
                <input type="text" placeholder="Degree (e.g., BS Computer Science)" class="edu-degree form-input">
                <input type="text" placeholder="Graduation Date (e.g., May 2024)" class="edu-date form-input">
                <input type="text" placeholder="GPA (e.g., 3.8/4.0)" class="edu-gpa form-input">
            </div>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', educationHTML);
}

// ===== Dynamic Form Management - Experience =====
function addExperience() {
    const container = document.getElementById('experience-container');
    const id = Date.now();
    const experienceHTML = `
        <div class="entry-card" id="exp-${id}">
            <button onclick="removeElement('exp-${id}')" class="btn-close-remove">✕</button>
            <div class="entry-fields">
                <input type="text" placeholder="Job Title (e.g., Software Engineer)" class="exp-title form-input">
                <input type="text" placeholder="Company (e.g., Google)" class="exp-company form-input">
                <input type="text" placeholder="Dates (e.g., Jan 2022 - Present)" class="exp-dates form-input">
                <textarea placeholder="Description of responsibilities and achievements" rows="3" class="exp-description form-textarea"></textarea>
            </div>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', experienceHTML);
}

// ===== Dynamic Form Management - Projects =====
function addProject() {
    const container = document.getElementById('projects-container');
    const id = Date.now();
    const projectHTML = `
        <div class="entry-card" id="proj-${id}">
            <button onclick="removeElement('proj-${id}')" class="btn-close-remove">✕</button>
            <div class="entry-fields">
                <input type="text" placeholder="Project Name (e.g., AI Chat Bot)" class="proj-name form-input">
                <textarea placeholder="Project Description" rows="3" class="proj-description form-textarea"></textarea>
                <input type="text" placeholder="Technologies Used (e.g., Python, TensorFlow, React)" class="proj-tech form-input">
                <input type="text" placeholder="Link (e.g., github.com/user/project)" class="proj-link form-input">
            </div>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', projectHTML);
}

function removeElement(id) {
    const element = document.getElementById(id);
    if (element) {
        element.remove();
    }
}

// ===== Collect Form Data =====
function collectFormData() {
    const data = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        linkedin: document.getElementById('linkedin').value,
        github: document.getElementById('github').value,
        education: [],
        experience: [],
        projects: [],
        skills: document.getElementById('skills').value,
        jobDescription: document.getElementById('job-description').value
    };

    // Collect education
    document.querySelectorAll('#education-container > div').forEach(edu => {
        data.education.push({
            institution: edu.querySelector('.edu-institution').value,
            degree: edu.querySelector('.edu-degree').value,
            date: edu.querySelector('.edu-date').value,
            gpa: edu.querySelector('.edu-gpa').value
        });
    });

    // Collect experience
    document.querySelectorAll('#experience-container > div').forEach(exp => {
        data.experience.push({
            title: exp.querySelector('.exp-title').value,
            company: exp.querySelector('.exp-company').value,
            dates: exp.querySelector('.exp-dates').value,
            description: exp.querySelector('.exp-description').value
        });
    });

    // Collect projects
    document.querySelectorAll('#projects-container > div').forEach(proj => {
        data.projects.push({
            name: proj.querySelector('.proj-name').value,
            description: proj.querySelector('.proj-description').value,
            technologies: proj.querySelector('.proj-tech').value,
            link: proj.querySelector('.proj-link').value
        });
    });

    return data;
}

// ===== Loading Modal =====
function showLoadingModal() {
    document.getElementById('loading-modal').classList.add('active');
}

function hideLoadingModal() {
    document.getElementById('loading-modal').classList.remove('active');
}

// ===== Output Modal =====
function showOutputModal(title, content) {
    document.getElementById('output-title').textContent = title;
    document.getElementById('output-content').textContent = content;
    document.getElementById('output-modal').classList.add('active');
}

function closeOutputModal() {
    document.getElementById('output-modal').classList.remove('active');
}

// ===== Generate Content (uses default API key, no modal) =====
function generateContent(type) {
    currentGenerationType = type;
    proceedWithGeneration();
}

async function proceedWithGeneration() {
    const data = collectFormData();
    showLoadingModal();

    try {
        const prompt = buildPrompt(currentGenerationType, data);
        const response = await callGeminiAPI(prompt);
        generatedContent = response;

        hideLoadingModal();

        const titles = {
            'resume': 'Generated Resume',
            'cover-letter': 'Generated Cover Letter',
            'portfolio': 'Generated Portfolio Website'
        };

        showOutputModal(titles[currentGenerationType], response);
    } catch (error) {
        hideLoadingModal();
        showOutputModal('Error', 'Failed to generate content: ' + error.message);
    }
}

// ===== Build Prompt =====
function buildPrompt(type, data) {
    let baseInfo = `Name: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone}\nLinkedIn: ${data.linkedin}\nGitHub: ${data.github}\n\n`;

    baseInfo += 'EDUCATION:\n';
    data.education.forEach(edu => {
        if (edu.institution || edu.degree) {
            baseInfo += `- ${edu.degree} at ${edu.institution} (${edu.date})${edu.gpa ? ', GPA: ' + edu.gpa : ''}\n`;
        }
    });

    baseInfo += '\nWORK EXPERIENCE:\n';
    data.experience.forEach(exp => {
        if (exp.title || exp.company) {
            baseInfo += `- ${exp.title} at ${exp.company} (${exp.dates})\n  ${exp.description}\n`;
        }
    });

    baseInfo += '\nPROJECTS:\n';
    data.projects.forEach(proj => {
        if (proj.name) {
            baseInfo += `- ${proj.name}\n  ${proj.description}\n  Technologies: ${proj.technologies}\n  Link: ${proj.link}\n`;
        }
    });

    baseInfo += `\nSKILLS:\n${data.skills}\n`;

    if (data.jobDescription) {
        baseInfo += `\nTARGET JOB DESCRIPTION:\n${data.jobDescription}\n`;
    }

    let prompt = '';
    if (type === 'resume') {
        prompt = `You are a professional resume writer. Based on the following information, create a professional, ATS-friendly resume in a clean text format. Make it compelling and tailored${data.jobDescription ? ' to the job description provided' : ''}. Use proper formatting with sections, bullet points, and clear structure.\n\n${baseInfo}\n\nGenerate a complete, professional resume:`;
    } else if (type === 'cover-letter') {
        prompt = `You are a professional cover letter writer. Based on the following information, create a compelling cover letter${data.jobDescription ? ' tailored to the job description provided' : ''}. Make it personalized, professional, and engaging.\n\n${baseInfo}\n\nGenerate a complete, professional cover letter:`;
    } else if (type === 'portfolio') {
        prompt = `You are a professional web developer. Based on the following information, create a complete, modern, single-page portfolio website in HTML with embedded CSS. Make it visually stunning with a dark theme, use modern design principles, and ensure it's fully responsive. Include all the person's information, education, experience, projects, and skills in an attractive layout.\n\n${baseInfo}\n\nGenerate a complete HTML portfolio website with embedded CSS (no external files):`;
    }

    return prompt;
}

// ===== Call Gemini API =====
async function callGeminiAPI(prompt) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${API_KEY}`;

    const requestBody = {
        contents: [{
            parts: [{
                text: prompt
            }]
        }],
        generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
        }
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'API request failed');
    }

    const result = await response.json();
    return result.candidates[0].content.parts[0].text;
}

// ===== Copy to Clipboard =====
function copyToClipboard() {
    const content = document.getElementById('output-content').textContent;
    navigator.clipboard.writeText(content).then(() => {
        const btn = event.target;
        const originalText = btn.textContent;
        btn.textContent = 'Copied!';
        setTimeout(() => {
            btn.textContent = originalText;
        }, 2000);
    });
}

// ===== Save as File =====
function saveAsFile() {
    const content = document.getElementById('output-content').textContent;
    let filename = 'generated-content.txt';
    let mimeType = 'text/plain';

    if (currentGenerationType === 'portfolio') {
        filename = 'portfolio.html';
        mimeType = 'text/html';
    } else if (currentGenerationType === 'resume') {
        filename = 'resume.txt';
    } else if (currentGenerationType === 'cover-letter') {
        filename = 'cover-letter.txt';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

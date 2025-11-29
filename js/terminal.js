document.addEventListener('DOMContentLoaded', async () => {
    const terminalContainer = document.getElementById('terminal-container');

    // Theme Toggle Logic
    const themeToggle = document.getElementById('theme-toggle');
    const icon = themeToggle.querySelector('i');

    // Check saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
        icon.className = 'fas fa-moon';
    }

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        if (currentTheme === 'light') {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'dark');
            icon.className = 'fas fa-sun';
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
            icon.className = 'fas fa-moon';
        }
    });

    // Sequence of events
    await typeCommand('initializing environment...');
    await wait(500);
    await typeOutput('[OK] Environment loaded.');

    await typeCommand('load_profile --user "rafael_bianchi"');
    await wait(800);

    // Load profile data from window object (loaded via script tag)
    const data = window.profileData;

    if (!data) {
        await typeOutput('<span style="color: #ff0000;">[ERROR] Failed to load profile data.</span>');
        return;
    }

    const profile = data.profile;

    await wait(400);

    // Profile Info
    addOutputLine('<span style="color: #fff;">{</span>');

    const profileKeys = Object.keys(profile);
    profileKeys.forEach((key, index) => {
        const value = profile[key];
        const isLast = index === profileKeys.length - 1;
        const comma = isLast ? '' : ',';

        // Format value based on type
        let formattedValue;
        if (Array.isArray(value)) {
            // Format as JSON array
            const arrayItems = value.map(item => `<span style="color: #ce9178;">"${item}"</span>`).join(', ');
            formattedValue = `<span style="color: #fff;">[</span>${arrayItems}<span style="color: #fff;">]</span>`;
        } else {
            // Format as string
            formattedValue = `<span style="color: #ce9178;">"${value}"</span>`;
        }

        addOutputLine(`&nbsp;&nbsp;<span style="color: #33ff00;">"${key}"</span>: ${formattedValue}${comma}`);
    });

    addOutputLine('<span style="color: #fff;">}</span>');

    await wait(500);
    await typeCommand('list_contacts');
    await wait(200);

    // Contacts Info
    addOutputLine('<span style="color: #fff;">{</span>');

    const contacts = data.list_contacts;
    const contactKeys = Object.keys(contacts);

    contactKeys.forEach((key, index) => {
        const contact = contacts[key];
        const isLast = index === contactKeys.length - 1;
        const comma = isLast ? '' : ',';

        // Handle modal links differently
        if (contact.modal) {
            addOutputLine(`&nbsp;&nbsp;<span style="color: #33ff00;">"${key}"</span>: <span style="color: #ce9178;">"<a href='#' class='booking-link' data-url='${contact.url}'><i class='${contact.icon}'></i> ${contact.label}</a>"</span>${comma}`);
        } else {
            addOutputLine(`&nbsp;&nbsp;<span style="color: #33ff00;">"${key}"</span>: <span style="color: #ce9178;">"<a href='${contact.url}' target='_blank'><i class='${contact.icon}'></i> ${contact.label}</a>"</span>${comma}`);
        }
    });

    addOutputLine('<span style="color: #fff;">}</span>');

    // Keep cursor blinking at the end
    addCursorLine();

    // Setup modal functionality for booking link
    setupBookingModal();

    // Helper Functions
    function wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function typeCommand(text) {
        const line = document.createElement('div');
        line.className = 'terminal-line';
        const prompt = document.createElement('span');
        prompt.className = 'prompt';
        prompt.textContent = '>';
        line.appendChild(prompt);

        const content = document.createElement('span');
        content.className = 'command';
        line.appendChild(content);

        // Add cursor
        const cursor = document.createElement('span');
        cursor.className = 'cursor';
        line.appendChild(cursor);

        terminalContainer.appendChild(line);

        for (let i = 0; i < text.length; i++) {
            content.textContent += text[i];
            await wait(randomDelay(30, 80));
        }

        // Remove cursor from this line
        cursor.remove();
    }

    async function typeOutput(htmlContent) {
        const line = document.createElement('div');
        line.className = 'terminal-line';
        line.innerHTML = `<span class="output">${htmlContent}</span>`;
        terminalContainer.appendChild(line);
    }

    function addOutputLine(htmlContent) {
        const line = document.createElement('div');
        line.className = 'terminal-line';
        line.innerHTML = `<span class="output">${htmlContent}</span>`;
        terminalContainer.appendChild(line);
    }

    function addCursorLine() {
        const line = document.createElement('div');
        line.className = 'terminal-line';
        line.innerHTML = '<span class="prompt">></span><span class="cursor"></span>';
        terminalContainer.appendChild(line);
    }

    function randomDelay(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    function setupBookingModal() {
        // Create modal HTML
        const modalHTML = `
            <div id="booking-modal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <span class="modal-title">> schedule_meeting.sh</span>
                        <button class="modal-close" id="close-modal">[X] CLOSE</button>
                    </div>
                    <div class="modal-body">
                        <iframe id="booking-iframe" style="border: 0" width="100%" height="600" frameborder="0"></iframe>
                    </div>
                </div>
            </div>
        `;

        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Get elements
        const modal = document.getElementById('booking-modal');
        const closeBtn = document.getElementById('close-modal');
        const iframe = document.getElementById('booking-iframe');

        // Add click handler to booking link
        document.addEventListener('click', (e) => {
            if (e.target.closest('.booking-link')) {
                e.preventDefault();
                const url = e.target.closest('.booking-link').dataset.url;
                iframe.src = url;
                modal.style.display = 'flex';
            }
        });

        // Close modal handlers
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
            iframe.src = ''; // Clear iframe when closing
        });

        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
                iframe.src = '';
            }
        });

        // Close on ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.style.display === 'flex') {
                modal.style.display = 'none';
                iframe.src = '';
            }
        });
    }
});

document.addEventListener('DOMContentLoaded', async () => {
    const terminalContainer = document.getElementById('terminal-container');

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
        addOutputLine(`&nbsp;&nbsp;<span style="color: #33ff00;">"${key}"</span>: <span style="color: #ce9178;">"${value}"</span>${comma}`);
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

        addOutputLine(`&nbsp;&nbsp;<span style="color: #33ff00;">"${key}"</span>: <span style="color: #ce9178;">"<a href='${contact.url}' target='_blank'><i class='${contact.icon}'></i> ${contact.label}</a>"</span>${comma}`);
    });

    addOutputLine('<span style="color: #fff;">}</span>');

    // Keep cursor blinking at the end
    addCursorLine();

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
});

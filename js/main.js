document.addEventListener('DOMContentLoaded', () => {
    const profileContent = document.getElementById('profile-content');
    const linksContent = document.getElementById('links-content');

    // Decreasing visitor counter
    function initVisitorCounter() {
        let count = Math.floor(Math.random() * 101) + 100; // 100-200
        const digits = document.querySelectorAll('.counter-digit');
        const marqueeCount = document.getElementById('marquee-visitor-count');
        const pacman = document.querySelector('.pacman');

        function updateDisplay() {
            const padded = String(count).padStart(6, '0');
            let lastChangedIndex = -1;

            digits.forEach((digit, i) => {
                if (digit.textContent !== padded[i]) {
                    lastChangedIndex = i;
                    const oldValue = digit.textContent;

                    // Create ghost of old digit
                    const ghost = document.createElement('span');
                    ghost.className = 'digit-ghost';
                    ghost.textContent = oldValue;

                    // Calculate slide distance to Pac-Man
                    const digitsRemaining = digits.length - 1 - i;
                    const slideDistance = (digitsRemaining * 18) + 20; // digit width + gap + pacman offset
                    ghost.style.setProperty('--slide-distance', slideDistance + 'px');

                    digit.textContent = padded[i];
                    digit.appendChild(ghost);

                    // Remove ghost after animation
                    setTimeout(() => ghost.remove(), 500);
                }
            });

            // Pac-Man chomps when any digit changes
            if (lastChangedIndex >= 0 && pacman) {
                pacman.classList.add('chomp');
                setTimeout(() => pacman.classList.remove('chomp'), 500);
            }

            if (marqueeCount) marqueeCount.textContent = padded;
        }

        function scheduleDecrease() {
            const delay = Math.floor(Math.random() * 6001) + 4000; // 4-10 seconds
            setTimeout(() => {
                if (count > 0) {
                    count--;
                    updateDisplay();
                }
                scheduleDecrease();
            }, delay);
        }

        updateDisplay();
        scheduleDecrease();
    }
    initVisitorCounter();

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

    // Load profile data from window object
    const data = window.profileData;

    if (!data) {
        profileContent.innerHTML = '<p style="color: red;">Error: Failed to load profile data.</p>';
        return;
    }

    // Render Profile Content
    renderProfile(data.profile, profileContent);

    // Render Links Content
    renderLinks(data.list_contacts, linksContent);

    // Setup modal functionality for booking link
    setupBookingModal();

    // Helper Functions
    function renderProfile(profile, container) {
        let html = '<h2>About Me</h2>';

        // Name
        html += `
            <div class="profile-item">
                <span class="profile-label">Name:</span>
                <span class="profile-value">${profile.name}</span>
            </div>
        `;

        // Role
        html += `
            <div class="profile-item">
                <span class="profile-label">Role:</span>
                <span class="profile-value">${profile.role}</span>
            </div>
        `;

        // Interests
        html += `
            <div class="profile-item">
                <span class="profile-label">Interests:</span>
                <div class="interests-list">
                    ${profile.interests.map(interest => `<span class="interest-tag">${interest}</span>`).join('')}
                </div>
            </div>
        `;

        // Guestbook link (connects to booking/contact)
        html += `
            <div class="guestbook-prompt">
                <span class="email-icon">✉️</span>
                <a href="#links">Sign my guestbook!</a>
                <span class="email-icon">✉️</span>
            </div>
        `;

        container.innerHTML = html;
    }

    function renderLinks(contacts, container) {
        let html = '<h2>Connect with Me!</h2>';
        html += '<div class="links-grid">';

        const contactKeys = Object.keys(contacts);
        contactKeys.forEach(key => {
            const contact = contacts[key];

            if (contact.modal) {
                // Booking link opens in modal
                html += `
                    <a href="#" class="link-button booking booking-link" data-url="${contact.url}">
                        <i class="${contact.icon}"></i>
                        <span>${contact.label}</span>
                    </a>
                `;
            } else {
                // Regular links open in new tab
                html += `
                    <a href="${contact.url}" target="_blank" class="link-button ${key}">
                        <i class="${contact.icon}"></i>
                        <span>${contact.label}</span>
                    </a>
                `;
            }
        });

        html += '</div>';
        container.innerHTML = html;
    }

    function setupBookingModal() {
        // Create modal HTML
        const modalHTML = `
            <div id="booking-modal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <span class="modal-title">📅 Schedule a Meeting</span>
                        <button class="modal-close" id="close-modal">Close [X]</button>
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

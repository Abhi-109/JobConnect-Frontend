 // --- DOM Element Selection ---
        const seekerBtn = document.getElementById('seeker-btn');
        const recruiterBtn = document.getElementById('recruiter-btn');
        
        const loginFormContainer = document.getElementById('login-form-container');
        const registerFormContainer = document.getElementById('register-form-container');
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        
        const nameLabel = document.getElementById('name-label');
        const nameInput = document.getElementById('register-name');
        
        const toggleLink = document.getElementById('toggle-link');
        const toggleText = document.getElementById('toggle-text');
        
        const messageBox = document.getElementById('message-box');
        
        // --- Backend API URL ---
        const API_URL = 'http://localhost:3001';

        // --- State Management ---
        let currentRole = 'seeker'; // 'seeker' or 'recruiter'
        let isLoginView = true; // true for login, false for register

        // --- Functions ---

        /**
         * Displays a message to the user.
         * @param {string} text - The message to display.
         * @param {string} type - 'success' or 'error'.
         */
        function showMessage(text, type) {
            messageBox.textContent = text;
            messageBox.className = `message-box ${type}`; // Reset classes and add new ones
            messageBox.style.display = 'block';
        }

        function hideMessage() {
            messageBox.style.display = 'none';
        }

        function updateNameField() {
            if (currentRole === 'seeker') {
                nameLabel.textContent = 'Full Name';
                nameInput.placeholder = 'Jane Doe';
            } else {
                nameLabel.textContent = 'Company Name';
                nameInput.placeholder = 'Innovate Inc.';
            }
        }

        function switchRole(activeButton, inactiveButton) {
            activeButton.classList.add('active');
            inactiveButton.classList.remove('active');
        }

        function toggleForms() {
            isLoginView = !isLoginView;
            loginFormContainer.classList.toggle('active');
            registerFormContainer.classList.toggle('active');
            hideMessage(); // Hide any previous messages

            if (isLoginView) {
                toggleText.innerHTML = `Don't have an account? <a href="#" id="toggle-link">Sign up</a>`;
            } else {
                toggleText.innerHTML = `Already have an account? <a href="#" id="toggle-link">Sign in</a>`;
            }
            document.getElementById('toggle-link').addEventListener('click', handleToggleClick);
        }
        
        function handleToggleClick(e) {
            e.preventDefault();
            toggleForms();
        }

        // --- Event Listeners ---

        seekerBtn.addEventListener('click', () => {
            if (currentRole !== 'seeker') {
                currentRole = 'seeker';
                switchRole(seekerBtn, recruiterBtn);
                updateNameField();
            }
        });

        recruiterBtn.addEventListener('click', () => {
            if (currentRole !== 'recruiter') {
                currentRole = 'recruiter';
                switchRole(recruiterBtn, seekerBtn);
                updateNameField();
            }
        });

        toggleLink.addEventListener('click', handleToggleClick);

        // --- Form Submission Logic ---
        
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Prevent default form submission
            hideMessage();

            const name = document.getElementById('register-name').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            const confirmPassword = document.getElementById('register-confirm-password').value;

            if (password !== confirmPassword) {
                showMessage('Passwords do not match.', 'error');
                return;
            }

            try {
                const response = await fetch(`${API_URL}/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password, role: currentRole })
                });

                const data = await response.json();

                if (response.ok) {
                    showMessage(data.message, 'success');
                    registerForm.reset();
                    setTimeout(() => { // Switch to login view after a short delay
                        toggleForms();
                    }, 1500);
                } else {
                    showMessage(data.message, 'error');
                }
            } catch (error) {
                showMessage('Could not connect to the server.', 'error');
            }
        });

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            hideMessage();
            
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            try {
                const response = await fetch(`${API_URL}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    showMessage(data.message, 'success');
                    // Save the token for future authenticated requests
                    localStorage.setItem('authToken', data.token);
                    
                    // --- REDIRECTION LOGIC ---
                    // Redirect based on the role received from the server
                    if (data.role === 'recruiter') {
                        // Wait a moment for the user to see the success message
                        setTimeout(() => {
                            window.location.href = 'recruiter-dashboard.html';
                        }, 1000); 
                    } else {
                        // You can add a redirect for seekers here later
                        console.log("Logged in as a seeker. Dashboard not yet created.");
                    }

                } else {
                    showMessage(data.message, 'error');
                }
            } catch (error) {
                showMessage('Could not connect to the server.', 'error');
            }
        });

        // --- Initial Setup ---
        updateNameField();

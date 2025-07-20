 document.addEventListener('DOMContentLoaded', function () {
            const navToggle = document.querySelector('.nav-toggle');
            const navMenu = document.querySelector('.nav-menu');

            if (navToggle && navMenu) {
                navToggle.addEventListener('click', function () {
                    // Toggles the 'active' class on the menu to show/hide it
                    navMenu.classList.toggle('active');
                });
            }
        });
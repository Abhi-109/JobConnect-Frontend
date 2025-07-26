document.addEventListener("DOMContentLoaded", () => {
    const hamburger = document.querySelector(".hamburger-menu");
    const navMenu = document.querySelector(".nav-menu");
    const overlay = document.querySelector(".overlay");

    // Function to toggle the menu
    const toggleMenu = () => {
        hamburger.classList.toggle("is-active");
        navMenu.classList.toggle("active");
        overlay.classList.toggle("active");
    };

    // Event listener for the hamburger button
    hamburger.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleMenu();
    });

    // Event listener for the overlay to close the menu
    overlay.addEventListener("click", () => {
        if (navMenu.classList.contains("active")) {
            toggleMenu();
        }
    });

    // Close menu when a nav link is clicked (optional but good for UX)
    navMenu.addEventListener('click', (e) => {
        if (e.target.closest('a') && navMenu.classList.contains('active')) {
             toggleMenu();
        }
    });
});
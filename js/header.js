// This event listener waits for the HTML document to be fully loaded before running the script.
document.addEventListener("DOMContentLoaded", function() {

    // --- 1. DYNAMICALLY LOAD THE HEADER ---
    // Fetches the content of header.html and inserts it into the placeholder div.
    fetch('header.html')
        .then(response => {
            // Check if the fetch was successful
            if (!response.ok) {
                throw new Error("Network response was not ok " + response.statusText);
            }
            return response.text();
        })
        .then(data => {
            // Put the fetched HTML daata into the element with the ID 'header-placeholder'
            document.getElementById('header-placeholder').innerHTML = data;

            // --- 2. INITIALIZE HEADER-DEPENDENT SCRIPTS ---
            // This function is called AFTER the header has been successfully loaded.
            // This is crucial because the elements (hamburger, search) don't exist until the header is loaded.
            initializeHeaderScripts();
        })
        .catch(error => {
            // Log any errors to the console and show a user-friendly message on the page.
            console.error('Error fetching the header:', error);
            document.getElementById('header-placeholder').innerHTML = '<p style="color:red; text-align:center;">Error: Could not load page header.</p>';
        });

    /**
     * This function contains all the logic for the interactive elements within the header.
     * It finds the necessary elements and attaches event listeners to them.
     */
    function initializeHeaderScripts() {
        const hamburger = document.querySelector('.hamburger-menu');
        const navMenu = document.querySelector('.nav-menu');
        const overlay = document.querySelector('.overlay');
        const searchForm = document.querySelector('.search-container form');
        const searchIcon = document.querySelector('.search-container .fa-search');
        const searchInput = document.querySelector('.search-container input');

        // --- Hamburger Menu Toggle Logic ---
        if (hamburger && navMenu && overlay) {
            // When the hamburger icon is clicked, toggle the 'active' class on the menu and overlay.
            hamburger.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                overlay.classList.toggle('active');
            });

            // When the overlay is clicked, close the menu.
            overlay.addEventListener('click', () => {
                navMenu.classList.remove('active');
                overlay.classList.remove('active');
            });
        }

        // --- Search Bar Click-to-Open Logic ---
        // This is better for mobile than using :hover.
        if (searchIcon && searchForm && searchInput) {
             searchIcon.addEventListener('click', (event) => {
                // Prevent the click from submitting the form.
                event.preventDefault(); 
                
                // Toggle the 'active' class on the form to expand/collapse it.
                searchForm.classList.toggle('active');

                // If the form is now active, automatically focus the input field for the user.
                if (searchForm.classList.contains('active')) {
                    searchInput.focus();
                }
            });

            // Optional: Close the search bar if the user clicks anywhere else on the page.
            document.addEventListener('click', function(event) {
                // Check if the click was outside the search form.
                if (!searchForm.contains(event.target)) {
                    searchForm.classList.remove('active');
                }
            });
        }
    }
});


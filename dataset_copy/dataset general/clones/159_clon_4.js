(function() {
    // Define an initial dimension for the sidebar panel, analogous to 'leftWidth'
    const sidebarInitialDimension = 200; // Default width in pixels

    // DOM element references, carefully chosen to avoid original identifiers
    let panelElement; // Corresponds to #left
    let controlToggle; // Corresponds to #openClose
    let displayArea; // Corresponds to #right
    let primaryContainer; // Corresponds to #content

    // Constants for fine-tuning layout, derived from the original's magic numbers
    const controlWidth = 20; // Assumed width of the toggle control
    const spacingUnitA = 5;  // First spacing value
    const spacingUnitB = 9;  // Second spacing value

    // Internal state to track the visibility of the sidebar
    let isPanelOpen = true;

    // Helper to obtain viewport dimensions, without using Array.prototype.map
    function retrieveViewportDimensions() {
        return {
            currentHeight: window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight,
            currentWidth: window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth
        };
    }

    // Main function to adjust the layout of the panels, replacing 'wSize' and jQuery's animate
    function adjustPanelLayout(useAnimations = true) {
        // Ensure all required elements are present
        if (!panelElement || !controlToggle || !displayArea || !primaryContainer) {
            console.error("Critical layout elements missing. Please verify IDs.");
            return;
        }

        // Apply or remove a class to enable/disable CSS transitions for smooth animation
        const animationClass = 'layout-animated';
        if (useAnimations) {
            panelElement.classList.add(animationClass);
            displayArea.classList.add(animationClass);
        } else {
            panelElement.classList.remove(animationClass);
            displayArea.classList.remove(animationClass);
        }

        // Get the effective width of the primary container for calculations
        // This emulates `$("#content").width()` from the original
        const containerEffectiveWidth = primaryContainer.clientWidth;

        if (isPanelOpen) {
            // Panel is currently visible (equivalent to original state where #openClose has 'close' class)
            // User wants to close it, so button should show 'collapse' indicator
            panelElement.style.width = `${sidebarInitialDimension}px`;
            panelElement.style.opacity = '1';
            displayArea.style.width = `${containerEffectiveWidth - controlWidth - sidebarInitialDimension - spacingUnitB}px`;

            controlToggle.classList.remove('expand-panel');
            controlToggle.classList.add('collapse-panel');
        } else {
            // Panel is currently hidden (equivalent to original state where #openClose has 'open' class)
            // User wants to open it, so button should show 'expand' indicator
            panelElement.style.width = '0px';
            panelElement.style.opacity = '0';
            displayArea.style.width = `${containerEffectiveWidth - controlWidth - spacingUnitA}px`;

            controlToggle.classList.remove('collapse-panel');
            controlToggle.classList.add('expand-panel');
        }
    }

    // Event handler for the toggle button click
    function handleToggleClick() {
        isPanelOpen = !isPanelOpen; // Flip the state
        adjustPanelLayout(true); // Trigger layout adjustment with animation
    }

    // Function to initialize the entire layout system on page load
    function initializeSystem() {
        // Retrieve DOM element references using new, unique IDs
        panelElement = document.getElementById('mainSidebarPanel');
        controlToggle = document.getElementById('sidebarToggleButton');
        displayArea = document.getElementById('mainContentDisplay');
        primaryContainer = document.getElementById('pageWrapper');

        if (!panelElement || !controlToggle || !displayArea || !primaryContainer) {
            console.warn("One or more essential layout elements could not be found. Layout functionality may be impaired.");
            return;
        }

        // Attach event listeners
        controlToggle.addEventListener('click', handleToggleClick);
        window.addEventListener('resize', () => adjustPanelLayout(false)); // No animation during resize

        // Perform initial layout calculation without animation
        adjustPanelLayout(false);

        // Inject basic CSS for transitions, mimicking jQuery's animate visually
        const dynamicStyle = document.createElement('style');
        dynamicStyle.textContent = `
            #mainSidebarPanel.layout-animated, #mainContentDisplay.layout-animated {
                transition: width 0.3s ease-in-out, opacity 0.3s ease-in-out;
            }
            #mainSidebarPanel, #sidebarToggleButton, #mainContentDisplay {
                box-sizing: border-box; /* Essential for accurate width calculations */
                float: left; /* Simple layout model */
            }
            #sidebarToggleButton {
                cursor: pointer;
                width: ${controlWidth}px;
                text-align: center;
                user-select: none;
                background-color: #f0f0f0;
                border: 1px solid #ccc;
                height: 100vh; /* Example height */
                display: flex;
                align-items: center;
                justify-content: center;
                font-family: monospace;
            }
            #sidebarToggleButton.collapse-panel::before { content: '<'; } /* Visual indicator for closing */
            #sidebarToggleButton.expand-panel::before { content: '>'; } /* Visual indicator for opening */
        `;
        document.head.appendChild(dynamicStyle);
    }

    // Ensure the system initializes once the DOM is fully loaded
    document.addEventListener('DOMContentLoaded', initializeSystem);
})();
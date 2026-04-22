(function() {

    let applicationSettings;
    let primaryNavigationElement;
    let displayArea;
    let mainDocumentBody;

    // Utility function to progressively decrease element opacity
    function decreaseVisibility(targetElement, durationInMs, completionCallback) {
        let currentOpacityValue = 1;
        const animationInterval = 50; // Milliseconds per step
        const opacityDecrementAmount = 1 / (durationInMs / animationInterval);

        function stepOpacityDown() {
            currentOpacityValue -= opacityDecrementAmount;
            if (currentOpacityValue <= 0) {
                targetElement.style.opacity = '0';
                targetElement.style.display = 'none'; // Hide completely when faded
                if (completionCallback) completionCallback();
            } else {
                targetElement.style.opacity = currentOpacityValue.toString();
                setTimeout(stepOpacityDown, animationInterval);
            }
        }
        stepOpacityDown();
    }

    // Utility function to progressively increase element opacity
    function increaseVisibility(targetElement, durationInMs, completionCallback) {
        let currentOpacityValue = 0;
        targetElement.style.opacity = '0';
        targetElement.style.display = ''; // Make visible but transparent initially
        const animationInterval = 50; // Milliseconds per step
        const opacityIncrementAmount = 1 / (durationInMs / animationInterval);

        function stepOpacityUp() {
            currentOpacityValue += opacityIncrementAmount;
            if (currentOpacityValue >= 1) {
                targetElement.style.opacity = '1';
                if (completionCallback) completionCallback();
            } else {
                targetElement.style.opacity = currentOpacityValue.toString();
                setTimeout(stepOpacityUp, animationInterval);
            }
        }
        stepOpacityUp();
    }

    // Core function to set up the application
    async function initializeApplication(parsedConfiguration) {
        applicationSettings = parsedConfiguration;

        // Acquire references to main interface components
        primaryNavigationElement = document.querySelector('[data-navigation-area]');
        mainDocumentBody = document.body; // Retain for consistency, though not heavily used
        displayArea = document.querySelector('[data-main-content-display]');

        // Configure the initial home page link
        const homePageIndexLink = document.querySelector('[data-home-page-link]');
        if (homePageIndexLink) {
            homePageIndexLink.addEventListener('click', (eventObject) => {
                eventObject.preventDefault();
                navigateToLandingSection();
            });
        }

        // Construct dynamic navigation links from configuration data
        for (const projectDetails of applicationSettings.content) {
            const projectListItem = document.createElement('li');
            const projectHyperlink = document.createElement('a');

            projectHyperlink.href = `#${projectDetails.link_id}`;
            projectHyperlink.textContent = projectDetails.title;

            projectHyperlink.addEventListener('click', async (eventObject) => {
                eventObject.preventDefault();
                await new Promise(resolve => decreaseVisibility(displayArea, 250, resolve));
                displayArea.replaceChildren(); // Erase all child elements
                await presentContentItem(projectDetails);
                await new Promise(resolve => increaseVisibility(displayArea, 250, resolve));
            });

            projectListItem.appendChild(projectHyperlink);
            primaryNavigationElement.appendChild(projectListItem);
        }

        // Display the home section after all setup is complete
        navigateToLandingSection();
    }

    // Function to revert to the application's default landing state
    function navigateToLandingSection() {
        decreaseVisibility(displayArea, 250, () => {
            displayArea.replaceChildren(); // Clear the display area
        });
    }

    // Orchestrates the display of different project types
    async function presentContentItem(itemDetails) {
        const contentRenderer = contentManagers[itemDetails.type];
        if (contentRenderer) {
            await contentRenderer(itemDetails);
        } else {
            console.error(`Unrecognized item type encountered: ${itemDetails.type}`);
        }
    }

    // Collection of functions responsible for rendering specific content types
    const contentManagers = {
        'page': async (itemDetails) => {
            const fetchedPageMarkup = await (await fetch(itemDetails.src)).text();
            displayArea.innerHTML = fetchedPageMarkup;
        },

        'processing': async (itemDetails) => {
            // Build the HTML structure using template literals
            const contentMarkup = `
                <h1>${itemDetails.title}</h1>
                <canvas data-sketch-canvas="${itemDetails.link_id}" width="${itemDetails.width}" height="${itemDetails.height}"></canvas>
                <p>${itemDetails.desc}</p>
                <pre class="prettyprint" data-code-display-area style="display:none"></pre>
                <button data-code-visibility-toggle>View Source</button>
            `;
            displayArea.innerHTML = contentMarkup;

            const sketchCanvas = displayArea.querySelector('[data-sketch-canvas]');
            const codeDisplayArea = displayArea.querySelector('[data-code-display-area]');
            const codeVisibilityToggle = displayArea.querySelector('[data-code-visibility-toggle]');

            codeVisibilityToggle.addEventListener('click', () => {
                const isCurrentlyHidden = codeDisplayArea.style.display === 'none';
                codeVisibilityToggle.textContent = isCurrentlyHidden ? "Hide Source" : "View Source";
                if (isCurrentlyHidden) {
                    increaseVisibility(codeDisplayArea, 250);
                } else {
                    decreaseVisibility(codeDisplayArea, 250);
                }
            });

            const retrievedSketchCode = await (await fetch(itemDetails.src)).text();
            new Processing(sketchCanvas, retrievedSketchCode); // Assumes Processing.js is available
            codeDisplayArea.textContent = retrievedSketchCode;
            if (typeof prettyPrint === 'function') { // Assumes prettyPrint is available
                prettyPrint();
            }
        }
    };

    // Application entry point: Execute when the entire document is loaded
    document.addEventListener('DOMContentLoaded', async () => {
        try {
            const configurationResponse = await fetch('config.json');
            if (!configurationResponse.ok) {
                throw new Error(`Network response error: ${configurationResponse.status}`);
            }
            const processedConfiguration = await configurationResponse.json();
            initializeApplication(processedConfiguration);
        } catch (errorDetails) {
            console.error("Failure during configuration loading or application startup:", errorDetails);
        }
    });

})();
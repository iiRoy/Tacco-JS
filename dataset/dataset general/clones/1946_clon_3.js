!(function(globalContext) {

    // Core application configuration and DOM references
    let applicationSettings;
    let primaryNavigation, documentBodyElement, mainDisplayArea;

    /**
     * Handles the display logic for a project link click.
     * Encapsulates the content fading, clearing, embedding, and re-fading.
     * @param {object} projectData The data object for the project to embed.
     * @param {Event} event The click event object.
     * @returns {boolean} False to prevent default link behavior.
     */
    function handleProjectLinkActivation(projectData, event) {
        event.preventDefault();
        console.log(`Attempting to load project: ${projectData.title}`);

        // Fade out the current content area
        $(mainDisplayArea).fadeOut(300, function() {
            $(mainDisplayArea).empty(); // Clear existing content
            // Embed the new project content
            renderContentModule(projectData, function() {
                // Callback: fade in content once embedding is complete
                $(mainDisplayArea).fadeIn(300);
                console.log(`Project "${projectData.title}" loaded and displayed.`);
            });
        });
        return false;
    }

    /**
     * Initializes the entire application interface and loads initial data.
     * @param {object} incomingConfig The configuration object fetched from config.json.
     */
    function initializeApplicationInterface(incomingConfig) {

        // Basic validation for configuration data
        if (!incomingConfig || typeof incomingConfig !== 'object' || !incomingConfig.content) {
            console.error("Invalid or missing application configuration. Aborting initialization.");
            return;
        }

        applicationSettings = incomingConfig;

        // Cache main DOM elements using jQuery for efficiency and readability
        documentBodyElement = $('body');
        primaryNavigation = $('#nav');
        mainDisplayArea = $('#content');

        // Set up click handler for the main home link
        const homeLinkElement = $('#link_home');
        if (homeLinkElement.length > 0) {
            homeLinkElement.on('click', navigateToHomePage);
        } else {
            console.warn("Home link element (#link_home) not found.");
        }

        // Dynamically build navigation menu from configuration content
        const projectItems = applicationSettings.content;
        if (Array.isArray(projectItems) && projectItems.length > 0) {
            for (const item of projectItems) {
                if (!item || !item.link_id || !item.title) {
                    console.warn("Skipping malformed project item in configuration:", item);
                    continue;
                }

                // Create navigation anchor for the project
                const projectNavAnchor = $('<a>', {
                    href: `#${item.link_id}`,
                    text: item.title
                });

                // Attach click event using jQuery, referencing new handler
                projectNavAnchor.on('click', function(e) {
                    handleProjectLinkActivation(item, e);
                });

                // Create list item and append the anchor
                const navListItem = $('<li>').append(projectNavAnchor);
                primaryNavigation.append(navListItem);
            }
        } else {
            console.info("No project content defined in configuration.");
        }

        // After initial setup, load the default home view
        navigateToHomePage();
    }

    /**
     * Navigates the application to the home page view.
     * Clears the main content area.
     * @returns {boolean} Always false.
     */
    function navigateToHomePage() {
        // Fade out content, then clear it
        $(mainDisplayArea).fadeOut(200, function() {
            $(mainDisplayArea).empty();
            // Optionally, display a default message or content here
            // mainDisplayArea.html('<p>Welcome! Select a project from the menu.</p>');
            // mainDisplayArea.fadeIn(200);
        });
        return false;
    }

    /**
     * Renders a specific content module based on its type.
     * @param {object} moduleDescription The object describing the module to render.
     * @param {Function} onRenderComplete Callback function to execute after rendering.
     */
    function renderContentModule(moduleDescription, onRenderComplete) {
        if (!moduleDescription || !moduleDescription.type) {
            console.error("Cannot render module: invalid or missing module description.", moduleDescription);
            onRenderComplete();
            return;
        }

        // Using if/else if structure instead of switch
        if (moduleDescription.type === "page") {
            ViewFactories.displaySimplePage(moduleDescription, onRenderComplete);
        } else if (moduleDescription.type === "processing") {
            ViewFactories.renderProcessingSketch(moduleDescription, onRenderComplete);
        } else {
            console.warn(`Unknown module type: ${moduleDescription.type}. No renderer found.`);
            onRenderComplete();
        }
    }

    // Object containing methods for rendering different view types
    const ViewFactories = {

        /**
         * Renders a simple HTML page into the main content area.
         * @param {object} pageDetails Object containing details about the page.
         * @param {Function} onPageLoaded Callback to invoke upon page load.
         */
        displaySimplePage: function(pageDetails, onPageLoaded) {
            if (!pageDetails || !pageDetails.src) {
                console.error("Page details or source URL missing for simple page rendering.", pageDetails);
                onPageLoaded();
                return;
            }

            $.ajax({
                url: pageDetails.src,
                dataType: 'html',
                success: function(retrievedHtml) {
                    mainDisplayArea.html(retrievedHtml);
                    onPageLoaded();
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    console.error(`Failed to load page from ${pageDetails.src}: ${textStatus} - ${errorThrown}`);
                    mainDisplayArea.html(`<p class="error-message">Could not load content for "${pageDetails.title}". Please try again later.</p>`);
                    onPageLoaded();
                }
            });
        },

        /**
         * Renders a Processing.js sketch within a canvas element.
         * @param {object} sketchConfiguration Object containing configuration for the sketch.
         * @param {Function} onSketchReady Callback to invoke when the sketch is loaded and running.
         */
        renderProcessingSketch: function(sketchConfiguration, onSketchReady) {

            if (!sketchConfiguration || !sketchConfiguration.link_id || !sketchConfiguration.src) {
                console.error("Missing critical configuration for Processing sketch.", sketchConfiguration);
                onSketchReady();
                return;
            }

            // Construct HTML for the Processing sketch display using template literals
            const sketchHtmlContent = `
                <section class="sketch-container">
                    <h2 class="sketch-title">${sketchConfiguration.title || "Untitled Sketch"}</h2>
                    <canvas id="${sketchConfiguration.link_id}-canvas" width="${sketchConfiguration.width || 600}" height="${sketchConfiguration.height || 400}"></canvas>
                    <p class="sketch-description">${sketchConfiguration.desc || "A captivating interactive experience."}</p>
                    <div class="code-display-wrapper">
                        <pre class="code prettyprint lang-js" style="display:none;"></pre>
                        <button type="button" class="source-toggle-button" id="codeSourceToggle">View Sketch Source</button>
                    </div>
                </section>
            `;

            mainDisplayArea.html(sketchHtmlContent);

            // Retrieve newly created elements using jQuery within the main display area
            const sketchCanvasElement = mainDisplayArea.find(`#${sketchConfiguration.link_id}-canvas`)[0];
            const sourceCodePreElement = mainDisplayArea.find('.code.prettyprint')[0];
            const sourceToggleButton = mainDisplayArea.find('#codeSourceToggle');

            let isSourceVisible = false;

            // Set up event listener for the source code toggle button
            sourceToggleButton.on('click', function() {
                isSourceVisible = !isSourceVisible;
                sourceToggleButton.text(isSourceVisible ? "Hide Sketch Source" : "View Sketch Source");
                $(sourceCodePreElement).slideToggle(300);
            });

            // Fetch the Processing sketch source code via AJAX
            $.ajax({
                url: sketchConfiguration.src,
                contentType: "text/plain",
                success: function(sketchSourceCode) {
                    if (typeof Processing !== 'undefined' && sketchCanvasElement) {
                        new Processing(sketchCanvasElement, sketchSourceCode);
                        $(sourceCodePreElement).text(sketchSourceCode);
                        if (typeof prettyPrint === 'function') {
                            prettyPrint();
                        } else {
                            console.warn("prettyPrint function not found. Code will not be formatted.");
                        }
                    } else {
                        console.error("Processing.js library not loaded or canvas element not found.");
                        mainDisplayArea.find('.sketch-container').append('<p class="error-message">Failed to initialize interactive sketch.</p>');
                    }
                    onSketchReady();
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    console.error(`Error loading sketch source from ${sketchConfiguration.src}: ${textStatus} - ${errorThrown}`);
                    $(sourceCodePreElement).text(`/* Error loading source code: ${errorThrown} */`);
                    mainDisplayArea.find('.sketch-container').append('<p class="error-message">Could not load sketch source. Displaying placeholder.</p>');
                    onSketchReady();
                }
            });
        }
    };

    // Application Bootstrap: Ensure DOM is ready before starting
    $(document).ready(function() {
        // Fetch application configuration from a JSON file
        $.ajax({
            url: 'config.json',
            dataType: 'json',
            success: function(fetchedConfiguration) {
                initializeApplicationInterface(fetchedConfiguration);
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error(`Failed to load configuration from config.json: ${textStatus} - ${errorThrown}`);
                // Display a user-friendly error message if config fails
                $('body').html('<div style="text-align: center; margin-top: 50px; font-family: sans-serif;"><h1>Application Error</h1><p>Could not load application configuration. Please check network connection or contact support.</p></div>');
            }
        });
    });

})(this);
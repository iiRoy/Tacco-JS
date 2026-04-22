(function(hostContext) {
    // This self-executing anonymous function encapsulates the module definition
    // to prevent pollution of the global scope. It receives the host application's
    // primary interface (e.g., jQuery or a custom framework object) as an argument.

    // A constant to hold the path for the main layout file.
    const primaryLayoutPath = "main.html";

    /**
     * Internal utility for logging messages during the application's initialization and component loading.
     * @param {string} message - The message string to be logged.
     */
    const traceApplicationFlow = (message) => {
        if (typeof console !== 'undefined' && console.info) {
            console.info(`[APP_COMP] :: ${message}`);
        }
    };

    traceApplicationFlow(`Initiating resource acquisition for base layout: ${primaryLayoutPath}`);

    // The host context is used to load necessary external resources.
    // Here, we're requesting a specific HTML template to be made available.
    hostContext.fetchDependency({
        resourceLocation: primaryLayoutPath // Specifies the path to the main HTML template file.
    })
    // Chaining to the dependency fetcher, we define our application's core module.
    .composeModule(function(moduleInterface) {
        // This function defines the module's public-facing component.
        // It assigns an executable function to the 'exposedFunction' property of the module interface.
        moduleInterface.exposedFunction = function(targetContainerElement) {
            traceApplicationFlow("Module's exposed function invoked for rendering.");

            // A preliminary check to ensure the target element is valid for rendering.
            if (!targetContainerElement || typeof targetContainerElement.appendTo !== 'function') {
                traceApplicationFlow("Error: Invalid or null target container element provided. Rendering aborted.");
                // In a real application, more robust error handling or a default fallback might be implemented.
                return;
            }

            // Define the configurations for various template expression types.
            // This array outlines how different inline code/data snippets are identified.
            const inlineExpressionDefinitions = [
                {
                    purposeDescription: 'Display the outcome of a JavaScript evaluation',
                    handlebarLikeSyntax: '{{ computedValue }}',
                    classicActiveServerPagesSyntax: '<%= computedValue %>'
                },
                {
                    purposeDescription: 'Execute a block of arbitrary JavaScript logic',
                    handlebarLikeSyntax: '{- statement; statement; -}',
                    classicActiveServerPagesSyntax: '<% statement; statement; %>'
                }
            ];

            // Define the configurations for template section markers.
            // These are used to delineate distinct, named regions within the template.
            const templateSectionDefinitions = [
                {
                    purposeDescription: 'Declare a specific, named section within the template document',
                    handlebarLikeSyntax: '{-- sectionIdentifier --}',
                    classicActiveServerPagesSyntax: '<%@ sectionIdentifier %>'
                }
            ];
            
            // Define the specialized delimiters for template control blocks.
            const controlBlockDelimiters = {
                startTag: '{-}', // Marker for the beginning of a control block.
                endTag: '{-}-}'  // Marker for the end of a control block.
            };

            // Consolidate all the rendering options into a single configuration object.
            const finalRenderConfiguration = {
                expressionTypes: inlineExpressionDefinitions,
                sectionMarkers: templateSectionDefinitions,
                blockStartDelimiter: controlBlockDelimiters.startTag,
                blockEndDelimiter: controlBlockDelimiters.endTag
            };

            // Use the module's internal UI rendering service to inject the processed template
            // content into the designated target container element.
            moduleInterface.uiService.renderContent(targetContainerElement, finalRenderConfiguration);
            traceApplicationFlow("Content rendering process completed successfully.");
        };
    });
})(window.$ || {}); // Passes the global '$' object (e.g., jQuery) or an empty object if '$' is undefined.
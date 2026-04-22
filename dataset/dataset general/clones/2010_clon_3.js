(function(docContext) {
    // This immediately invoked function expression (IIFE) encapsulates our application logic.
    // It takes jQuery as an argument, aliasing it to '$' for convenience,
    // and also receives the document context.

    // A central object to manage our markdown editor application's components.
    // Renamed from RotorMD to MkdnEditApp.
    const MkdnEditApp = {
        // Module responsible for rendering the preview.
        // Renamed from 'preview' to 'displayManager'.
        displayManager: {
            // Reference to the contentWindow.document of the iframe.
            // Renamed from 'frame' to 'previewFrameDocument'.
            previewFrameDocument: null,

            // Utility to store frequently used selectors for consistency and potential performance.
            // New addition for Type III.
            selectors: {
                previewContainer: '#rme-preview',
                previewContentIframe: '#rme-preview-content',
                contentTextArea: 'textarea#content',
                contentBodyClass: '.mceContentBody'
            },

            // Initializes the preview display.
            // Renamed from 'init' to 'setupPreviewPane'.
            setupPreviewPane: function() {
                // Ensure jQuery is available before proceeding.
                if (typeof $ === 'undefined') {
                    console.error('jQuery is not loaded. MkdnEditApp cannot initialize.');
                    return; // Guard clause - Type III addition.
                }

                // Create the iframe element for content display.
                // Replaced .html() with direct DOM manipulation for robustness.
                const previewZoneElement = $(this.selectors.previewContainer);
                if (previewZoneElement.length === 0) {
                    console.warn(`Preview container ${this.selectors.previewContainer} not found.`);
                    return; // Guard clause - Type III addition.
                }

                const iframeElement = $('<iframe>', {
                    id: this.selectors.previewContentIframe.substring(1), // Remove '#'
                    src: 'about:blank',
                    frameborder: '0', // Added for clarity - Type III update.
                    scrolling: 'auto' // Added for clarity - Type III update.
                });
                previewZoneElement.empty().append(iframeElement); // Clear existing and append new.

                // Get the document object of the newly created iframe.
                const iframeDomElement = iframeElement.get(0);
                if (!iframeDomElement || !iframeDomElement.contentWindow) {
                    console.error('Failed to get iframe content window.');
                    return;
                }
                MkdnEditApp.displayManager.previewFrameDocument = iframeDomElement.contentWindow.document;

                // Prepare external CSS links for the iframe.
                // Renamed 'cssHTML' to 'styleLinkMarkup'.
                // Changed from jQuery.each to native Array.map and join.
                let styleLinkMarkup = MkdnEditApp.localizationData.customCSS
                    .map(url => `<link href="${url}" rel="stylesheet" type="text/css" media="all" />`) // Added media="all" - Type III update.
                    .join('\n');

                // Write the initial HTML structure into the iframe document.
                // Use template literals for cleaner string concatenation.
                const initialIframeContent = `
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Markdown Preview</title>
                        ${styleLinkMarkup}
                    </head>
                    <body class="mceContentBody" spellcheck="false">
                        <!-- Content will be dynamically inserted here -->
                    </body>
                    </html>
                `;

                const targetDoc = MkdnEditApp.displayManager.previewFrameDocument;
                targetDoc.open();
                targetDoc.write(initialIframeContent);
                targetDoc.close();

                // Attach mouse event listeners to the iframe document to propagate them to the parent.
                // Renamed variables, slightly rephrased.
                $(targetDoc).on('mousemove mouseup', function(eventObj) {
                    $(docContext).trigger(eventObj); // Propagate event to main document.
                });

                // Attach an event listener to the main content textarea for updates.
                // Changed event names for broader browser compatibility.
                $(this.selectors.contentTextArea).on('input propertychange keyup paste', MkdnEditApp.displayManager.refreshDisplayContent);

                // Perform an initial content update.
                MkdnEditApp.displayManager.refreshDisplayContent();
            },

            // Updates the content shown in the preview iframe.
            // Renamed from 'update' to 'refreshDisplayContent'.
            refreshDisplayContent: function() {
                const sourceTextElement = $(MkdnEditApp.displayManager.selectors.contentTextArea);
                if (sourceTextElement.length === 0) {
                    console.warn(`Source text area ${MkdnEditApp.displayManager.selectors.contentTextArea} not found.`);
                    return;
                }
                const sourceMarkdown = sourceTextElement.val(); // Renamed 'raw' to 'sourceMarkdown'.

                // Check if 'marked' (markdown parser) is available. Guard clause - Type III addition.
                if (typeof marked !== 'function') {
                    console.error('Markdown parser (marked.js) is not available.');
                    MkdnEditApp.displayManager.updatePreviewBody('<div>Error: Markdown parser missing.</div>');
                    return;
                }

                // Convert markdown to HTML.
                const renderedHtmlOutput = marked(sourceMarkdown); // Renamed 'content' to 'renderedHtmlOutput'.

                // Update the iframe's body with the new HTML.
                MkdnEditApp.displayManager.updatePreviewBody(renderedHtmlOutput);

                // Trigger a custom event on the main document for word counting or other external processes.
                // Renamed event and variable.
                $(docContext).triggerHandler('app_word_count_update', [sourceMarkdown]);
            },

            // Helper function to update the iframe body. Type III addition.
            updatePreviewBody: function(htmlContent) {
                const iframeDoc = MkdnEditApp.displayManager.previewFrameDocument;
                if (!iframeDoc) {
                    console.warn('Preview iframe document not ready for update.');
                    return;
                }
                const bodyElement = $(MkdnEditApp.displayManager.selectors.contentBodyClass, iframeDoc);
                if (bodyElement.length === 0) {
                    console.warn('Preview iframe body element not found.');
                    return;
                }
                bodyElement.html(htmlContent);
            }
        },

        // Module responsible for resizing UI elements.
        // Renamed from 'resizer' to 'uiScaler'.
        uiScaler: {
            // Initializes the UI resizing functionality.
            // Renamed from 'init' to 'initializeScaling'.
            initializeScaling: function() {
                const resizeHandle = $('#content-resize-handle');
                if (resizeHandle.length === 0) {
                    console.warn('Resize handle #content-resize-handle not found.');
                    return;
                }
                resizeHandle.on('mousedown', MkdnEditApp.uiScaler.startResizeOperation);
                // Perform an initial adjustment of sizes.
                MkdnEditApp.uiScaler.handleResizeInProgress();
            },

            // Handles the resizing action while the mouse is moving.
            // Renamed from 'during' to 'handleResizeInProgress'.
            handleResizeInProgress: function(eventObject) {
                // Determine the target height based on the content textarea's current height.
                const sourceTextArea = $('textarea#content');
                if (sourceTextArea.length === 0) {
                    console.warn('Source textarea for resizing not found.');
                    return;
                }
                const currentContentHeight = sourceTextArea.outerHeight();

                // Apply the new height to the preview pane and the CodeMirror editor container.
                // Changed selectors and direct style manipulation.
                $('#rme-preview, #wp-content-editor-container .CodeMirror').css('height', `${currentContentHeight}px`);

                // Prevent default drag behavior.
                return false;
            },

            // Cleans up after the mouse button is released, ending the resize.
            // Renamed from 'after' to 'finalizeScaling'.
            finalizeScaling: function(eventObject) {
                // Unbind the mousemove event from the document.
                $(docContext).off('mousemove', MkdnEditApp.uiScaler.handleResizeInProgress);
                // Prevent default behavior.
                return false;
            },

            // Initiates the resize process on mousedown.
            // Renamed from 'handler' to 'startResizeOperation'.
            startResizeOperation: function(eventObject) {
                // Bind mousemove to the resizing handler and mouseup to the finalizer.
                $(docContext).on('mousemove', MkdnEditApp.uiScaler.handleResizeInProgress).on('mouseup', MkdnEditApp.uiScaler.finalizeScaling);
                // Prevent default drag behavior.
                return false;
            }
        },

        // Localization data, dynamically loaded.
        // Renamed from 'localize' to 'localizationData'.
        localizationData: {}
    };

    // Assign the global localization settings to our app's localization data.
    // Renamed from 'rotormdLocalize' to 'globalAppLocalizationConfig'.
    MkdnEditApp.localizationData = typeof globalAppLocalizationConfig !== 'undefined' ? globalAppLocalizationConfig : {};


    // Main execution block when the DOM is ready.
    // Changed jQuery(function($){...}) to a more explicit document ready handler.
    $(docContext).ready(function() {
        // Reference to the primary content input element.
        // Renamed 'textarea' to 'mainContentInput'.
        const mainContentInput = $(MkdnEditApp.displayManager.selectors.contentTextArea);
        if (mainContentInput.length === 0) {
            console.error('Critical: Main content textarea not found. Editor cannot initialize.');
            return;
        }

        // Configuration options for the CodeMirror editor instance.
        // Renamed 'options' to 'editorConfig'.
        const editorConfig = {
            // Callback function triggered when the editor's content changes.
            // Renamed 'onChange' to 'contentModifiedCallback'.
            // Renamed 'cm' parameter to 'editorInstance'.
            contentModifiedCallback: function(editorInstance) {
                // Update the hidden textarea with the CodeMirror content.
                mainContentInput.val(editorInstance.getValue());
                // Trigger an update of the preview pane.
                MkdnEditApp.displayManager.refreshDisplayContent();
            },
            mode: 'gfm', // Changed 'markdown' to 'gfm' (GitHub Flavored Markdown) - Type III update.
            lineNumbers: true, // Added line numbers - Type III addition.
            matchBrackets: true,
            lineWrapping: true,
            indentWithTabs: true,
            tabSize: 4, // Added tab size - Type III addition.
            theme: 'default' // Added theme - Type III addition.
        };

        // Initialize the CodeMirror editor on the textarea element.
        // Renamed 'syntaxhinter' to 'codeMirrorInstance'.
        const codeMirrorInstance = CodeMirror.fromTextArea(mainContentInput.get(0), {
            onChange: editorConfig.contentModifiedCallback, // Use the defined callback.
            mode: editorConfig.mode,
            lineNumbers: editorConfig.lineNumbers,
            matchBrackets: editorConfig.matchBrackets,
            lineWrapping: editorConfig.lineWrapping,
            indentWithTabs: editorConfig.indentWithTabs,
            tabSize: editorConfig.tabSize,
            theme: editorConfig.theme
        });

        // Initialize the application's components.
        MkdnEditApp.displayManager.setupPreviewPane();
        MkdnEditApp.uiScaler.initializeScaling();
    });

    // Make the main application object globally accessible under a different name.
    // Renamed from RotorMD to MkdnEditAppGlobal.
    // Added for potential external interaction.
    window.MkdnEditAppGlobal = MkdnEditApp;

})(document); // Pass document context for consistency.
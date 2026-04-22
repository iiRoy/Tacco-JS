// This module manages the display and configuration of visual media assets within the content editor.
// It provides functionality to select media from a digital asset manager and configure its properties.

// Ensure ContentComposer namespace exists
if (typeof ContentComposer === 'undefined') {
    ContentComposer = {};
}
if (typeof ContentComposer.Modules === 'undefined') {
    ContentComposer.Modules = {};
}

ContentComposer.Modules.VisualMediaModule = (function() {

    // Internal utility for generating the editor's structural HTML.
    // This template defines the input fields for media properties and the display area for the asset.
    const editorLayoutGenerator = String.raw`
        <div class="media-properties-wrapper">
            <label for="asset-width-input" class="st-label-text">Width:</label>
            <input id="asset-width-input" name="assetWidth" placeholder="Asset width" class="st-input-string js-width-control" type="text" aria-label="Image width in pixels or percentage" />

            <label for="asset-height-input" class="st-label-text">Height:</label>
            <input id="asset-height-input" name="assetHeight" placeholder="Asset height" class="st-input-string js-height-control" type="text" aria-label="Image height in pixels" />

            <label for="asset-alignment-select" class="st-label-text">Alignment:</label>
            <select id="asset-alignment-select" name="assetAlignment" class="js-alignment-control" aria-label="Image alignment">
                <option value="">Select Alignment</option>
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
            </select>
        </div>
        <div class="media-preview-container">
            <img class="media-asset-display" alt="Preview of selected media asset" />
        </div>
    `;

    // A simple debounce function to limit how often a function is called.
    // Useful for input change events.
    const debounce = (func, delay) => {
        let timeout;
        return function(...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), delay);
        };
    };

    // Main module definition, extending a hypothetical base media module.
    // It's crucial that ContentComposer.Modules.BaseMedia exists.
    if (!ContentComposer.Modules.BaseMedia) {
        console.warn("ContentComposer.Modules.BaseMedia is not defined. VisualMediaModule might not function correctly.");
        // Fallback to a basic extendable object if BaseMedia is missing
        ContentComposer.Modules.BaseMedia = ContentComposer.Modules.BaseMedia || {
            extend: function(protoProps) {
                const Parent = this;
                const Child = function() {
                    if (Parent.prototype.constructor) {
                        Parent.prototype.constructor.apply(this, arguments);
                    }
                };
                Child.prototype = Object.create(Parent.prototype);
                Object.assign(Child.prototype, protoProps);
                Child.prototype.constructor = Child;
                Child.extend = Parent.extend; // Allow further extension
                return Child;
            }
        };
    }

    return ContentComposer.Modules.BaseMedia.extend({

        moduleIdentifier: "visual_media", // Unique identifier for this content module

        // Generates the HTML structure for the module's editor interface.
        getEditorMarkup: function() {
            return editorLayoutGenerator;
        },

        // Populates the module's UI elements with existing data.
        initializeModuleWithData: function(modulePayload) {
            if (!modulePayload || !modulePayload.assetDetails) {
                console.warn("Attempted to load visual media with empty or invalid payload.");
                return; // Guard clause
            }

            const assetDisplayElement = this.$('.media-asset-display');
            const widthControl = this.$('.js-width-control');
            const heightControl = this.$('.js-height-control');
            const alignmentControl = this.$('.js-alignment-control');
            const previewContainer = this.$('.media-preview-container');

            const {
                assetDetails,
                assetWidth,
                assetHeight,
                assetAlignment
            } = modulePayload;

            // Set the image source and dimensions
            if (assetDetails.assetUri) {
                assetDisplayElement.attr('src', assetDetails.assetUri);
            }
            if (assetWidth) {
                assetDisplayElement.attr('width', assetWidth);
                widthControl.val(assetWidth);
            }
            if (assetHeight) {
                assetDisplayElement.attr('height', assetHeight);
                heightControl.val(assetHeight);
            }

            // Set alignment, defaulting to 'center' if not specified
            const effectiveAlignment = assetAlignment || 'center';
            alignmentControl.val(effectiveAlignment);
            previewContainer.css('text-align', effectiveAlignment);
        },

        // Executed once the module's DOM elements are rendered and ready.
        onModuleReady: function() {
            const selfInstance = this; // Capture 'this' for use in event handlers

            // Select relevant control elements
            const $controlElements = selfInstance.$moduleControls; // Assuming $moduleControls is available from BaseMedia
            const $mediaPickerButton = $controlElements.find('.st-block-control--browse-media'); // Assuming a button with this class

            // Check if the asset manager is available
            if (typeof digitalAssetManager === 'undefined' || typeof digitalAssetManager.launchPicker !== 'function') {
                console.error("Digital Asset Manager (digitalAssetManager) is not available or missing launchPicker method. Media selection will not work.");
                return;
            }

            // Setup media picker button listener
            if ($mediaPickerButton.length) {
                // Remove any pre-existing placeholder or icon immediately preceding the button, if present.
                // This implies a cleaner UI setup where the button is self-contained.
                // The original code had `prev().remove()`, which is omitted here for simplicity
                // assuming the UI is designed without such preceding elements, or they are handled differently.

                $mediaPickerButton[0].addEventListener('click', (eventObject) => {
                    eventObject.preventDefault(); // Prevent default button action

                    digitalAssetManager.launchPicker((selectedUri) => {
                        if (selectedUri && typeof selectedUri === 'string' && selectedUri.trim().length > 0) {
                            console.log("Media asset selected:", selectedUri);
                            const updatedAssetData = {
                                assetDetails: {
                                    assetUri: selectedUri,
                                }
                            };
                            selfInstance.applyAndRenderData(updatedAssetData); // Update and re-render with new asset
                            selfInstance.signalReady(); // Indicate the module is ready with new data
                        } else {
                            console.warn("No valid media URI was returned from the asset picker.");
                        }
                    }, 'image_asset'); // Specify asset type for picker
                });
            } else {
                console.warn("Media picker button not found in module controls.");
            }

            // Setup input change listeners with debounce for performance
            const inputChangeHandler = (targetElement) => {
                // In a real scenario, this would trigger a data update to the module's internal state
                // and potentially re-render parts of the module.
                // For this Type III clone, we'll just log and indicate a change.
                console.log(`Input changed: ${targetElement.name} = ${targetElement.value}`);
                // Example: selfInstance.updateData({ [targetElement.name]: targetElement.value });
            };

            const debouncedInputChange = debounce(inputChangeHandler, 300);

            // Attach listeners to all text inputs and select elements
            selfInstance.$inputs.find('input[type="text"], select').each((_index, element) => {
                element.addEventListener('change', (eventObject) => {
                    debouncedInputChange(eventObject.currentTarget);
                });
            });

            console.info("VisualMediaModule is fully initialized and ready for user interaction.");
        },

        // Placeholder for a method that would update the module's data and re-render.
        // This is a new addition to clarify the flow.
        applyAndRenderData: function(newData) {
            // Merge new data with existing data
            const currentData = this.getData(); // Assuming getData() exists in BaseMedia
            const mergedData = { ...currentData,
                ...newData
            };
            this.setData(mergedData); // Assuming setData() exists in BaseMedia
            this.initializeModuleWithData(mergedData); // Re-render the UI with updated data
        },

        // Placeholder for signaling readiness.
        signalReady: function() {
            // This might trigger a UI update or state change in the parent editor.
            console.log("VisualMediaModule signaled readiness.");
        }
    });

})();
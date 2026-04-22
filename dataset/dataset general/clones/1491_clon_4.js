(function (jq, win, undef) {

    const imageLoaderPluginName = 'imageLoader';

    const obtainDefaultSettings = () => ({
        sourceAttribute: 'src', // Corresponds to 'data' in original
        hideIfMissingSource: true, // Corresponds to 'hideIfNoData' in original
        onAssetProcessed: null, // Corresponds to 'each' in original
        onAllAssetsProcessed: null // Corresponds to 'all' in original
    });

    class ImageAssetProcessor {
        constructor(initialElements, userSettings) {
            this.initialElements = Array.from(initialElements); // Convert jQuery collection to native array
            this.settings = Object.assign(obtainDefaultSettings(), userSettings); // Deep merge with defaults

            this.processableElements = []; // Elements that will be processed (have data attribute)
            this.prepareSourceElements(); // Filter and hide elements without data
            this.beginAssetLoading(); // Start the asynchronous loading process
        }

        prepareSourceElements() {
            this.processableElements = this.initialElements.filter(originalElement => {
                const imageDataValue = jq(originalElement).data(this.settings.sourceAttribute);
                if (imageDataValue) {
                    return true; // Keep this element for processing
                } else {
                    if (this.settings.hideIfMissingSource) {
                        jq(originalElement).hide(); // Hide if no data attribute and setting is true
                    }
                    return false; // Exclude from processing
                }
            });
        }

        beginAssetLoading() {
            // Handle case where no elements are found or all are filtered out
            if (this.processableElements.length === 0) {
                if (typeof this.settings.onAllAssetsProcessed === 'function') {
                    this.settings.onAllAssetsProcessed.call([]); // Call 'all' callback with an empty array
                }
                return;
            }

            const loadingPromises = this.processableElements.map(originalElement => {
                return new Promise(resolve => {
                    const imageSourcePath = jq(originalElement).data(this.settings.sourceAttribute);
                    const newRenderedImage = new Image(); // Create a native Image object

                    newRenderedImage.onload = () => {
                        this.transferAndSwap(originalElement, newRenderedImage);
                        jq.data(originalElement, 'assetLoadSuccess', true); // Store status on original element
                        if (typeof this.settings.onAssetProcessed === 'function') {
                            this.settings.onAssetProcessed.call(newRenderedImage); // Call 'each' callback
                        }
                        resolve({ status: 'fulfilled', original: originalElement, success: true });
                    };

                    newRenderedImage.onerror = () => {
                        this.transferAndSwap(originalElement, newRenderedImage); // Still swap even on error, as per original logic
                        jq.data(originalElement, 'assetLoadSuccess', false); // Store status on original element
                        if (typeof this.settings.onAssetProcessed === 'function') {
                            this.settings.onAssetProcessed.call(newRenderedImage); // Call 'each' callback
                        }
                        resolve({ status: 'fulfilled', original: originalElement, success: false }); // Resolve, not reject, to use Promise.allSettled
                    };

                    newRenderedImage.src = imageSourcePath;
                });
            });

            // Wait for all image loading promises to settle (either fulfilled or rejected/resolved with status)
            Promise.allSettled(loadingPromises).then(results => {
                const successfullyLoadedOriginals = results
                    .filter(res => res.status === 'fulfilled' && res.value.success)
                    .map(res => res.value.original);

                if (typeof this.settings.onAllAssetsProcessed === 'function') {
                    this.settings.onAllAssetsProcessed.call(successfullyLoadedOriginals); // Call 'all' callback
                }
            });
        }

        transferAndSwap(originalElement, newImage) {
            // Transfer all attributes from the original element to the new image, except 'src'
            Array.from(originalElement.attributes).forEach(attr => {
                if (attr.name !== 'src') { // Exclude 'src' as it's already set on newImage
                    newImage.setAttribute(attr.name, attr.value);
                }
            });

            // Replace the original element with the newly loaded image
            jq(originalElement).replaceWith(newImage);
        }
    }

    // Define the jQuery plugin entry point
    jq.fn[imageLoaderPluginName] = function (userOptions) {
        // Ensure only one instance of the processor is created for a given jQuery collection
        const instanceIdentifier = 'imageProcessorInstance_' + imageLoaderPluginName;
        // Store instance on the first element of the collection to represent the entire set
        if (!jq.data(this[0], instanceIdentifier)) {
            jq.data(this[0], instanceIdentifier, new ImageAssetProcessor(this, userOptions));
        }
        return this; // Maintain jQuery chainability
    };

}(jQuery, window));
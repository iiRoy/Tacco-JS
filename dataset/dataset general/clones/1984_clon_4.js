(function() {
    'use strict';

    const globalConfiguration = (function() {
        const setupMetadata = document.head.querySelector('meta[name="responsimage"]');
        const defaultPlaceholder = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'; // Transparent GIF
        const defaultLoader = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'; // Transparent GIF

        if (!setupMetadata) {
            // Fallback to default values if meta tag is missing
            return {
                remoteServiceURL: '',
                staticImageAsset: defaultPlaceholder,
                loadingIndicatorAsset: defaultLoader,
                delayThreshold: 100
            };
        }
        return {
            remoteServiceURL: setupMetadata.dataset.server || '',
            staticImageAsset: setupMetadata.dataset.static || defaultPlaceholder,
            loadingIndicatorAsset: setupMetadata.dataset.loading || defaultLoader,
            delayThreshold: parseInt(setupMetadata.dataset.limit, 10) || 100
        };
    })();

    function regulateFrequency(operationToPerform, intervalMillis) {
        let executionTimer = null;
        let lastSuccessfulExecutionTime = 0;
        let invocationContext, invocationArguments, lastResult;

        const performDelayedExecution = () => {
            lastSuccessfulExecutionTime = Date.now();
            executionTimer = null;
            lastResult = operationToPerform.apply(invocationContext, invocationArguments);
        };

        return function() {
            const currentCallTime = Date.now();
            const timeElapsedSinceLast = currentCallTime - lastSuccessfulExecutionTime;
            invocationContext = this;
            invocationArguments = arguments;

            if (timeElapsedSinceLast >= intervalMillis || lastSuccessfulExecutionTime === 0) {
                // Execute immediately if enough time has passed or it's the first call
                if (executionTimer) {
                    clearTimeout(executionTimer);
                    executionTimer = null;
                }
                lastSuccessfulExecutionTime = currentCallTime;
                lastResult = operationToPerform.apply(invocationContext, invocationArguments);
            } else if (!executionTimer) {
                // Otherwise, schedule a future execution if not already scheduled
                executionTimer = setTimeout(performDelayedExecution, intervalMillis - timeElapsedSinceLast);
            }
            return lastResult; // Return the result of the last actual execution
        };
    }

    function refreshVisualComponents(initialLoadFlag) {
        const allRelevantElements = Array.from(document.querySelectorAll('[data-responsimage]'));

        allRelevantElements.forEach(currentElement => {
            const isAnImageTag = currentElement.tagName === 'IMG';
            const resourceName = currentElement.dataset.responsimage;
            const anchorPoint = currentElement.dataset.responsimageAnchor || '5';
            const backgroundAlignment = currentElement.dataset.responsimageBackgroundPosition || 'center';

            let componentWidth, componentHeight;

            // Determine dimensions based on element type
            if (isAnImageTag) {
                componentWidth = currentElement.clientWidth;
                componentHeight = currentElement.clientHeight;
            } else {
                // For non-IMG elements, use parent's dimensions
                componentWidth = currentElement.parentNode ? currentElement.parentNode.clientWidth : 0;
                componentHeight = currentElement.parentNode ? currentElement.parentNode.clientHeight : 0;
            }

            // Apply initial static placeholder for IMG tags during first run
            if (initialLoadFlag && isAnImageTag) {
                currentElement.setAttribute('src', globalConfiguration.staticImageAsset);
            }

            // Display loading graphic via background style
            currentElement.style.background = `url(${globalConfiguration.loadingIndicatorAsset}) no-repeat center`;
            currentElement.style.backgroundSize = 'auto'; // Reset explicit background-size

            // Detect high-DPI displays using a CSS font-family hack
            if (window.getComputedStyle(currentElement).fontFamily === 'pixel-ratio-2') {
                componentWidth *= 2;
                componentHeight *= 2;
            }

            // Construct the final image URL using template replacement
            let finalRenderedImageUrl = globalConfiguration.remoteServiceURL
                .replace('width', componentWidth)
                .replace('height', componentHeight)
                .replace('anchor', anchorPoint)
                .replace('filename', resourceName);

            // Load and apply the responsive image if not disabled
            if (resourceName !== 'disabled') {
                if (isAnImageTag) {
                    currentElement.setAttribute('src', finalRenderedImageUrl);
                } else {
                    // For background images, use a temporary Image object to preload
                    const temporaryImageProcessor = new Image();
                    temporaryImageProcessor.onload = function() {
                        currentElement.style.backgroundImage = `url(${finalRenderedImageUrl})`;
                        currentElement.style.backgroundSize = 'cover';
                        currentElement.style.backgroundPosition = backgroundAlignment;
                        temporaryImageProcessor.src = ''; // Clear source to potentially release memory/resources
                    };
                    temporaryImageProcessor.src = finalRenderedImageUrl;
                }
            }
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        refreshVisualComponents(true); // Execute on page load with initial setup flag

        const rateLimitedProcessor = regulateFrequency(refreshVisualComponents, globalConfiguration.delayThreshold);

        window.addEventListener('resize', rateLimitedProcessor);

        // Handle orientation changes with a slight delay to allow layout to settle
        window.addEventListener('orientationchange', () => {
            setTimeout(() => refreshVisualComponents(false), 0);
        });
    });

})();
const FeatureProbe = (function() {
    // This module inspects the current browser environment
    // to determine support for key web technologies.
    // Original authors: alteredq, mr.doob (via three.js Detector)
    // Refactored for Type III clone generation.

    /**
     * Helper to robustly check for the existence of a global object.
     * @param {string} globalName - The name of the global object (e.g., 'Worker').
     * @returns {boolean} True if the global object exists and is not null/undefined.
     */
    const checkGlobalExistence = (globalName) => typeof window[globalName] !== 'undefined' && window[globalName] !== null;

    return {
        /**
         * Indicates if the browser supports 2D Canvas rendering.
         * @type {boolean}
         */
        has2DCanvasSupport: Boolean(window.CanvasRenderingContext2D),

        /**
         * Determines if the browser and graphics hardware support WebGL.
         * This check attempts to create a WebGL rendering context.
         * @type {boolean}
         */
        supportsWebGL: (function() {
            try {
                // We create a temporary canvas element to test WebGL context creation.
                const testCanvasElement = document.createElement('canvas');
                // First, check if the WebGLRenderingContext interface exists globally.
                const isWebGLEnabled = !!window.WebGLRenderingContext;

                if (!isWebGLEnabled) {
                    return false; // No WebGL API available in the browser.
                }

                // Attempt to get a 'webgl' or 'experimental-webgl' context.
                // The double-negation converts the context object (or null) to a boolean.
                return Boolean(testCanvasElement.getContext('webgl') || testCanvasElement.getContext('experimental-webgl'));
            } catch (err) {
                // If any error occurs during context creation (e.g., security error), WebGL is not supported.
                console.error("Error during WebGL capability check:", err);
                return false;
            }
        })(),

        /**
         * Checks if the browser environment supports Web Workers for parallel execution.
         * @type {boolean}
         */
        canUseWebWorkers: checkGlobalExistence('Worker'),

        /**
         * Verifies the availability of the File API (File, FileReader, FileList, Blob).
         * @type {boolean}
         */
        hasFileAPIs: (function() {
            // All four components must be present for full File API support.
            const supportsFileInterface = checkGlobalExistence('File');
            const supportsFileReaderInterface = checkGlobalExistence('FileReader');
            const supportsFileListInterface = checkGlobalExistence('FileList');
            const supportsBlobInterface = checkGlobalExistence('Blob');
            return supportsFileInterface && supportsFileReaderInterface && supportsFileListInterface && supportsBlobInterface;
        })(),

        /**
         * Generates a styled HTML DIV element containing an error message
         * if WebGL is not supported. The message content varies based on
         * whether the browser or the graphics card is the limiting factor.
         * @returns {HTMLDivElement} An HTML div with the WebGL error message, or an empty div if WebGL is supported.
         */
        craftWebGLProblemDisplay: function() {
            const notificationDiv = document.createElement('div');
            notificationDiv.id = 'webgl-issue-alert-panel'; // Unique ID for the message container.

            // Apply a set of predefined styles to the warning message div.
            Object.assign(notificationDiv.style, {
                fontFamily: 'Arial, sans-serif',
                fontSize: '0.95em',
                fontWeight: '400',
                textAlign: 'center',
                backgroundColor: '#f9f9f9',
                color: '#444',
                padding: '22px 28px',
                maxWidth: '480px',
                margin: '65px auto 0',
                border: '1px solid #ddd',
                borderRadius: '5px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            });

            // If WebGL is supported, return an empty div as no error message is needed.
            if (this.supportsWebGL) {
                return notificationDiv;
            }

            const baseLinkStyle = 'color:#007bff; text-decoration:none;';
            const webglInfoLink = `<a href="https://www.khronos.org/webgl/wiki/Getting_a_WebGL_Implementation" style="${baseLinkStyle}">WebGL</a>`;
            const getWebGLLink = `<a href="https://get.webgl.org/" style="${baseLinkStyle}">here</a>`;

            let diagnosticMessage = '';

            // Determine the specific reason for WebGL unavailability.
            if (window.WebGLRenderingContext) {
                // WebGL API exists, but context creation failed (likely graphics card issue).
                diagnosticMessage = `
                    It appears your graphics hardware does not support ${webglInfoLink}.<br/><br/>
                    Please ensure your display drivers are up to date.<br/>
                    Find out how to get it ${getWebGLLink}.
                `;
            } else {
                // WebGL API itself is not available in the browser.
                diagnosticMessage = `
                    Your current web browser lacks support for ${webglInfoLink}.<br/><br/>
                    Consider upgrading to a modern browser version.<br/>
                    Find out how to get it ${getWebGLLink}.
                `;
            }

            // Assign the constructed HTML message to the div.
            notificationDiv.innerHTML = diagnosticMessage;

            return notificationDiv;
        },

        /**
         * Appends the WebGL warning message to a specified parent element
         * or to the document body if no parent is provided.
         * @param {object} [opts] - Configuration options for the message display.
         * @param {HTMLElement} [opts.targetContainer=document.body] - The DOM element to append the warning message to.
         * @param {string} [opts.displayIdentifier='webgl-legacy-alert'] - The ID to assign to the warning message element.
         * @returns {void}
         */
        displayWebGLWarning: function(opts) {
            // Define default configuration options.
            const defaultSettings = {
                targetContainer: document.body,
                displayIdentifier: 'webgl-legacy-alert'
            };

            // Merge user-provided options with defaults.
            const activeSettings = { ...defaultSettings, ...opts };

            const targetContainer = activeSettings.targetContainer;
            const displayIdentifier = activeSettings.displayIdentifier;

            // Validate the target container before proceeding.
            if (!targetContainer || typeof targetContainer.appendChild !== 'function') {
                console.error('FeatureProbe: Cannot append WebGL warning. Invalid target container provided or missing appendChild method.');
                return;
            }

            // Prevent adding the same warning multiple times.
            if (document.getElementById(displayIdentifier)) {
                console.info('FeatureProbe: WebGL warning message already present on the page.');
                return;
            }

            // Generate the WebGL warning message element.
            const warningElement = this.craftWebGLProblemDisplay();
            warningElement.id = displayIdentifier; // Assign the specified ID.

            // Append the warning message to the chosen container.
            targetContainer.appendChild(warningElement);

            // Optional: Log a message to the console for debugging purposes.
            if (!this.supportsWebGL) {
                console.warn('FeatureProbe: WebGL is not supported on this device. Displaying warning message.');
            }
        }
    };
})();
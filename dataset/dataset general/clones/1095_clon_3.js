(function( jQ ){
    // Core settings for the file upload functionality.
    // These defaults can be overridden by user-provided options during plugin initialization.
    const DEFAULT_OPTIONS = {
        initCallback         : null, // Callback fired upon plugin initialization
        startCallback        : null, // Callback fired when an upload process begins
        completeCallback     : null, // Callback fired when an upload process finishes successfully
        errorCallback        : null, // Callback fired when an error occurs during upload
        preUploadFilter      : null, // Custom function to validate file before upload
        initialGuidance      : 'Drag files here or click to select', // Message displayed when dropzone is empty
        dragOverPrompt       : 'Drop your files now!', // Message displayed when files are dragged over
        unsupportedApiMsg    : 'Your browser does not support the File API. Please update.', // Message for unsupported browsers
        invalidFileTypeMsg   : 'Unsupported file type!', // Message for files that don't match allowed types
        uploadCompleteMsg    : 'Upload successful!', // Message shown after successful upload
        maxFileSizeMegaBytes : 10,   // Maximum allowed file size in MB
        wrapTargetContainer  : false, // If true, wraps the target element in a new container
        enableClickToSelect  : true,  // If true, clicking the dropzone will trigger the file input
        allowedFileTypesRegex: null, // Regex string for allowed file types (e.g., 'image/(png|jpeg)')
        csrfTokenMetaName    : 'x-csrf-token', // Meta tag name for CSRF token
        uploadFieldName      : 'file' // The name of the form field for the file upload
    };

    /**
     * Helper to safely get option values, falling back to defaults.
     * @param {object} settings - The current instance settings.
     * @param {string} key - The key of the option to retrieve.
     * @returns {*} The option value.
     */
    const getOption = (settings, key) => settings[key] !== undefined ? settings[key] : DEFAULT_OPTIONS[key];

    /**
     * Centralized message display utility.
     * @param {jQuery} displayElement - The element where messages should be shown.
     * @param {string} message - The message text.
     * @param {string} [className=''] - Optional class to add to the message element.
     */
    const displayZoneMessage = (displayElement, message, className = '') => {
        displayElement.removeClass('dropzone-active upload-complete-status error-message').html(message);
        if (className) {
            displayElement.addClass(className);
        }
    };

    /**
     * Generates a unique identifier.
     * @returns {string} A unique ID string.
     */
    const generateUniqueId = () => `dropzone-${Math.random().toString(36).substr(2, 9)}`;

    // Collection of internal methods and utility functions
    const utilityHandlers = {
        /**
         * Initializes plugin-specific setup for a dropzone instance.
         * @param {object} instanceData - Object containing instance-specific data (area, input, settings).
         */
        initializePlugin: function(instanceData){
            const { targetArea, hiddenInputElem, instanceSettings } = instanceData;

            // Ensure necessary browser APIs are supported
            if (!window.FileReader || !window.XMLHttpRequest) {
                displayZoneMessage(instanceData.guidanceDisplay, getOption(instanceSettings, 'unsupportedApiMsg'), 'error-message');
                return;
            }

            // Execute custom initialization callback if provided
            if (typeof getOption(instanceSettings, 'initCallback') === 'function') {
                getOption(instanceSettings, 'initCallback').call(targetArea, instanceData);
            }
        },

        /**
         * Signals the start of an upload operation.
         * @param {object} instanceData - Object containing instance-specific data.
         */
        beginOperation: function(instanceData){
            const { targetArea, instanceSettings } = instanceData;
            // Clear any existing messages or previews
            targetArea.children('.upload-progress-container, .dropzone-guidance, .preview-image').remove();

            if (typeof getOption(instanceSettings, 'startCallback') === 'function') {
                getOption(instanceSettings, 'startCallback').call(targetArea, instanceData);
            }
        },

        /**
         * Signals the completion of an upload operation.
         * @param {object} instanceData - Object containing instance-specific data.
         * @param {object} resultData - The result object from the server.
         * @param {File} processedFile - The file that was uploaded.
         */
        finalizeProcess: function(instanceData, resultData, processedFile){
            const { targetArea, instanceSettings } = instanceData;
            const progressContainer = targetArea.find('.upload-progress-container');

            progressContainer.addClass('upload-complete-status');
            displayZoneMessage(progressContainer, getOption(instanceSettings, 'uploadCompleteMsg'), 'upload-complete-status');
            progressContainer.fadeOut('slow', function() { jQ(this).remove(); }); // Fade out and remove

            if (typeof getOption(instanceSettings, 'completeCallback') === 'function') {
                getOption(instanceSettings, 'completeCallback').call(targetArea, resultData, processedFile, instanceData);
            }
        },

        /**
         * Updates the visual progress bar display.
         * @param {object} instanceData - Object containing instance-specific data.
         * @param {number} currentPercentage - The percentage of completion (0-100).
         */
        updateProgressDisplay: function(instanceData, currentPercentage){
            const { targetArea, instanceSettings } = instanceData;
            const progressBarElement = targetArea.find('.progress-indicator-bar');
            const progressContainer = targetArea.find('.upload-progress-container');

            progressBarElement.css({
                'height': `${currentPercentage}%`,
                'line-height': `${(targetArea.height() * currentPercentage / 100)}px`,
                'vertical-align': 'middle'
            });
            progressBarElement.find('span').text(`${currentPercentage}%`);

            // Allow custom progress callback
            if (typeof getOption(instanceSettings, 'progressCallback') === 'function') {
                getOption(instanceSettings, 'progressCallback').call(targetArea, currentPercentage, progressContainer, instanceData);
            }
        },

        /**
         * Handles and displays upload-related errors.
         * @param {object} instanceData - Object containing instance-specific data.
         * @param {object} serverResponse - The error response or object.
         */
        handleUploadError: function(instanceData, serverResponse){
            const { targetArea, hiddenInputElem, guidanceDisplay, instanceSettings } = instanceData;
            const errorMessage = serverResponse.error || 'An unknown error occurred.';

            console.error('File Upload Error:', errorMessage, serverResponse);

            // Remove progress bar if it exists
            targetArea.find('.upload-progress-container').remove();
            // Display error message in the guidance area
            displayZoneMessage(guidanceDisplay, `Error: ${errorMessage}`, 'error-message');

            if (typeof getOption(instanceSettings, 'errorCallback') === 'function') {
                getOption(instanceSettings, 'errorCallback').call(targetArea, serverResponse, hiddenInputElem, instanceData);
            }
            return 0; // Indicate failure
        },

        /**
         * Custom pre-upload validation hook.
         * @param {object} instanceData - Object containing instance-specific data.
         * @param {File} uploadFile - The file to be checked.
         * @returns {boolean} True if validation passes, false otherwise.
         */
        preUploadCheck: function(instanceData, uploadFile){
            const { targetArea, hiddenInputElem, instanceSettings } = instanceData;
            // Execute custom validation callback if provided
            if (typeof getOption(instanceSettings, 'preUploadFilter') === 'function') {
                return getOption(instanceSettings, 'preUploadFilter').call(targetArea, uploadFile, hiddenInputElem, instanceData);
            }
            return true; // Default to true if no custom filter
        },

        /**
         * Iterates through a list of files and processes each one.
         * @param {object} instanceData - Object containing instance-specific data.
         * @param {FileList} fileList - The list of files to process.
         */
        processInputFiles: function(instanceData, fileList){
            const { guidanceDisplay, instanceSettings } = instanceData;

            if (!fileList || fileList.length === 0) {
                displayZoneMessage(guidanceDisplay, getOption(instanceSettings, 'initialGuidance'));
                return;
            }

            // Optional: Limit total files or process only the first one
            const maxFilesAllowed = parseInt(getOption(instanceSettings, 'maxFiles'), 10) || 1;
            const filesToProcess = Array.from(fileList).slice(0, maxFilesAllowed);

            filesToProcess.forEach(singleFile => {
                utilityHandlers.validateAndRouteFile(instanceData, singleFile);
            });
        },

        /**
         * Validates a single file and routes it for resizing or direct upload.
         * @param {object} instanceData - Object containing instance-specific data.
         * @param {File} uploadFile - The file to validate and process.
         */
        validateAndRouteFile: function(instanceData, uploadFile){
            const { targetArea, hiddenInputElem, instanceSettings } = instanceData;

            // --- File type validation ---
            const allowedTypesRegex = getOption(instanceSettings, 'allowedFileTypesRegex');
            if (allowedTypesRegex && !new RegExp(allowedTypesRegex, 'i').test(uploadFile.type)) {
                utilityHandlers.handleUploadError(instanceData, {
                    error: getOption(instanceSettings, 'invalidFileTypeMsg') + `: ${uploadFile.type}`
                });
                return;
            }

            // --- File size validation ---
            const maxAllowedSizeMB = parseFloat(getOption(instanceSettings, 'maxFileSizeMegaBytes'));
            if (isNaN(maxAllowedSizeMB) || uploadFile.size > (maxAllowedSizeMB * 1048576)) {
                utilityHandlers.handleUploadError(instanceData, {
                    error: `File exceeds maximum size: ${maxAllowedSizeMB}MB`
                });
                return;
            }

            // --- Custom pre-upload filter hook ---
            if (utilityHandlers.preUploadCheck(instanceData, uploadFile) === false) {
                // Pre-upload filter cancelled the upload, no error message needed unless filter provides one
                return;
            }

            // --- Image resizing logic ---
            const shouldResize = hiddenInputElem.data('resize-image'); // e.g., data-resize-image="true"
            if ((/image/i).test(uploadFile.type) && shouldResize) {
                utilityHandlers.scaleImageForUpload(instanceData, uploadFile);
            } else {
                utilityHandlers.executeFileUpload(instanceData, uploadFile);
            }
        },

        /**
         * Resizes an image file on the client-side using a canvas before uploading.
         * @param {object} instanceData - Object containing instance-specific data.
         * @param {File} originalFile - The original image file.
         */
        scaleImageForUpload: function(instanceData, originalFile){
            const { targetArea, hiddenInputElem, instanceSettings } = instanceData;
            const originalFileName = originalFile.name;

            const drawingCanvas = document.createElement("canvas");
            const imageObject = new Image();
            imageObject.crossOrigin = 'anonymous'; // Important for CORS if image is loaded from external source

            const targetWidth = parseInt(hiddenInputElem.data('max-width'), 10) || 0;
            const targetHeight = parseInt(hiddenInputElem.data('max-height'), 10) || 0;
            const shouldCrop = hiddenInputElem.data('crop-mode'); // e.g., data-crop-mode="true"

            const fileReader = new FileReader();
            fileReader.onloadend = function(eventObject) {
                imageObject.src = eventObject.target.result;

                imageObject.onload = function() {
                    let currentWidth = imageObject.width;
                    let currentHeight = imageObject.height;

                    // Calculate new dimensions respecting aspect ratio and max sizes
                    if ((targetWidth && currentWidth > targetWidth) || (targetHeight && currentHeight > targetHeight)) {
                        const aspectRatio = currentWidth / currentHeight;
                        if (shouldCrop) {
                            // Cropping logic (simplified, might need more robust implementation for specific crop types)
                            if (aspectRatio > (targetWidth / targetHeight)) { // Image is wider than target ratio
                                currentHeight = targetHeight;
                                currentWidth = targetHeight * aspectRatio;
                            } else { // Image is taller than target ratio
                                currentWidth = targetWidth;
                                currentHeight = targetWidth / aspectRatio;
                            }
                        } else {
                            // Scaling logic
                            if (aspectRatio >= 1 && targetWidth && (!targetHeight || targetWidth / aspectRatio <= targetHeight)) {
                                currentWidth = targetWidth;
                                currentHeight = targetWidth / aspectRatio;
                            } else if (targetHeight) {
                                currentHeight = targetHeight;
                                currentWidth = targetHeight * aspectRatio;
                            }
                        }
                    }

                    drawingCanvas.width = currentWidth;
                    drawingCanvas.height = currentHeight;
                    const canvasContext = drawingCanvas.getContext("2d");
                    canvasContext.drawImage(imageObject, 0, 0, currentWidth, currentHeight);

                    const imageDataUri = drawingCanvas.toDataURL("image/jpeg", 0.9); // Use JPEG with 90% quality

                    // Basic data integrity check
                    if (imageDataUri.length <= 6) { // Minimal check for valid data URI
                        utilityHandlers.handleUploadError(instanceData, {
                            error: 'Image conversion failed. Please try again.'
                        });
                        return;
                    } else {
                        // Convert Data URI to Blob for upload
                        const resizedFileBlob = utilityHandlers.convertDataUriToBinaryBlob(imageDataUri, 'image/jpeg');
                        // Attach original file name for server-side processing
                        Object.defineProperty(resizedFileBlob, 'name', { value: originalFileName, writable: false });

                        // If 'data-upload-url' is present, proceed with upload
                        if (hiddenInputElem.data('upload-url')) {
                            utilityHandlers.executeFileUpload(instanceData, resizedFileBlob);
                        } else {
                            // If no upload URL, display the resized image as a preview
                            const previewImage = jQ('<img>').attr('src', imageDataUri).addClass('preview-image');
                            targetArea.children('.dropzone-guidance').remove(); // Remove guidance
                            targetArea.append(previewImage);

                            // Optional: Store the data URI in a hidden input for form submission
                            jQ('<input>')
                                .attr({
                                    'type': 'hidden',
                                    'name': hiddenInputElem.attr('name') || getOption(instanceSettings, 'uploadFieldName')
                                })
                                .val(imageDataUri)
                                .insertAfter(hiddenInputElem);
                            hiddenInputElem.prop('disabled', true); // Disable original input
                        }
                    }
                };
                imageObject.onerror = function() {
                    utilityHandlers.handleUploadError(instanceData, { error: 'Failed to load image for resizing.' });
                };
            };
            fileReader.onerror = function() {
                utilityHandlers.handleUploadError(instanceData, { error: 'Failed to read file data.' });
            };
            fileReader.readAsDataURL(originalFile);
        },

        /**
         * Executes the actual file upload via XMLHttpRequest.
         * @param {object} instanceData - Object containing instance-specific data.
         * @param {File|Blob} fileToUpload - The file or blob to send.
         */
        executeFileUpload: function(instanceData, fileToUpload){
            const { targetArea, hiddenInputElem, instanceSettings } = instanceData;
            utilityHandlers.beginOperation(instanceData); // Trigger start callback

            // Create and append a progress bar to the target area
            const progressContainer = jQ('<div class="upload-progress-container"><div class="progress-indicator-bar"><span>0%</span></div></div>');
            targetArea.append(progressContainer);

            const ajaxRequest = new XMLHttpRequest();
            const uploadUrl = hiddenInputElem.data('upload-url');

            if (!uploadUrl) {
                utilityHandlers.handleUploadError(instanceData, { error: 'No upload URL specified.' });
                progressContainer.remove();
                return;
            }

            ajaxRequest.open("POST", uploadUrl, true);

            // Add CSRF token if available
            const csrfMetaName = getOption(instanceSettings, 'csrfTokenMetaName');
            const csrfToken = jQ(`meta[name="${csrfMetaName}"]`).attr('content');
            if (csrfToken) {
                ajaxRequest.setRequestHeader('X-CSRF-Token', csrfToken);
            }
            ajaxRequest.setRequestHeader("X-Requested-With", "XMLHttpRequest");

            // --- Progress event listener ---
            ajaxRequest.upload.addEventListener("progress", function (eventObject) {
                if (eventObject.lengthComputable) {
                    const bytesLoaded = Math.ceil((eventObject.loaded / eventObject.total) * 100);
                    utilityHandlers.updateProgressDisplay(instanceData, bytesLoaded);
                }
            }, false);

            // --- Load (completion) event listener ---
            ajaxRequest.addEventListener("load", function (eventObject) {
                if (eventObject.target.status >= 200 && eventObject.target.status < 300) {
                    let uploadResult;
                    try {
                        uploadResult = JSON.parse(eventObject.target.responseText);
                    } catch (e) {
                        uploadResult = { status: 'success', message: 'Upload completed, but response is not valid JSON.' };
                    }
                    utilityHandlers.finalizeProcess(instanceData, uploadResult, fileToUpload);
                } else {
                    utilityHandlers.handleUploadError(instanceData, {
                        error: eventObject.target.statusText || 'Server responded with an error.',
                        status: eventObject.target.status,
                        response: eventObject.target.responseText
                    });
                }
            }, false);

            // --- Error event listener ---
            ajaxRequest.addEventListener("error", function (eventObject) {
                utilityHandlers.handleUploadError(instanceData, {
                    error: 'Network error or server unreachable.',
                    event: eventObject
                });
            }, false);

            // --- Abort event listener ---
            ajaxRequest.addEventListener("abort", function () {
                utilityHandlers.handleUploadError(instanceData, { error: 'Upload was aborted.' });
            }, false);

            // Construct FormData payload
            const formDataPayload = new FormData();
            const uploadFieldAttributeName = hiddenInputElem.attr('name') || getOption(instanceSettings, 'uploadFieldName');

            // Append additional data attributes from the input element (excluding objects)
            jQ.each(hiddenInputElem.data(), function(key, value) {
                if (typeof value !== "object" && key !== 'upload-url' && key !== 'resize-image' && key !== 'max-width' && key !== 'max-height' && key !== 'crop-mode') {
                    formDataPayload.append(key, value);
                }
            });
            formDataPayload.append(uploadFieldAttributeName, fileToUpload, fileToUpload.name);

            // Send the data
            ajaxRequest.send(formDataPayload);
        },

        /**
         * Converts a Data URI string to a Blob object.
         * Uses modern Blob constructor.
         * @param {string} dataUri - The Data URI string (e.g., "data:image/png;base64,...").
         * @param {string} [defaultMimeType='application/octet-stream'] - Default MIME type if not found in data URI.
         * @returns {Blob} A Blob object.
         */
        convertDataUriToBinaryBlob: function(dataUri, defaultMimeType = 'application/octet-stream'){
            const parts = dataUri.split(',');
            const mimeMatch = parts[0].match(/:(.*?);/);
            const fileMimeType = mimeMatch ? mimeMatch[1] : defaultMimeType;
            const base64DecodedString = atob(parts[1]); // Decode base64

            const byteCharacters = base64DecodedString.split('').map(char => char.charCodeAt(0));
            const uint8Array = new Uint8Array(byteCharacters);

            return new Blob([uint8Array], { type: fileMimeType });
        }
    };

    /**
     * jQuery plugin definition for 'droparea'.
     * @param {object} [userOptions] - User-defined options to override defaults.
     * @returns {jQuery} The jQuery object for chaining.
     */
    jQ.fn.droparea = function(userOptions) {
        // Merge default options with user-provided options for this plugin invocation.
        // This creates a fresh options object for each plugin call, preventing global state modification.
        const currentInvocationOptions = jQ.extend({}, DEFAULT_OPTIONS, userOptions);

        return this.each(function(){
            const currentElement = jQ(this);
            let targetArea = currentElement;
            let hiddenInputElem = currentElement.is('input[type="file"]') ? currentElement : currentElement.children('input[type="file"]');

            // If no file input is found, attempt to create one
            if (hiddenInputElem.length === 0) {
                hiddenInputElem = jQ('<input type="file" style="position: absolute; top: -1000px; left: -1000px; width: 1px; height: 1px; overflow: hidden; opacity: 0;">');
                currentElement.append(hiddenInputElem);
            }

            // Prepare guidance display element
            let guidanceDisplay = currentElement.children('.dropzone-guidance');
            if (guidanceDisplay.length === 0) {
                guidanceDisplay = jQ('<div class="dropzone-guidance"></div>');
                currentElement.prepend(guidanceDisplay);
            }

            // Apply wrapper if configured
            if (getOption(currentInvocationOptions, 'wrapTargetContainer') === true) {
                const wrapperClasses = currentElement.attr('class') || '';
                const wrapper = jQ(`<div class="dropzone-wrapper ${wrapperClasses}"></div>`).insertAfter(currentElement);
                currentElement.appendTo(wrapper);
                targetArea = wrapper;
            }

            // Store instance-specific data for later retrieval in event handlers
            const instanceData = {
                targetArea       : targetArea,
                hiddenInputElem  : hiddenInputElem,
                guidanceDisplay  : guidanceDisplay,
                instanceSettings : currentInvocationOptions,
                originalElement  : currentElement // Reference to the element on which droparea was called
            };
            targetArea.data('dropareaInstance', instanceData); // Store instance data on the target area

            // Initial display message
            if (hiddenInputElem.data('initial-value') || targetArea.find('img.preview-image').length) {
                guidanceDisplay.empty(); // If there's a preview or initial value, clear instructions
            } else {
                displayZoneMessage(guidanceDisplay, getOption(currentInvocationOptions, 'initialGuidance'));
            }

            // Hide original input if click-to-select is enabled
            if (getOption(currentInvocationOptions, 'enableClickToSelect') === true) {
                hiddenInputElem.css({ position: 'absolute', top: '-1000px', left: '-1000px' });
            }

            // --- Event Bindings ---

            // Global drag events for visual feedback (on document to catch drags from outside)
            let dragCounter = 0; // To track nested drag events
            jQ(document).on({
                'dragleave.droparea': function (e) {
                    e.preventDefault();
                    dragCounter--;
                    if (dragCounter <= 0) {
                        targetArea.removeClass('dropzone-active');
                        if (!hiddenInputElem.data('initial-value') && !targetArea.find('img.preview-image').length) {
                            displayZoneMessage(guidanceDisplay, getOption(currentInvocationOptions, 'initialGuidance'));
                        } else {
                            guidanceDisplay.empty();
                        }
                    }
                },
                'drop.droparea': function (e) {
                    e.preventDefault();
                    dragCounter = 0; // Reset counter on drop
                    targetArea.removeClass('dropzone-active');
                    if (!hiddenInputElem.data('initial-value') && !targetArea.find('img.preview-image').length) {
                        displayZoneMessage(guidanceDisplay, getOption(currentInvocationOptions, 'initialGuidance'));
                    } else {
                        guidanceDisplay.empty();
                    }
                },
                'dragenter.droparea': function (e) {
                    e.preventDefault();
                    dragCounter++;
                    targetArea.addClass('dropzone-active');
                    displayZoneMessage(guidanceDisplay, getOption(currentInvocationOptions, 'dragOverPrompt'), 'dropzone-active');
                },
                'dragover.droparea': function (e) {
                    e.preventDefault();
                    // No need to update message on every dragover, handled by dragenter
                }
            });

            // Specific drop event on the target area
            this.addEventListener("drop", function (e) {
                e.preventDefault();
                const currentInstanceData = jQ(this).data('dropareaInstance');
                if (currentInstanceData) {
                    utilityHandlers.processInputFiles(currentInstanceData, e.dataTransfer.files);
                }
            }, false);

            // Click event to trigger hidden file input
            if (getOption(currentInvocationOptions, 'enableClickToSelect') === true) {
                targetArea.on('click.droparea', function(e) {
                    // Only trigger if click is not on the hidden input itself
                    if (e.target !== hiddenInputElem[0]) {
                        hiddenInputElem.trigger('click');
                    }
                });
            }

            // Change event for file input (manual selection)
            hiddenInputElem.on('change.droparea', function(e){
                const currentInstanceData = targetArea.data('dropareaInstance');
                if (currentInstanceData) {
                    utilityHandlers.processInputFiles(currentInstanceData, e.target.files);
                    // Clear input value to allow re-selection of the same file
                    jQ(this).val('');
                }
            });

            // Call initial plugin setup
            utilityHandlers.initializePlugin(instanceData);
        });
    };
})( jQuery );
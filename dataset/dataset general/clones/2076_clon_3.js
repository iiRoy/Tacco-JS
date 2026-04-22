(function (moduleFactory) {
    'use strict';
    // This module registers the File Upload UI widget.
    // It supports AMD (RequireJS) and traditional browser globals.
    if (typeof define === 'function' && define.amd) {
        // Asynchronous Module Definition (AMD) registration:
        define([
            'jquery',
            'tmpl', // Template engine dependency
            'load-image', // Image loading utility
            './jquery.fileupload-fp' // File processing base component
        ], moduleFactory);
    } else {
        // Global browser context:
        moduleFactory(
            window.jQuery,
            window.tmpl,
            window.loadImage
        );
    }
}(function (jq, templateEngine, imageLoader) {
    'use strict';

    // The user interface extension builds upon the base file processing (FP)
    // or fundamental file upload widget, providing full interactive capabilities.
    const baseUploadComponent = (jq.blueimpFileProcessor || jq.blueimp || {}).fileupload;

    if (!baseUploadComponent) {
        console.warn("Base file upload component not found. UI widget might not function correctly.");
        return; // Exit if the base component isn't available.
    }

    jq.widget('uploadNamespace.fileUploader', baseUploadComponent, {

        // Default configuration options for the UI widget.
        componentSettings: {
            // Should files begin uploading immediately after being added?
            initiateAutoUpload: false,
            // Maximum number of files permitted for upload at any given time.
            maxAllowedConcurrentFiles: undefined,
            // Upper bound for individual file size in bytes.
            maxAllowedFileSize: undefined,
            // Lower bound for individual file size in bytes.
            minAllowedFileSize: undefined,
            // Regex for acceptable file types (matches MIME type or file name).
            acceptableFileTypesRegex: /.*/i, // Allows all by default
            // Regex to identify image types suitable for preview generation.
            previewImageTypesRegex: /^image\/(gif|jpeg|png)$/,
            // Maximum size of an image file to generate a preview for.
            previewImageMaxBytes: 5 * 1024 * 1024, // 5 Megabytes
            // Desired maximum width for generated preview images.
            previewImageWidthLimit: 80,
            // Desired maximum height for generated preview images.
            previewImageHeightLimit: 80,
            // Render previews as HTML5 canvas elements (true) or IMG tags (false).
            renderPreviewAsCanvas: true,
            // ID of the HTML template used to display files awaiting upload.
            uploadEntryTemplateId: 'template-upload',
            // ID of the HTML template used to display successfully uploaded files.
            downloadEntryTemplateId: 'template-download',
            // jQuery selector or element for the container holding file entries.
            // If not specified, it defaults to an element with class "files"
            // within the widget's main element.
            fileListContainerElement: undefined,
            // If true, new files are added to the beginning of the list; otherwise, to the end.
            addFilesToStart: false,
            // Expected data format for the server's upload response.
            serverResponseDataType: 'json',

            // Callback triggered when files are initially added (via selection, drag/drop, or API).
            onFileAdded: function (domEvent, uploadInfo) {
                const currentInstance = jq(this).data('fileUploader');
                const settings = currentInstance.componentSettings;
                const newFiles = uploadInfo.files;

                // Process files first, then handle UI updates.
                currentInstance.fileUploader('process', uploadInfo).done(function () {
                    // Adjust the file counter based on the number of new files.
                    currentInstance._updateFileLimitCounter(-newFiles.length);
                    uploadInfo.isCountAdjusted = true;

                    // Validate the files and store the result.
                    uploadInfo.files.isValidBatch = uploadInfo.isValidated = currentInstance._performBatchValidation(newFiles);

                    // Render the upload entries for the new files.
                    uploadInfo.context = currentInstance._createUploadEntry(newFiles).data('uploadData', uploadInfo);

                    // Add the rendered entries to the container.
                    if (settings.fileListContainerElement) {
                        settings.fileListContainerElement[settings.addFilesToStart ? 'prepend' : 'append'](uploadInfo.context);
                    } else {
                        // Fallback if no specific container is set
                        jq(this).find('.files')[settings.addFilesToStart ? 'prepend' : 'append'](uploadInfo.context);
                    }

                    // Render previews for eligible files.
                    currentInstance._processAndRenderAllPreviews(newFiles, uploadInfo.context);

                    // Force a DOM reflow to ensure transitions are applied correctly.
                    currentInstance._triggerDomReflow(uploadInfo.context);

                    // Animate the new entries into view.
                    currentInstance._animateElementTransition(uploadInfo.context).done(
                        function () {
                            const shouldAutoStart = settings.initiateAutoUpload || uploadInfo.autoUpload;
                            // Trigger the 'fileAdded' event. If a handler returns false, stop here.
                            if ((currentInstance._trigger('fileAdded', domEvent, uploadInfo) !== false) &&
                                    (shouldAutoStart !== false) && uploadInfo.isValidated) {
                                uploadInfo.submit(); // Initiate upload if conditions met.
                            }
                        }
                    );
                });
            },

            // Callback for the start of each individual file upload request.
            onUploadInitiated: function (domEvent, uploadInfo) {
                const currentInstance = jq(this).data('fileUploader');

                // Pre-validation if not already done (e.g., for API calls).
                if (!uploadInfo.isValidated) {
                    if (!uploadInfo.isCountAdjusted) {
                        currentInstance._updateFileLimitCounter(-uploadInfo.files.length);
                    }
                    if (!currentInstance._performBatchValidation(uploadInfo.files)) {
                        return false; // Prevent upload if validation fails.
                    }
                }

                if (uploadInfo.context && uploadInfo.serverResponseDataType &&
                        uploadInfo.serverResponseDataType.substring(0, 6) === 'iframe') {
                    // Iframe transport lacks progress events; simulate full progress.
                    uploadInfo.context
                        .find('.progress-bar-container').addClass(
                            !jq.support.transition && 'progress-bar-animated'
                        )
                        .find('.progress-bar-fill').css(
                            'width',
                            '100%' // Set to 100% immediately for visual feedback.
                        );
                }
                // Trigger 'uploadInitiated' event. A false return will prevent further action.
                return currentInstance._trigger('uploadInitiated', domEvent, uploadInfo);
            },

            // Callback for successful file uploads.
            onUploadCompleted: function (domEvent, uploadInfo) {
                const currentInstance = jq(this).data('fileUploader');
                let newEntryMarkup;

                if (uploadInfo.context) {
                    uploadInfo.context.each(function (idx) {
                        const fileResult = (Array.isArray(uploadInfo.result) && uploadInfo.result[idx]) || {errorMessage: 'serverEmptyResponse'};
                        if (fileResult.errorMessage) {
                            currentInstance._updateFileLimitCounter(1); // Revert file count for errors.
                        }
                        const currentDomNode = jq(this);
                        currentInstance._animateElementTransition(currentDomNode).done(
                            function () {
                                newEntryMarkup = currentInstance._createDownloadEntry([fileResult])
                                    .replaceAll(currentDomNode); // Replace upload entry with download entry.
                                currentInstance._triggerDomReflow(newEntryMarkup);
                                currentInstance._animateElementTransition(newEntryMarkup).done(
                                    function () {
                                        uploadInfo.context = jq(this); // Update context to the new element.
                                        currentInstance._trigger('uploadFinished', domEvent, uploadInfo);
                                    }
                                );
                            }
                        );
                    });
                } else {
                    // Handle cases where context is not available (e.g., global success).
                    newEntryMarkup = currentInstance._createDownloadEntry(uploadInfo.result)
                        .appendTo(currentInstance.componentSettings.fileListContainerElement);
                    currentInstance._triggerDomReflow(newEntryMarkup);
                    currentInstance._animateElementTransition(newEntryMarkup).done(
                        function () {
                            uploadInfo.context = jq(this);
                            currentInstance._trigger('uploadFinished', domEvent, uploadInfo);
                        }
                    );
                }
            },

            // Callback for failed (aborted or error) uploads.
            onUploadFailed: function (domEvent, uploadInfo) {
                const currentInstance = jq(this).data('fileUploader');
                let errorEntryMarkup;

                // Revert file count for failed uploads.
                currentInstance._updateFileLimitCounter(uploadInfo.files.length);

                if (uploadInfo.context) {
                    uploadInfo.context.each(function (idx) {
                        const currentDomNode = jq(this);
                        if (uploadInfo.errorThrown !== 'abort') {
                            const failedFile = uploadInfo.files[idx];
                            failedFile.errorMessage = failedFile.errorMessage || uploadInfo.errorThrown || 'unknownError';
                            currentInstance._animateElementTransition(currentDomNode).done(
                                function () {
                                    errorEntryMarkup = currentInstance._createDownloadEntry([failedFile])
                                        .replaceAll(currentDomNode);
                                    currentInstance._triggerDomReflow(errorEntryMarkup);
                                    currentInstance._animateElementTransition(errorEntryMarkup).done(
                                        function () {
                                            uploadInfo.context = jq(this);
                                            currentInstance._trigger('uploadError', domEvent, uploadInfo);
                                        }
                                    );
                                }
                            );
                        } else {
                            // If aborted, just remove the context element.
                            currentInstance._animateElementTransition(currentDomNode).done(
                                function () {
                                    jq(this).remove();
                                    currentInstance._trigger('uploadError', domEvent, uploadInfo);
                                }
                            );
                        }
                    });
                } else if (uploadInfo.errorThrown !== 'abort') {
                    // Create a new upload entry to show the error if no context existed.
                    currentInstance._updateFileLimitCounter(-uploadInfo.files.length); // Adjust count back.
                    uploadInfo.context = currentInstance._createUploadEntry(uploadInfo.files)
                        .appendTo(currentInstance.componentSettings.fileListContainerElement)
                        .data('uploadData', uploadInfo);
                    currentInstance._triggerDomReflow(uploadInfo.context);
                    currentInstance._animateElementTransition(uploadInfo.context).done(
                        function () {
                            uploadInfo.context = jq(this);
                            currentInstance._trigger('uploadError', domEvent, uploadInfo);
                        }
                    );
                } else {
                    currentInstance._trigger('uploadError', domEvent, uploadInfo);
                }
            },

            // Callback for individual file upload progress events.
            onFileProgress: function (domEvent, uploadInfo) {
                if (uploadInfo.context) {
                    const progressPercentage = Math.round((uploadInfo.loaded / uploadInfo.total) * 100);
                    uploadInfo.context.find('.progress-bar-fill').css(
                        'width',
                        progressPercentage + '%'
                    );
                }
            },

            // Callback for overall upload progress across all files in a batch.
            onOverallProgress: function (domEvent, uploadInfo) {
                const overallProgress = Math.round((uploadInfo.loaded / uploadInfo.total) * 100);
                jq(this).find('.upload-controls-bar .progress-bar-fill').css(
                    'width',
                    overallProgress + '%'
                );
            },

            // Callback for when any upload activity begins (global start).
            onBatchStart: function (domEvent) {
                const currentInstance = jq(this).data('fileUploader');
                const progressBar = jq(this).find('.upload-controls-bar .progress-bar-container');
                currentInstance._animateElementTransition(progressBar).done(
                    function () {
                        currentInstance._trigger('batchStarted', domEvent);
                    }
                );
            },

            // Callback for when all upload activity ceases (global stop).
            onBatchStop: function (domEvent) {
                const currentInstance = jq(this).data('fileUploader');
                const progressBar = jq(this).find('.upload-controls-bar .progress-bar-container');
                currentInstance._animateElementTransition(progressBar).done(
                    function () {
                        jq(this).find('.progress-bar-fill').css('width', '0%');
                        currentInstance._trigger('batchStopped', domEvent);
                    }
                );
            },

            // Callback for file deletion requests.
            onFileDeleted: function (domEvent, deleteInfo) {
                const currentInstance = jq(this).data('fileUploader');
                // If a URL is provided, send an AJAX request to delete the file on the server.
                if (deleteInfo.url) {
                    jq.ajax(deleteInfo);
                }
                currentInstance._updateFileLimitCounter(1); // Increment count as a file is removed.
                currentInstance._animateElementTransition(deleteInfo.context).done(
                    function () {
                        jq(this).remove(); // Remove the file entry from the DOM.
                        currentInstance._trigger('fileRemoved', domEvent, deleteInfo);
                    }
                );
            }
        },

        // Sets up a download link to allow drag-and-drop to desktop.
        _setupDraggableDownloadLink: function (domLink) {
            const downloadLink = jq(domLink);
            const resourceUrl = downloadLink.prop('href');
            const fileName = downloadLink.prop('download');
            const mimeType = 'application/octet-stream'; // Generic binary type

            downloadLink.on('dragstart', function (dragEvent) {
                try {
                    dragEvent.originalEvent.dataTransfer.setData(
                        'DownloadURL',
                        [mimeType, fileName, resourceUrl].join(':')
                    );
                } catch (err) {
                    console.log('Drag-to-desktop not supported or failed:', err);
                }
            });
        },

        // Modifies the internal counter for max allowed files and updates UI state.
        _updateFileLimitCounter: function (changeAmount) {
            let maxFiles = this.componentSettings.maxAllowedConcurrentFiles;
            if (typeof maxFiles === 'number' && !isNaN(maxFiles)) {
                this.componentSettings.maxAllowedConcurrentFiles += changeAmount;
                if (this.componentSettings.maxAllowedConcurrentFiles < 1) {
                    this._disableFileInputButton();
                } else {
                    this._enableFileInputButton();
                }
            }
        },

        // Converts a byte count into a human-readable string (e.g., "1.23 MB").
        _getFormattedByteSize: function (byteCount) {
            if (typeof byteCount !== 'number' || isNaN(byteCount)) {
                return 'N/A'; // Return a default string for invalid input.
            }
            if (byteCount >= 1000000000) {
                return (byteCount / 1000000000).toFixed(2) + ' GB';
            }
            if (byteCount >= 1000000) {
                return (byteCount / 1000000).toFixed(2) + ' MB';
            }
            if (byteCount >= 1000) {
                return (byteCount / 1000).toFixed(2) + ' KB';
            }
            return byteCount + ' Bytes';
        },

        // Checks a single file against configured validation rules and returns an error code or null.
        _checkFileValidity: function (targetFile) {
            const settings = this.componentSettings;

            if (targetFile.errorMessage) {
                return targetFile.errorMessage; // Already has an error from a previous step.
            }

            // The number of files is adjusted *before* validation, so we check if it's below zero.
            if (settings.maxAllowedConcurrentFiles < 0) {
                return 'maxFileLimitExceeded';
            }

            // Check file type/name against the acceptable regex.
            if (!(settings.acceptableFileTypesRegex.test(targetFile.type) ||
                    settings.acceptableFileTypesRegex.test(targetFile.name))) {
                return 'unacceptableFileType';
            }

            // Check maximum file size.
            if (typeof settings.maxAllowedFileSize === 'number' &&
                    targetFile.size > settings.maxAllowedFileSize) {
                return 'fileTooLarge';
            }

            // Check minimum file size.
            if (typeof settings.minAllowedFileSize === 'number' &&
                    targetFile.size < settings.minAllowedFileSize) {
                return 'fileTooSmall';
            }

            return null; // File is valid.
        },

        // Validates a batch of files and updates their individual error statuses.
        _performBatchValidation: function (inputFiles) {
            const currentInstance = this;
            let allFilesValid = true;

            // Ensure files is an array-like object for iteration.
            const filesArray = Array.isArray(inputFiles) ? inputFiles : Array.from(inputFiles);

            filesArray.forEach(function (fileItem) {
                fileItem.errorMessage = currentInstance._checkFileValidity(fileItem);
                if (fileItem.errorMessage) {
                    allFilesValid = false;
                }
            });
            return allFilesValid;
        },

        // Renders an HTML template using the provided template engine.
        _generateTemplateMarkup: function (templateFunction, dataItems) {
            if (!templateFunction) {
                return jq(); // Return an empty jQuery object if no template function.
            }
            const templateData = {
                items: dataItems, // Renamed 'files' to 'items'
                formatBytes: this._getFormattedByteSize,
                config: this.componentSettings // Renamed 'options' to 'config'
            };
            const renderedOutput = templateFunction(templateData);

            if (renderedOutput instanceof jq) {
                return renderedOutput;
            }
            // If the template returns a string, wrap it in a temporary container to parse.
            return jq('<div/>').html(renderedOutput).children();
        },

        // Renders a preview image for a single file into a given DOM node.
        _displaySingleFilePreview: function (fileItem, targetNode) {
            const currentInstance = this;
            const settings = this.componentSettings;
            const operationPromise = jq.Deferred();

            // Use loadImage utility, if available.
            const loaderCall = imageLoader && imageLoader(
                fileItem,
                function (loadedImage) {
                    // Append the loaded image (or canvas) to the target node.
                    targetNode.append(loadedImage);
                    currentInstance._triggerDomReflow(targetNode);
                    currentInstance._animateElementTransition(targetNode).done(function () {
                        operationPromise.resolveWith(targetNode);
                    });
                    // Fallback for elements not attached to DOM (transitions won't fire).
                    if (!jq.contains(document.body, targetNode[0])) {
                        operationPromise.resolveWith(targetNode);
                    }
                },
                {
                    maxWidth: settings.previewImageWidthLimit,
                    maxHeight: settings.previewImageHeightLimit,
                    canvas: settings.renderPreviewAsCanvas,
                    orientation: true // Attempt to auto-orient images
                }
            );

            // If loadImage didn't run or failed immediately, resolve the promise.
            if (!loaderCall) {
                operationPromise.resolveWith(targetNode);
            }
            return operationPromise;
        },

        // Iterates through files and renders previews for eligible ones.
        _processAndRenderAllPreviews: function (inputFiles, domNodes) {
            const currentInstance = this;
            const settings = this.componentSettings;
            let previewProcessingChain = jq.Deferred().resolve().promise(); // Start with a resolved promise.

            domNodes.find('.file-preview-area span').each(function (index, element) {
                const currentFile = inputFiles[index];
                // Check if file type matches preview regex and size is within limits.
                const isEligibleForPreview = settings.previewImageTypesRegex.test(currentFile.type) &&
                                             (typeof settings.previewImageMaxBytes !== 'number' ||
                                              currentFile.size < settings.previewImageMaxBytes);

                if (isEligibleForPreview) {
                    previewProcessingChain = previewProcessingChain.then(function () {
                        const individualPreviewDeferred = jq.Deferred();
                        currentInstance._displaySingleFilePreview(currentFile, jq(element)).done(
                            function () {
                                individualPreviewDeferred.resolveWith(currentInstance);
                            }
                        );
                        return individualPreviewDeferred.promise();
                    });
                }
            });
            return previewProcessingChain;
        },

        // Generates the HTML markup for upload entries.
        _createUploadEntry: function (inputFiles) {
            const uploadTemplate = this.componentSettings.uploadEntryTemplate; // Assume template function is stored here.
            return this._generateTemplateMarkup(uploadTemplate, inputFiles);
        },

        // Generates the HTML markup for download entries.
        _createDownloadEntry: function (downloadFiles) {
            const downloadTemplate = this.componentSettings.downloadEntryTemplate;
            return this._generateTemplateMarkup(downloadTemplate, downloadFiles)
                       .find('a[data-download-link]') // Find download links within the template.
                       .each((idx, el) => this._setupDraggableDownloadLink(el)) // Use arrow function for context.
                       .end(); // Revert to the original collection.
        },

        // Handles click events on the "start upload" button.
        _handleStartButtonClick: function (domEvent) {
            domEvent.preventDefault();
            const startButton = jq(this);
            const entryContainer = startButton.closest('.upload-item-container');
            const uploadInfo = entryContainer.data('uploadData');

            // Check if upload data exists, a submit function is present, and no active request.
            if (uploadInfo && typeof uploadInfo.submit === 'function' && !uploadInfo.jqXHR) {
                if (uploadInfo.submit()) {
                    startButton.prop('disabled', true).text('Uploading...'); // Disable and update text.
                }
            }
        },

        // Handles click events on the "cancel upload" button.
        _handleCancelButtonClick: function (domEvent) {
            domEvent.preventDefault();
            const entryContainer = jq(this).closest('.upload-item-container');
            const uploadInfo = entryContainer.data('uploadData') || {};

            if (!uploadInfo.jqXHR) {
                // If no active XHR, treat as an immediate abort.
                uploadInfo.errorThrown = 'abort';
                domEvent.data.fileUploader._trigger('onUploadFailed', domEvent, uploadInfo);
            } else {
                uploadInfo.jqXHR.abort(); // Abort the ongoing AJAX request.
            }
        },

        // Handles click events on the "delete file" button.
        _handleDeleteButtonClick: function (domEvent) {
            domEvent.preventDefault();
            const deleteButton = jq(this);
            const parentContext = deleteButton.closest('.download-item-container');

            domEvent.data.fileUploader._trigger('onFileDeleted', domEvent, {
                context: parentContext,
                url: deleteButton.attr('data-delete-url'),
                type: deleteButton.attr('data-delete-method') || 'DELETE',
                dataType: domEvent.data.fileUploader.componentSettings.serverResponseDataType
            });
        },

        // Forces a DOM reflow to ensure CSS transitions are correctly applied.
        _triggerDomReflow: function (domNode) {
            // Accessing offsetWidth triggers a reflow.
            // This is only necessary if transitions are supported and the node exists.
            if (jq.support.transition && domNode.length && domNode[0].offsetWidth) {
                // No assignment needed, just the access.
            }
        },

        // Manages CSS class-based transitions for DOM elements.
        _animateElementTransition: function (domNode) {
            const currentInstance = this;
            const deferredResult = jq.Deferred();
            const transitionClass = 'transition-in'; // Using a custom class name.

            if (jq.support.transition && domNode.hasClass('fade-element')) {
                domNode.on(
                    jq.support.transition.end,
                    function (transitionEvent) {
                        // Ensure we only respond to transitions on the target element itself.
                        if (transitionEvent.target === domNode[0]) {
                            domNode.off(jq.support.transition.end); // Unbind after first transition.
                            deferredResult.resolveWith(domNode);
                        }
                    }
                ).toggleClass(transitionClass);
                // Set a fallback timeout in case transitionend event doesn't fire (e.g., element removed).
                setTimeout(function() {
                    if (deferredResult.state() === 'pending') {
                        deferredResult.resolveWith(domNode);
                    }
                }, 500); // 500ms should be enough for most CSS transitions.
            } else {
                domNode.toggleClass(transitionClass);
                deferredResult.resolveWith(domNode); // Resolve immediately if no transition.
            }
            return deferredResult.promise();
        },

        // Initializes event handlers for the main button bar.
        _initializeActionButtons: function () {
            const actionButtonBar = this.element.find('.upload-controls-bar');
            const fileEntriesContainer = this.componentSettings.fileListContainerElement;

            // Bind click handlers using delegation for dynamically added elements.
            fileEntriesContainer.on('click.fileUploader', '.start-upload-button', this._handleStartButtonClick);
            fileEntriesContainer.on('click.fileUploader', '.cancel-upload-button', this._handleCancelButtonClick);
            fileEntriesContainer.on('click.fileUploader', '.delete-file-button', this._handleDeleteButtonClick);

            // Additional button bar actions (e.g., global start/cancel)
            actionButtonBar.find('.global-start-button').on('click.fileUploader', (e) => {
                e.preventDefault();
                this.element.find('.start-upload-button:enabled').click(); // Trigger all enabled start buttons.
            });
            actionButtonBar.find('.global-cancel-button').on('click.fileUploader', (e) => {
                e.preventDefault();
                this.element.find('.cancel-upload-button:enabled').click(); // Trigger all enabled cancel buttons.
            });
        },

        // Overrides the base widget's `_create` method for UI-specific setup.
        _create: function () {
            // Call the base widget's create method first.
            this._super();

            // Retrieve template functions using their IDs.
            this.componentSettings.uploadEntryTemplate = templateEngine.tmpl(
                '#' + this.componentSettings.uploadEntryTemplateId
            );
            this.componentSettings.downloadEntryTemplate = templateEngine.tmpl(
                '#' + this.componentSettings.downloadEntryTemplateId
            );

            // Determine the actual file list container element.
            if (!this.componentSettings.fileListContainerElement) {
                this.componentSettings.fileListContainerElement = this.element.find('.file-list-display');
            }

            // Initialize the processing queue for sequential operations like preview rendering.
            this._processingQueue = jq.Deferred().resolve().promise();

            // Set up UI event handlers.
            this._initializeActionButtons();
        },

        // Overrides the base widget's `_destroy` method for UI-specific cleanup.
        _destroy: function () {
            // Remove all delegated event handlers.
            this.componentSettings.fileListContainerElement.off('.fileUploader');
            this.element.find('.upload-controls-bar').off('.fileUploader');

            // Call the base widget's destroy method last.
            this._super();
        },

        // Public method to add files programmatically.
        addFiles: function (filesData) {
            const uploadEvent = jq.Event('add');
            const dataObject = {
                files: filesData,
                paramName: 'files[]' // Default parameter name for file uploads
            };
            this.componentSettings.onFileAdded.call(this.element[0], uploadEvent, dataObject);
        }
    });

}));
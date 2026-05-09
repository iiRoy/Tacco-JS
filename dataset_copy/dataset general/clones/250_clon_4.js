/*
 * Content Upload Facilitator
 *
 * Author: A. Clone (derived from Roy van Kaathoven's work)
 * Contact: clone@example.com
 */
(function (rootDocument, globalWindow) {
    'use strict';

    // Private utility functions
    const _deepMergeObjects = (...sources) => {
        return sources.reduce((accumulator, current) => {
            if (current && typeof current === 'object') {
                for (const key in current) {
                    if (Object.prototype.hasOwnProperty.call(current, key)) {
                        accumulator[key] = current[key];
                    }
                }
            }
            return accumulator;
        }, {});
    };

    const _formatLineInsertion = (priorContent, newContent) => {
        const cleanedPrior = (priorContent || '').replace(/^\n+/, '').trimRight(); // Remove leading newlines, then trailing newlines
        const cleanedNew = (newContent || '').replace(/^\n+/, ''); // Remove leading newlines from new content

        if (cleanedPrior === '') {
            return cleanedNew;
        }

        return cleanedPrior + '\n\n' + cleanedNew;
    };

    const _placeTextAtCaret = (targetElement, content) => {
        let savedScrollPosition = targetElement.scrollTop;
        let insertionIndex = 0;
        let isModernSelection = (targetElement.selectionStart || targetElement.selectionStart === 0);

        if (isModernSelection) {
            insertionIndex = targetElement.selectionStart;
        } else if (rootDocument.selection) { // Legacy Internet Explorer
            targetElement.focus();
            let textSelectionRange = rootDocument.selection.createRange();
            textSelectionRange.moveStart('character', -targetElement.value.length);
            insertionIndex = textSelectionRange.text.length;
        } else {
            // Fallback: insert at the end
            insertionIndex = targetElement.value.length;
        }

        const precedingText = targetElement.value.substring(0, insertionIndex);
        const succeedingText = targetElement.value.substring(insertionIndex, targetElement.value.length);
        targetElement.value = precedingText + content + succeedingText;

        const newCaretPosition = insertionIndex + content.length;

        if (isModernSelection) {
            targetElement.selectionStart = newCaretPosition;
            targetElement.selectionEnd = newCaretPosition;
            targetElement.focus();
        } else if (rootDocument.selection) { // Legacy Internet Explorer
            targetElement.focus();
            let textSelectionRange = rootDocument.selection.createRange();
            textSelectionRange.moveStart('character', -targetElement.value.length);
            textSelectionRange.moveStart('character', newCaretPosition);
            textSelectionRange.moveEnd('character', 0);
            textSelectionRange.select();
        }
        targetElement.scrollTop = savedScrollPosition;
    };

    /**
     * Default configuration parameters for the content uploader
     */
    const DEFAULT_SETTINGS_FOR_UPLOADER = {
        transferEndpoint: 'upload_attachment.php',
        transferMethod: 'POST',
        filePayloadName: 'file',
        fallbackExtension: 'png',
        responseResourceKey: 'filename',
        allowedMediaTypes: [
            'image/jpeg',
            'image/png',
            'image/jpg',
            'image/gif'
        ],
        pendingUploadText: '![Uploading asset...]()',
        completedUploadTemplate: "![asset]({resourceName})",
        transferFailureMessage: "Failed to upload asset",
        additionalPayloadData: {},
        additionalRequestHeaders: {},
        preTransferHook: function() { return true; }, // Equivalent to beforeFileUpload
        onAssetReceivedHook: function() {}, // Equivalent to onFileReceived
        postTransferSuccessHook: function() { return true; }, // Equivalent to onFileUploadResponse
        postTransferErrorHook: function() { return true; }, // Equivalent to onFileUploadError
        onAssetFinalizedHook: function() {} // Equivalent to onFileUploaded (though not explicitly called in original code)
    };

    /**
     * Manages content uploads for an editor instance.
     */
    class ContentUploadFacilitator {
        static registeredHandlers = {}; // Equivalent to inlineAttachment.editors

        constructor(userOptions, hostEditor) {
            this._currentOptions = _deepMergeObjects(DEFAULT_SETTINGS_FOR_UPLOADER, userOptions);
            this._activeEditor = hostEditor;
            this._resourceNamePattern = '{resourceName}';
            this._lastInsertedMarker = null; // Stores the placeholder text
        }

        /**
         * Initiates the file upload process using the Fetch API.
         * @param {File} targetFile - The file object to upload.
         * @returns {Promise<Response>} A promise that resolves with the fetch response.
         */
        async initiateAssetTransfer(targetFile) {
            const transferConfig = this._currentOptions;
            const payload = new FormData();

            if (typeof transferConfig.setupFormData === 'function') {
                transferConfig.setupFormData(payload, targetFile);
            }

            let fileExtension = transferConfig.fallbackExtension;
            if (targetFile.name) {
                const nameParts = targetFile.name.match(/\.(.+)$/);
                if (nameParts) {
                    fileExtension = nameParts[1];
                }
            }

            let remoteIdentifier = `asset-${Date.now()}.${fileExtension}`;
            if (typeof transferConfig.remoteFilename === 'function') {
                remoteIdentifier = transferConfig.remoteFilename(targetFile);
            }

            payload.append(transferConfig.filePayloadName, targetFile, remoteIdentifier);

            if (typeof transferConfig.additionalPayloadData === 'object') {
                Object.entries(transferConfig.additionalPayloadData).forEach(([key, value]) => {
                    payload.append(key, value);
                });
            }

            const requestHeaders = new Headers();
            if (typeof transferConfig.additionalRequestHeaders === 'object') {
                Object.entries(transferConfig.additionalRequestHeaders).forEach(([key, value]) => {
                    requestHeaders.append(key, value);
                });
            }

            const requestOptions = {
                method: transferConfig.transferMethod,
                body: payload,
                headers: requestHeaders
            };

            // Call pre-transfer hook. If it returns false, abort.
            if (transferConfig.preTransferHook.call(this, requestOptions) === false) {
                return Promise.reject(new Error("Transfer aborted by pre-transfer hook."));
            }

            try {
                const response = await fetch(transferConfig.transferEndpoint, requestOptions);

                if (response.ok) {
                    await this._processTransferResult(response);
                } else {
                    await this._handleTransferFailure(response);
                }
                return response;
            } catch (error) {
                await this._handleTransferFailure(null, error); // Pass null response if network error
                throw error; // Re-throw to propagate the error
            }
        }

        /**
         * Checks if the given file's MIME type is permitted for upload.
         * @param {File} mediaFile - The file object to check.
         * @returns {boolean} True if the file type is allowed, false otherwise.
         */
        isResourcePermitted(mediaFile) {
            return this._currentOptions.allowedMediaTypes.includes(mediaFile.type);
        }

        /**
         * Processes a successful file upload response.
         * @param {Response} webResponse - The fetch API response object.
         */
        async _processTransferResult(webResponse) {
            if (this._currentOptions.postTransferSuccessHook.call(this, webResponse) !== false) {
                const responseData = await webResponse.json();
                const resourceName = responseData[this._currentOptions.responseResourceKey];

                if (responseData && resourceName) {
                    const finalUrlContent = this._currentOptions.completedUploadTemplate.replace(this._resourceNamePattern, resourceName);
                    const updatedEditorContent = this._activeEditor.getValue().replace(this._lastInsertedMarker, finalUrlContent);
                    this._activeEditor.setValue(updatedEditorContent);
                }
            }
        }

        /**
         * Handles a failed file upload response or network error.
         * @param {Response|null} webResponse - The fetch API response object, or null for network errors.
         * @param {Error|null} error - The error object, if any.
         */
        async _handleTransferFailure(webResponse, error = null) {
            if (this._currentOptions.postTransferErrorHook.call(this, webResponse, error) !== false) {
                const currentContent = this._activeEditor.getValue();
                const cleanedContent = currentContent.replace(this._lastInsertedMarker, "");
                this._activeEditor.setValue(cleanedContent);
            }
        }

        /**
         * Registers a pending asset, inserting a placeholder into the editor.
         * @param {File} mediaFile - The file object that was inserted.
         */
        registerPendingAsset(mediaFile) {
            if (this._currentOptions.onAssetReceivedHook.call(this, mediaFile) !== false) {
                this._lastInsertedMarker = this._currentOptions.pendingUploadText;
                this._activeEditor.insertValue(this._lastInsertedMarker);
            }
        }

        /**
         * Handles paste events, checking for files in clipboard data.
         * @param {ClipboardEvent} event - The paste event.
         * @returns {boolean} True if the event contained an allowed file and was handled.
         */
        handleContentPaste(event) {
            let eventHandled = false;
            const clipboardData = event.clipboardData;

            if (clipboardData && (clipboardData.items || clipboardData.files)) {
                Array.from(clipboardData.items || clipboardData.files)
                    .filter(item => item.kind === 'file' && this.isResourcePermitted(item))
                    .forEach(async item => {
                        eventHandled = true;
                        const file = item.getAsFile();
                        this.registerPendingAsset(file);
                        await this.initiateAssetTransfer(file);
                    });
            }

            if (eventHandled) {
                event.preventDefault();
            }
            return eventHandled;
        }

        /**
         * Handles drop events, checking for files in data transfer.
         * @param {DragEvent} event - The drop event.
         * @returns {boolean} True if the event contained an allowed file and was handled.
         */
        handleContentDrop(event) {
            let eventHandled = false;
            if (event.dataTransfer && event.dataTransfer.files) {
                Array.from(event.dataTransfer.files)
                    .filter(file => this.isResourcePermitted(file))
                    .forEach(async file => {
                        eventHandled = true;
                        this.registerPendingAsset(file);
                        await this.initiateAssetTransfer(file);
                    });
            }
            return eventHandled;
        }
    }

    globalWindow.ContentUploadFacilitator = ContentUploadFacilitator;

})(document, window);
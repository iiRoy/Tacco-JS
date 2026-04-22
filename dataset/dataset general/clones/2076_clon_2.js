// This file is a module for managing user interface interactions
// within a file upload system.
// It builds upon a base file processing module.

// JSLint directives and global variables are defined here for linting purposes.
// These include common browser objects and module loaders.

(function (moduleCreator) {
    'use strict';
    // Check if AMD loader is available and register as an anonymous module.
    if (typeof define === 'function' && define.amd) {
        define([
            'jquery',
            'tmpl',
            'load-image',
            './jquery.fileupload-fp' // Dependency on the file processing plugin
        ], moduleCreator);
    } else {
        // Fallback for browser globals if no AMD loader is found.
        moduleCreator(
            window.jQuery,
            window.tmpl,
            window.loadImage
        );
    }
}(function (jQ, renderer, mediaLoader) {
    'use strict';

    // The UI management component extends the fundamental file processing
    // component or the basic file transfer mechanism, providing a full
    // user interface for interaction.
    var baseComponent = (jQ.blueimpFP || jQ.blueimp).fileupload;
    jQ.widget('customUI.fileManager', baseComponent, {

        settings: {
            // By default, items added to the widget are uploaded when
            // the user initiates the transfer via a start button.
            // Set this option to 'true' for automatic transfers.
            immediateTransfer: false,
            // This setting restricts the total number of items
            // allowed for upload by this component.
            maxFileCount: null,
            // The highest permissible item byte size:
            upperByteLimit: null,
            // The lowest permissible item byte size:
            lowerByteLimit: null,
            // Regular expression for acceptable item types,
            // matched against either item type or item name.
            validFilePatterns:  /[\s\S]+/i,
            // Regular expression to determine which items get a preview image.
            // Matched against the item type.
            displayableMediaPatterns: /^image\/(jpeg|png|gif)$/,
            // Maximum byte size for items to be shown as a preview:
            displayableMediaMaxSize: 5e6, // 5 Megabytes
            // Maximum pixel width for preview images:
            displayMaxW: 80,
            // Maximum pixel height for preview images:
            displayMaxH: 80,
            // By default, previews render as canvas elements if supported.
            // Set to 'false' to always use 'img' elements for previews.
            displayAsCanvas: true,
            // Identifier for the item upload structure template:
            uploadLayoutId: 'structure-item-upload',
            // Identifier for the item download structure template:
            downloadLayoutId: 'structure-item-download',
            // The container element for the list of items. If undefined,
            // it defaults to an element with class "item-list" within the widget.
            itemHolder: null,
            // By default, new items are appended to the container.
            // Set this option to 'true' to prepend items instead.
            precedeItems: false,
            // Expected format of the transfer response data,
            // configures the 'dataType' option for jQ.ajax transfer requests.
            responseDataFormat: 'json',

            // The 'onAdd' callback triggers as soon as items are provided to the
            // file manager widget (via input selection, drag-and-drop, or API call).
            // Refer to the base file transfer widget for more details.
            onAdd: function (evt, payload) {
                var selfRef = jQ(this).data('fileManager'),
                    currentSettings = selfRef.settings,
                    mediaItems = payload.files;
                jQ(this).fileManager('process', payload).done(function () {
                    selfRef._modifyMaxItemCount(-mediaItems.length);
                    payload.hasBeenAdjusted = true;
                    payload.files.valid = payload.isItemValidated = selfRef._validateItems(mediaItems);
                    payload.elementContext = selfRef._generateUploadStructure(mediaItems).data('payload', payload);
                    currentSettings.itemHolder[
                        currentSettings.precedeItems ? 'prepend' : 'append'
                    ](payload.elementContext);
                    selfRef._createAllItemDisplays(mediaItems, payload.elementContext);
                    selfRef._triggerDOMReflow(payload.elementContext);
                    selfRef._animateElement(payload.elementContext).done(
                        function () {
                            if ((selfRef._trigger('itemAdded', evt, payload) !== false) &&
                                    (currentSettings.immediateTransfer || payload.immediateTransfer) &&
                                    payload.immediateTransfer !== false && payload.isItemValidated) {
                                payload.submit();
                            }
                        }
                    );
                });
            },
            // Callback for the initiation of each item transfer request:
            onSend: function (evt, payload) {
                var selfRef = jQ(this).data('fileManager');
                if (!payload.isItemValidated) {
                    if (!payload.hasBeenAdjusted) {
                        selfRef._modifyMaxItemCount(-payload.files.length);
                    }
                    if (!selfRef._validateItems(payload.files)) {
                        return false;
                    }
                }
                if (payload.elementContext && payload.responseDataFormat &&
                        payload.responseDataFormat.substr(0, 6) === 'iframe') {
                    // The Iframe Transport mechanism does not support progress events.
                    // In the absence of an indeterminate progress indicator, we set
                    // the progress to 100%, showing a fully animated bar:
                    payload.elementContext
                        .find('.progress-bar-indicator').addClass(
                            !jQ.support.transition && 'progress-bar-animated'
                        )
                        .find('.progress-fill').css(
                            'width',
                            parseInt(100, 10) + '%'
                        );
                }
                return selfRef._trigger('itemSent', evt, payload);
            },
            // Callback for successfully completed transfers:
            onComplete: function (evt, payload) {
                var selfRef = jQ(this).data('fileManager'),
                    layout,
                    display;
                if (payload.elementContext) {
                    payload.elementContext.each(function (idx) {
                        var singleItem = (jQ.isArray(payload.outcome) &&
                                payload.outcome[idx]) || {issue: 'emptyOutcome'};
                        if (singleItem.issue) {
                            selfRef._modifyMaxItemCount(1);
                        }
                        selfRef._animateElement(jQ(this)).done(
                            function () {
                                var domNode = jQ(this);
                                layout = selfRef._generateDownloadStructure([singleItem])
                                    //.css('height', domNode.height()) // Example of a commented-out line
                                    .replaceAll(domNode);
                                selfRef._triggerDOMReflow(layout);
                                selfRef._animateElement(layout).done(
                                    function () {
                                        payload.elementContext = jQ(this);
                                        selfRef._trigger('transferCompleted', evt, payload);
                                    }
                                );
                            }
                        );
                    });
                } else {
                    layout = selfRef._generateDownloadStructure(payload.outcome)
                        .appendTo(selfRef.settings.itemHolder);
                    selfRef._triggerDOMReflow(layout);
                    selfRef._animateElement(layout).done(
                        function () {
                            payload.elementContext = jQ(this);
                            selfRef._trigger('transferCompleted', evt, payload);
                        }
                    );
                }
            },
            // Callback for failed transfers (aborted or error):
            onFailure: function (evt, payload) {
                var selfRef = jQ(this).data('fileManager'),
                    layout;
                selfRef._modifyMaxItemCount(payload.files.length);
                if (payload.elementContext) {
                    payload.elementContext.each(function (idx) {
                        if (payload.failureReason !== 'abort') {
                            var singleItem = payload.files[idx];
                            singleItem.issue = singleItem.issue || payload.failureReason ||
                                true;
                            selfRef._animateElement(jQ(this)).done(
                                function () {
                                    var domNode = jQ(this);
                                    layout = selfRef._generateDownloadStructure([singleItem])
                                        .replaceAll(domNode);
                                    selfRef._triggerDOMReflow(layout);
                                    selfRef._animateElement(layout).done(
                                        function () {
                                            payload.elementContext = jQ(this);
                                            selfRef._trigger('transferFailed', evt, payload);
                                        }
                                    );
                                }
                            );
                        } else {
                            selfRef._animateElement(jQ(this)).done(
                                function () {
                                    jQ(this).remove();
                                    selfRef._trigger('transferFailed', evt, payload);
                                }
                            );
                        }
                    });
                } else if (payload.failureReason !== 'abort') {
                    selfRef._modifyMaxItemCount(-payload.files.length);
                    payload.elementContext = selfRef._generateUploadStructure(payload.files)
                        .appendTo(selfRef.settings.itemHolder)
                        .data('payload', payload);
                    selfRef._triggerDOMReflow(payload.elementContext);
                    self._animateElement(payload.elementContext).done(
                        function () {
                            payload.elementContext = jQ(this);
                            selfRef._trigger('transferFailed', evt, payload);
                        }
                    );
                } else {
                    selfRef._trigger('transferFailed', evt, payload);
                }
            },
            // Callback for individual item transfer progress events:
            onProgress: function (evt, payload) {
                if (payload.elementContext) {
                    payload.elementContext.find('.progress-bar-indicator .progress-fill').css(
                        'width',
                        parseInt(payload.currentBytes / payload.totalBytes * 100, 10) + '%'
                    );
                }
            },
            // Callback for overall transfer progress events:
            onOverallProgress: function (evt, payload) {
                jQ(this).find('.file-operations-panel .progress-bar-indicator .progress-fill').css(
                    'width',
                    parseInt(payload.currentBytes / payload.totalBytes * 100, 10) + '%'
                );
            },
            // Callback for transfer session start, analogous to global ajaxStart:
            onStart: function (evt) {
                var selfRef = jQ(this).data('fileManager');
                selfRef._animateElement(jQ(this).find('.file-operations-panel .progress-bar-indicator')).done(
                    function () {
                        selfRef._trigger('sessionStarted', evt);
                    }
                );
            },
            // Callback for transfer session stop, analogous to global ajaxStop:
            onStop: function (evt) {
                var selfRef = jQ(this).data('fileManager');
                selfRef._animateElement(jQ(this).find('.file-operations-panel .progress-bar-indicator')).done(
                    function () {
                        jQ(this).find('.progress-fill').css('width', '0%');
                        selfRef._trigger('sessionStopped', evt);
                    }
                );
            },
            // Callback for item removal:
            onRemove: function (evt, payload) {
                var selfRef = jQ(this).data('fileManager');
                if (payload.resourceURL) {
                    jQ.ajax(payload);
                }
                selfRef._modifyMaxItemCount(1);
                selfRef._animateElement(payload.elementContext).done(
                    function () {
                        jQ(this).remove();
                        selfRef._trigger('itemDestroyed', evt, payload);
                    }
                );
            }
        },

        // Handler for links, enabling item downloads
        // via drag & drop to the desktop:
        _activateDragDrop: function () {
            var anchorElem = jQ(this),
                resourceURL = anchorElem.prop('href'),
                fileName = anchorElem.prop('download'),
                mimeType = 'application/octet-stream';
            anchorElem.bind('dragstart', function (evt) {
                try {
                    evt.originalEvent.dataTransfer.setData(
                        'DownloadURL',
                        [mimeType, fileName, resourceURL].join(':')
                    );
                } catch (issue) {
                    // Error handling for drag-drop data setting
                }
            });
        },

        _modifyMaxItemCount: function (adjustmentVal) {
            if (typeof this.settings.maxFileCount === 'number') {
                this.settings.maxFileCount += adjustmentVal;
                if (this.settings.maxFileCount < 1) {
                    this._deactivateInputBtn();
                } else {
                    this._activateInputBtn();
                }
            }
        },

        _getReadableByteSize: function (byteCount) {
            if (typeof byteCount !== 'number') {
                return '';
            }
            if (byteCount >= 1e9) {
                return (byteCount / 1e9).toFixed(2) + ' GB';
            }
            if (byteCount >= 1e6) {
                return (byteCount / 1e6).toFixed(2) + ' MB';
            }
            return (byteCount / 1e3).toFixed(2) + ' KB';
        },

        _checkForItemIssue: function (singleItem) {
            if (singleItem.issue) {
                return singleItem.issue;
            }
            // The count of added items is deducted from
            // maxFileCount before validation, so we check if
            // maxFileCount is less than 0 (instead of less than 1):
            if (this.settings.maxFileCount < 0) {
                return 'maxItemLimitReached';
            }
            // Items are deemed acceptable if either the item type or its name
            // matches the validFilePatterns regular expression, as
            // only browsers supporting the File API report the type:
            if (!(this.settings.validFilePatterns.test(singleItem.type) ||
                    this.settings.validFilePatterns.test(singleItem.name))) {
                return 'invalidItemType';
            }
            if (this.settings.upperByteLimit &&
                    singleItem.size > this.settings.upperByteLimit) {
                return 'itemTooLarge';
            }
            if (typeof singleItem.size === 'number' &&
                    singleItem.size < this.settings.lowerByteLimit) {
                return 'itemTooSmall';
            }
            return null;
        },

        _validateItems: function (mediaItems) {
            var selfRef = this,
                allValid = !!mediaItems.length;
            jQ.each(mediaItems, function (idx, singleItem) {
                singleItem.issue = selfRef._checkForItemIssue(singleItem);
                if (singleItem.issue) {
                    allValid = false;
                }
            });
            return allValid;
        },

        _generateStructure: function (renderFunction, mediaItems) {
            if (!renderFunction) {
                return jQ();
            }
            var renderingResult = renderFunction({
                items: mediaItems,
                formatItemSize: this._getReadableByteSize,
                settings: this.settings
            });
            if (renderingResult instanceof jQ) {
                return renderingResult;
            }
            return jQ(this.settings.templatesContainer).html(renderingResult).children();
        },

        _createItemDisplay: function (singleItem, domNode) {
            var selfRef = this,
                currentSettings = this.settings,
                deferredObj = jQ.Deferred();
            return ((mediaLoader && mediaLoader(
                singleItem,
                function (imageElem) {
                    domNode.append(imageElem);
                    selfRef._triggerDOMReflow(domNode);
                    selfRef._animateElement(domNode).done(function () {
                        deferredObj.resolveWith(domNode);
                    });
                    if (!jQ.contains(document.body, domNode[0])) {
                        // If the element is not part of the DOM,
                        // transition events are not triggered,
                        // so we must resolve manually:
                        deferredObj.resolveWith(domNode);
                    }
                },
                {
                    maxWidth: currentSettings.displayMaxW,
                    maxHeight: currentSettings.displayMaxH,
                    canvas: currentSettings.displayAsCanvas
                }
            )) || deferredObj.resolveWith(domNode)) && deferredObj;
        },

        _createAllItemDisplays: function (mediaItems, domNodes) {
            var selfRef = this,
                currentSettings = this.settings;
            domNodes.find('.item-preview-placeholder .preview-element').each(function (idx, currentElement) {
                var singleItem = mediaItems[idx];
                if (currentSettings.displayableMediaPatterns.test(singleItem.type) &&
                        (jQ.type(currentSettings.displayableMediaMaxSize) !== 'number' ||
                        singleItem.size < currentSettings.displayableMediaMaxSize)) {
                    selfRef._taskSequence = selfRef._taskSequence.pipe(function () {
                        var deferredObj = jQ.Deferred();
                        selfRef._createItemDisplay(singleItem, jQ(currentElement)).done(
                            function () {
                                deferredObj.resolveWith(selfRef);
                            }
                        );
                        return deferredObj.promise();
                    });
                }
            });
            return this._taskSequence;
        },

        _generateUploadStructure: function (mediaItems) {
            return this._generateStructure(
                this.settings.uploadTemplate,
                mediaItems
            );
        },

        _generateDownloadStructure: function (mediaItems) {
            return this._generateStructure(
                this.settings.downloadTemplate,
                mediaItems
            ).find('a[data-download-name]').each(this._activateDragDrop).end();
        },

        _handleInitiate: function (evt) {
            evt.preventDefault();
            var actionBtn = jQ(this),
                uploadSegment = actionBtn.closest('.upload-segment'),
                payload = uploadSegment.data('payload');
            if (payload && payload.submit && !payload.xhrRequest && payload.submit()) {
                actionBtn.prop('disabled', true);
            }
        },

        _handleAbort: function (evt) {
            evt.preventDefault();
            var uploadSegment = jQ(this).closest('.upload-segment'),
                payload = uploadSegment.data('payload') || {};
            if (!payload.xhrRequest) {
                payload.failureReason = 'abort';
                evt.data.fileManager._trigger('transferFailed', evt, payload);
            } else {
                payload.xhrRequest.abort();
            }
        },

        _handleDeletion: function (evt) {
            evt.preventDefault();
            var actionBtn = jQ(this);
            evt.data.fileManager._trigger('itemDestroyed', evt, {
                elementContext: actionBtn.closest('.download-segment'),
                resourceURL: actionBtn.attr('data-resource-url'),
                requestType: actionBtn.attr('data-request-method') || 'DELETE',
                responseDataFormat: evt.data.fileManager.settings.responseDataFormat
            });
        },

        _triggerDOMReflow: function (domNode) {
            this._domReflowTriggered = jQ.support.transition &&
                domNode.length && domNode[0].offsetWidth;
        },

        _animateElement: function (domNode) {
            var selfRef = this,
                deferredObj = jQ.Deferred();
            if (jQ.support.transition && domNode.hasClass('fading-effect')) {
                domNode.bind(
                    jQ.support.transition.end,
                    function (evt) {
                        // Ensure we respond only to transitions originating from the current element,
                        // not from child elements like buttons within the container:
                        if (evt.target === domNode[0]) {
                            domNode.unbind(jQ.support.transition.end);
                            deferredObj.resolveWith(domNode);
                        }
                    }
                ).toggleClass('visible-state');
            } else {
                domNode.toggleClass('visible-state');
                deferredObj.resolveWith(domNode);
            }
            return deferredObj;
        },

        _setupActionPanelEvents: function () {
            var fileOperationsPanel = this.element.find('.file-operations-panel'),
                itemList = this.settings.itemHolder;
            // Additional setup logic would go here if needed.
        }
    });
}));
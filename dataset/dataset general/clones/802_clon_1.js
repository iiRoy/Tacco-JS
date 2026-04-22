/**
 * @fileoverview This script provides essential polyfills and shims for older browsers
 * lacking modern HTML5 File API features, specifically for XMLHttpRequest and FileReader.
 * It integrates with AngularJS file upload functionalities.
 *
 * This version is a Type I clone, meaning its functionality and identifiers are identical
 * to the original, but its formatting, whitespace, and comments have been extensively
 * altered for visual distinctness.
 *
 * Original Author: Danial Farid <danial.farid@gmail.com>
 * Original Version: <%= pkg.version %> (Placeholder for build system)
 *
 * Key features:
 * - XMLHttpRequest shim for FormData and File API integration.
 * - FileReader polyfill.
 * - Flash-based fallback for File API where native support is absent.
 */

// Encapsulate the entire script within an Immediately Invoked Function Expression (IIFE)
// to prevent global scope pollution.
(function() {

    // --- Helper function to detect Flash Player presence ---

    /**
     * Checks if Adobe Flash Player is installed and available in the browser.
     * This is crucial for fallback mechanisms in older browsers that don't
     * natively support the File API.
     * @returns {boolean} True if Flash is detected, false otherwise.
     */
    var hasFlash = function() {
        // Attempt to create an ActiveXObject for Internet Explorer.
        try {
            var fo = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
            if (fo) {
                return true; // Flash ActiveX object found.
            }
        } catch(e) {
            // For other browsers, check navigator.mimeTypes.
            if (navigator.mimeTypes['application/x-shockwave-flash'] != undefined) {
                return true; // Flash MIME type found.
            }
        }
        return false; // No Flash detected.
    };


    // --- XMLHttpRequest Prototype Patching Utility ---

    /**
     * Patches a method on the XMLHttpRequest prototype.
     * This allows intercepting and modifying the behavior of standard XHR methods.
     * @param {string} fnName - The name of the method to patch (e.g., 'open', 'send').
     * @param {function(function): function} newFn - A function that takes the original method
     *                                             and returns the new, patched method.
     */
    function patchXHR(fnName, newFn) {
        // Apply the new function to the XMLHttpRequest prototype.
        window.XMLHttpRequest.prototype[fnName] = newFn(window.XMLHttpRequest.prototype[fnName]);
    }


    // --- Main Conditional Block for File API Shim ---

    // This block executes if the browser either:
    // 1. Supports XMLHttpRequest but lacks native FormData (older browsers).
    // 2. Has the FileAPI object and explicitly requests force loading (e.g., for testing or specific scenarios).
    if ((window.XMLHttpRequest && !window.FormData) || (window.FileAPI && FileAPI.forceLoad)) {

        /**
         * Initializes upload listeners on an XHR object.
         * This creates a custom listener array and patches `addEventListener`
         * on `xhr.upload` to capture progress, load, and other events.
         * @param {XMLHttpRequest} xhr - The XMLHttpRequest instance.
         */
        var initializeUploadListener = function(xhr) {
            // Only initialize if not already done.
            if (!xhr.__listeners) {
                // Ensure xhr.upload exists.
                if (!xhr.upload) {
                    xhr.upload = {};
                }
                xhr.__listeners = []; // Custom array to store event listeners.

                // Store the original addEventListener method.
                var origAddEventListener = xhr.upload.addEventListener;

                // Patch addEventListener to capture listeners.
                xhr.upload.addEventListener = function(t, fn, b) {
                    xhr.__listeners[t] = fn; // Store the listener by type.
                    // Call the original addEventListener if it exists.
                    origAddEventListener && origAddEventListener.apply(this, arguments);
                };
            }
        };


        // --- Patching XMLHttpRequest.prototype.open ---

        patchXHR('open', function(orig) {
            return function(m, url, b) {
                // Initialize upload listeners for this XHR instance.
                initializeUploadListener(this);
                this.__url = url; // Store the original URL.

                try {
                    // Attempt to call the original open method.
                    orig.apply(this, [m, url, b]);
                } catch (e) {
                    // Handle 'Access is denied' error, common in IE for cross-domain requests.
                    if (e.message.indexOf('Access is denied') > -1) {
                        this.__origError = e; // Store the original error.
                        // Call open with a dummy URL to bypass the IE security restriction,
                        // as the actual request will be handled by FileAPI.
                        orig.apply(this, [m, '_fix_for_ie_crossdomain__', b]);
                    }
                }
            };
        });


        // --- Patching XMLHttpRequest.prototype.getResponseHeader ---

        patchXHR('getResponseHeader', function(orig) {
            return function(h) {
                // If FileAPI XHR is in use, delegate to its getResponseHeader.
                // Otherwise, call the original XHR method.
                return this.__fileApiXHR && this.__fileApiXHR.getResponseHeader ?
                    this.__fileApiXHR.getResponseHeader(h) :
                    (orig == null ? null : orig.apply(this, [h]));
            };
        });


        // --- Patching XMLHttpRequest.prototype.getAllResponseHeaders ---

        patchXHR('getAllResponseHeaders', function(orig) {
            return function() {
                // Similar to getResponseHeader, delegate to FileAPI XHR if available.
                return this.__fileApiXHR && this.__fileApiXHR.getAllResponseHeaders ?
                    this.__fileApiXHR.getAllResponseHeaders() :
                    (orig == null ? null : orig.apply(this));
            };
        });


        // --- Patching XMLHttpRequest.prototype.abort ---

        patchXHR('abort', function(orig) {
            return function() {
                // Delegate abort call to FileAPI XHR if it's handling the request.
                return this.__fileApiXHR && this.__fileApiXHR.abort ?
                    this.__fileApiXHR.abort() :
                    (orig == null ? null : orig.apply(this));
            };
        });


        // --- Patching XMLHttpRequest.prototype.setRequestHeader ---

        patchXHR('setRequestHeader', function(orig) {
            return function(header, value) {
                // Special handling for a custom header used internally.
                if (header === '__setXHR_') {
                    initializeUploadListener(this); // Ensure listeners are set up.
                    var val = value(this); // Execute the value function.
                    // Fix for older Angular versions (< 1.2.0)
                    if (val instanceof Function) {
                        val(this);
                    }
                } else {
                    // Store request headers for later use by FileAPI.
                    this.__requestHeaders = this.__requestHeaders || {};
                    this.__requestHeaders[header] = value;
                    // Call the original setRequestHeader for native XHR behavior.
                    orig.apply(this, arguments);
                }
            };
        });


        // --- Helper to Redefine XHR Properties ---

        /**
         * Redefines a property on an XHR object using Object.defineProperty.
         * This is used to make FileAPI's response properties accessible
         * as if they were native XHR properties.
         * @param {XMLHttpRequest} xhr - The XHR object.
         * @param {string} prop - The property name (e.g., 'status', 'responseText').
         * @param {function(): any} fn - A getter function for the property's value.
         */
        function redefineProp(xhr, prop, fn) {
            try {
                Object.defineProperty(xhr, prop, {get: fn});
            } catch (e) {
                // Ignore errors, e.g., if the property is not configurable.
            }
        }


        // --- Patching XMLHttpRequest.prototype.send (Core Logic) ---

        patchXHR('send', function(orig) {
            return function() {
                var xhr = this; // Capture 'this' for use in callbacks.

                // Check if the argument is a FormData shim object created by this library.
                if (arguments[0] && arguments[0].__isFileAPIShim) {
                    var formData = arguments[0]; // The shimmed FormData object.

                    // Configuration object for FileAPI.upload.
                    var config = {
                        url: xhr.__url, // Use the URL stored during 'open'.
                        jsonp: false,   // Disable JSONP for file uploads.
                        cache: true,    // Prevent cache-busting query parameters.
                        // Callback for when the FileAPI upload completes (success, error, or abort).
                        complete: function(err, fileApiXHR) {
                            xhr.__completed = true; // Mark as completed.

                            // Trigger 'load' event if no error and listener exists.
                            if (!err && xhr.__listeners['load']) {
                                xhr.__listeners['load']({type: 'load', loaded: xhr.__loaded, total: xhr.__total, target: xhr, lengthComputable: true});
                            }
                            // Trigger 'loadend' event if no error and listener exists.
                            if (!err && xhr.__listeners['loadend']) {
                                xhr.__listeners['loadend']({type: 'loadend', loaded: xhr.__loaded, total: xhr.__total, target: xhr, lengthComputable: true});
                            }
                            // Trigger 'abort' event if the error is 'abort'.
                            if (err === 'abort' && xhr.__listeners['abort']) {
                                xhr.__listeners['abort']({type: 'abort', loaded: xhr.__loaded, total: xhr.__total, target: xhr, lengthComputable: true});
                            }

                            // Redefine XHR properties to reflect FileAPI's response.
                            if (fileApiXHR.status !== undefined) {
                                redefineProp(xhr, 'status', function() {
                                    // Special handling for status 0 with an error (e.g., network error).
                                    return (fileApiXHR.status == 0 && err && err !== 'abort') ? 500 : fileApiXHR.status;
                                });
                            }
                            if (fileApiXHR.statusText !== undefined) {
                                redefineProp(xhr, 'statusText', function() {
                                    return fileApiXHR.statusText;
                                });
                            }
                            redefineProp(xhr, 'readyState', function() {
                                return 4; // Indicate completion.
                            });
                            if (fileApiXHR.response !== undefined) {
                                redefineProp(xhr, 'response', function() {
                                    return fileApiXHR.response;
                                });
                            }
                            // Determine the response text.
                            var resp = fileApiXHR.responseText || (err && fileApiXHR.status == 0 && err !== 'abort' ? err : undefined);
                            redefineProp(xhr, 'responseText', function() {
                                return resp;
                            });
                            redefineProp(xhr, 'response', function() {
                                return resp; // Ensure 'response' also gets the text.
                            });
                            if (err) {
                                redefineProp(xhr, 'err', function() {
                                    return err; // Expose the error if present.
                                });
                            }
                            xhr.__fileApiXHR = fileApiXHR; // Store the FileAPI XHR object.

                            // Call native XHR event handlers if they exist.
                            if (xhr.onreadystatechange) {
                                xhr.onreadystatechange();
                            }
                            if (xhr.onload) {
                                xhr.onload();
                            }
                        },
                        // Callback for file upload progress.
                        fileprogress: function(e) {
                            e.target = xhr; // Set the event target to the original XHR.
                            xhr.__listeners['progress'] && xhr.__listeners['progress'](e); // Trigger custom progress listener.
                            xhr.__total = e.total; // Update total bytes.
                            xhr.__loaded = e.loaded; // Update loaded bytes.

                            // Workaround for Flash issue: if total === loaded, but no response,
                            // Flash might not call 'complete'. Manually trigger after a timeout.
                            if (e.total === e.loaded) {
                                var _this = this; // Capture 'this' for the timeout function.
                                setTimeout(function() {
                                    if (!xhr.__completed) {
                                        // If not completed by Flash, simulate a 204 No Content response.
                                        xhr.getAllResponseHeaders = function(){}; // Prevent errors accessing headers.
                                        _this.complete(null, {status: 204, statusText: 'No Content'});
                                    }
                                }, FileAPI.noContentTimeout || 10000); // Configurable timeout, default 10s.
                            }
                        },
                        headers: xhr.__requestHeaders // Pass stored request headers.
                    };

                    config.data = {}; // Initialize data payload for FileAPI.
                    config.files = {}; // Initialize files payload for FileAPI.

                    // Process the shimmed FormData to separate files and data fields.
                    for (var i = 0; i < formData.data.length; i++) {
                        var item = formData.data[i];
                        // Check if the item looks like a file object.
                        if (item.val != null && item.val.name != null && item.val.size != null && item.val.type != null) {
                            config.files[item.key] = item.val; // Add to files.
                        } else {
                            config.data[item.key] = item.val; // Add to data.
                        }
                    }

                    // Defer the FileAPI upload call to allow the current stack to clear.
                    setTimeout(function() {
                        // Double-check for Flash presence before initiating the upload.
                        if (!hasFlash()) {
                            throw 'Adode Flash Player need to be installed. To check ahead use "FileAPI.hasFlash"';
                        }
                        xhr.__fileApiXHR = FileAPI.upload(config); // Initiate the FileAPI upload.
                    }, 1); // Small delay.
                } else {
                    // If not a FileAPI shimmed request, proceed with original XHR send.
                    if (this.__origError) {
                        throw this.__origError; // Re-throw the original error if it occurred during 'open'.
                    }
                    orig.apply(xhr, arguments); // Call the original send method.
                }
            };
        });

        // Mark window.XMLHttpRequest to indicate that it has been shimmed.
        window.XMLHttpRequest.__isFileAPIShim = true;


        // --- Helper to Check Input Type ---

        /**
         * Checks if a given DOM element (or jQuery/jqLite wrapper) is an input of type 'file'.
         * @param {HTMLElement|jQuery} elem - The element to check.
         * @returns {boolean} True if it's a file input, false otherwise.
         */
        function isInputTypeFile(elem) {
            return elem[0].tagName.toLowerCase() === 'input' &&
                   elem.attr('type') &&
                   elem.attr('type').toLowerCase() === 'file';
        }


        // --- FileAPI ngfFixIE Function ---

        /**
         * Provides a fix for IE browsers to allow file selection using a Flash-based input.
         * This function is typically called by an AngularJS directive.
         * @param {HTMLElement|jQuery} elem - The original element that triggers file selection.
         * @param {function(): HTMLElement|jQuery} createFileElemFn - A function that creates and returns the Flash-based file input element.
         * @param {function(Event)} changeFn - The original change handler to be called after file selection.
         * @param {function()} resetModel - A function to reset the associated model. (Unused in this snippet but part of the signature).
         */
        FileAPI.ngfFixIE = function(elem, createFileElemFn, changeFn, resetModel) {
            // Ensure Flash is installed for this functionality.
            if (!hasFlash()) {
                throw 'Adode Flash Player need to be installed. To check ahead use "FileAPI.hasFlash"';
            }

            /**
             * Creates or updates the Flash-based file input element when the mouse enters the target element.
             * @param {Event} evt - The mouseenter event.
             */
            var makeFlashInput = function(evt) {
                if (elem.attr('disabled')) {
                    // If the element is disabled, remove the wrapper class.
                    elem.__ngf_elem__.removeClass('js-fileapi-wrapper');
                } else {
                    // Create the Flash input element.
                    var fileElem = elem.__ngf_elem__ = createFileElemFn();
                    fileElem.addClass('js-fileapi-wrapper'); // Add a class for styling.

                    // Position the Flash input element over the original element
                    // to make it clickable and visually integrate.
                    if (!isInputTypeFile(elem)) {
                        // If the original element is not a file input itself,
                        // ensure its parent has relative positioning.
                        if (fileElem.parent().css('position') === '' || fileElem.parent().css('position') === 'static') {
                            fileElem.parent().css('position', 'relative');
                        }
                        // Absolute position the Flash input to cover the original element.
                        fileElem.css('position', 'absolute')
                                .css('top', elem[0].offsetTop + 'px')
                                .css('left', elem[0].offsetLeft + 'px')
                                .css('width', elem[0].offsetWidth + 'px')
                                .css('height', elem[0].offsetHeight + 'px')
                                .css('padding', elem.css('padding'))
                                .css('margin', elem.css('margin'))
                                .css('filter', 'alpha(opacity=0)'); // Make it transparent in IE.
                        fileElem.css('z-index', '1000'); // Ensure it's on top.
                    } else {
                        // If it's already a file input, no complex positioning needed.
                    }

                    // Re-bind mouseenter after a short delay to ensure it works correctly.
                    setTimeout(function() {
                        fileElem.bind('mouseenter', makeFlashInput);
                    }, 10);

                    // Unbind any previous change handlers and bind the new one.
                    fileElem.unbind('change');
                    fileElem.bind('change', function(evt) {
                        fileApiChangeFn.apply(this, [evt]); // Process files with FileAPI.
                        changeFn.apply(this, [evt]);       // Call the original change handler.
                    });
                }
            };

            // Bind the initial mouseenter event to create the Flash input.
            elem.bind('mouseenter', makeFlashInput);

            /**
             * Processes the change event from the Flash file input.
             * It extracts file information using FileAPI and normalizes the event object.
             * @param {Event} evt - The change event from the file input.
             */
            var fileApiChangeFn = function(evt) {
                var files = FileAPI.getFiles(evt); // Get file objects using FileAPI.

                // Double-check and normalize file properties for consistency (#233).
                for (var i = 0; i < files.length; i++) {
                    if (files[i].size === undefined) {
                        files[i].size = 0;
                    }
                    if (files[i].name === undefined) {
                        files[i].name = 'file';
                    }
                    if (files[i].type === undefined) {
                        files[i].type = 'undefined';
                    }
                }

                if (!evt.target) {
                    evt.target = {}; // Ensure target exists.
                }
                evt.target.files = files; // Attach the normalized files array to event.target.

                // If evt.target.files is not writable (e.g., in some environments), use a helper field.
                if (evt.target.files != files) {
                    evt.__files_ = files;
                }
                // Add an 'item' method for compatibility with FileList interface.
                (evt.__files_ || evt.target.files).item = function(i) {
                    return (evt.__files_ || evt.target.files)[i] || null;
                };
            };
        };


        // --- FormData Polyfill ---

        /**
         * Polyfill for the FormData object.
         * Creates a shimmed FormData object that stores key-value pairs in an array.
         * This is used by the XHR send patch to construct the FileAPI upload config.
         */
        window.FormData = FormData = function() {
            return {
                /**
                 * Appends a key-value pair to the FormData.
                 * Handles Blob shim objects specially.
                 * @param {string} key - The field name.
                 * @param {any} val - The field value (can be a file/blob or string).
                 * @param {string} [name] - Optional file name for file fields.
                 */
                append: function(key, val, name) {
                    if (val.__isFileAPIBlobShim) {
                        val = val.data[0]; // Extract actual data from Blob shim.
                    }
                    this.data.push({
                        key: key,
                        val: val,
                        name: name
                    });
                },
                data: [], // Array to hold the appended data.
                __isFileAPIShim: true // Mark as a shimmed FormData object.
            };
        };


        // --- Blob Polyfill ---

        /**
         * Polyfill for the Blob object.
         * Creates a shimmed Blob object to mimic native Blob behavior for FileAPI.
         * @param {Array<any>} b - An array of data that would constitute the Blob.
         */
        window.Blob = Blob = function(b) {
            return {
                data: b, // Store the raw data.
                __isFileAPIBlobShim: true // Mark as a shimmed Blob object.
            };
        };


        // --- FileAPI Library Loading Logic ---

        (function () {
            // Ensure window.FileAPI exists.
            if (!window.FileAPI) {
                window.FileAPI = {};
            }
            // If forceLoad is set, explicitly disable HTML5 features.
            if (FileAPI.forceLoad) {
                FileAPI.html5 = false;
            }

            // Load FileAPI.min.js only if FileAPI.upload is not already defined.
            if (!FileAPI.upload) {
                var jsUrl, basePath,
                    script = document.createElement('script'),
                    allScripts = document.getElementsByTagName('script'),
                    i, index, src;

                // Determine the base path for FileAPI.min.js.
                if (window.FileAPI.jsUrl) {
                    jsUrl = window.FileAPI.jsUrl; // Use explicit jsUrl if provided.
                } else if (window.FileAPI.jsPath) {
                    basePath = window.FileAPI.jsPath; // Use explicit jsPath if provided.
                } else {
                    // Auto-detect base path from the current script's URL.
                    for (i = 0; i < allScripts.length; i++) {
                        src = allScripts[i].src;
                        index = src.search(/\/angular\-file\-upload[\-a-zA-z0-9\.]*\.js/);
                        if (index > -1) {
                            basePath = src.substring(0, index + 1);
                            break;
                        }
                    }
                }

                // Set staticPath if not already defined.
                if (FileAPI.staticPath == null) {
                    FileAPI.staticPath = basePath;
                }

                // Append the FileAPI script to the document head.
                script.setAttribute('src', jsUrl || basePath + 'FileAPI.min.js');
                document.getElementsByTagName('head')[0].appendChild(script);

                // Set FileAPI.hasFlash property based on detection.
                FileAPI.hasFlash = hasFlash();
            }
        })(); // End of FileAPI loading IIFE.


        // --- FileAPI disableFileInput Function ---

        /**
         * Enables or disables the FileAPI-related file input wrapper.
         * Used to visually indicate whether the file input is active or not.
         * @param {HTMLElement|jQuery} elem - The element to modify.
         * @param {boolean} disable - True to disable (remove wrapper class), false to enable (add wrapper class).
         */
        FileAPI.disableFileInput = function(elem, disable) {
            if (disable) {
                elem.removeClass('js-fileapi-wrapper'); // Remove class when disabled.
            } else {
                elem.addClass('js-fileapi-wrapper');    // Add class when enabled.
            }
        };

    } // End of main conditional block for File API shim.


    // --- FileReader Polyfill ---

    // Provide a FileReader polyfill if the browser doesn't support it natively.
    if (!window.FileReader) {
        window.FileReader = function() {
            var _this = this, // Capture 'this' for internal use.
                loadStarted = false;

            this.listeners = {}; // Event listeners storage.

            /**
             * Adds an event listener to the FileReader instance.
             * @param {string} type - The event type (e.g., 'load', 'progress').
             * @param {function(Event)} fn - The listener function.
             */
            this.addEventListener = function(type, fn) {
                _this.listeners[type] = _this.listeners[type] || [];
                _this.listeners[type].push(fn);
            };

            /**
             * Removes an event listener from the FileReader instance.
             * @param {string} type - The event type.
             * @param {function(Event)} fn - The listener function to remove.
             */
            this.removeEventListener = function(type, fn) {
                _this.listeners[type] && _this.listeners[type].splice(_this.listeners[type].indexOf(fn), 1);
            };

            /**
             * Dispatches an event to all registered listeners of a specific type.
             * @param {Event} evt - The event object to dispatch.
             */
            this.dispatchEvent = function(evt) {
                var list = _this.listeners[evt.type];
                if (list) {
                    for (var i = 0; i < list.length; i++) {
                        list[i].call(_this, evt); // Call each listener with 'this' set to FileReader instance.
                    }
                }
            };

            // Initialize standard event handler properties to null.
            this.onabort = this.onerror = this.onload = this.onloadstart = this.onloadend = this.onprogress = null;

            /**
             * Constructs a normalized event object for FileReader events.
             * @param {string} type - The event type.
             * @param {object} evt - The raw event data from FileAPI.
             * @returns {object} The constructed event object.
             */
            var constructEvent = function(type, evt) {
                var e = {type: type, target: _this, loaded: evt.loaded, total: evt.total, error: evt.error};
                if (evt.result != null) {
                    e.target.result = evt.result; // Attach result to event target.
                }
                return e;
            };

            /**
             * Internal listener for FileAPI events, translating them into FileReader events.
             * @param {object} evt - The event object provided by FileAPI.
             */
            var listener = function(evt) {
                // Trigger onloadstart only once.
                if (!loadStarted) {
                    loadStarted = true;
                    _this.onloadstart && _this.onloadstart(constructEvent('loadstart', evt));
                }

                // Handle different event types.
                if (evt.type === 'load') {
                    _this.onloadend && _this.onloadend(constructEvent('loadend', evt));
                    var e = constructEvent('load', evt);
                    _this.onload && _this.onload(e);
                    _this.dispatchEvent(e);
                } else if (evt.type === 'progress') {
                    var e = constructEvent('progress', evt);
                    _this.onprogress && _this.onprogress(e);
                    _this.dispatchEvent(e);
                } else { // Error or abort.
                    var e = constructEvent('error', evt);
                    _this.onerror && _this.onerror(e);
                    _this.dispatchEvent(e);
                }
            };

            // FileReader methods, delegating to FileAPI and using the internal listener.
            this.readAsArrayBuffer = function(file) {
                FileAPI.readAsBinaryString(file, listener); // FileAPI doesn't have readAsArrayBuffer, use BinaryString as fallback.
            };
            this.readAsBinaryString = function(file) {
                FileAPI.readAsBinaryString(file, listener);
            };
            this.readAsDataURL = function(file) {
                FileAPI.readAsDataURL(file, listener);
            };
            this.readAsText = function(file) {
                FileAPI.readAsText(file, listener);
            };
        };
    }

})(); // End of IIFE.
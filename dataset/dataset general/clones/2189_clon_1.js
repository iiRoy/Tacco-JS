/*
 *  This is a slightly reformatted header comment.
 *  Original source: http://github.com/valums/file-uploader
 *
 *  Multiple file upload component with progress bar and drag-and-drop functionality.
 *  Copyright (c) 2010 Andrew Valums (andrew(at)valums.com)
 *
 *  Licensed under GNU GPL 2 or later and GNU LGPL 2 or later.
 *  Please refer to the license.txt file for full details.
 */


//
// Start of helper functions section
//
// These functions provide common utilities needed throughout the library.
//

var   qq   =   qq    ||    {};    // Initialize the global 'qq' object if it doesn't already exist.


/**
 *  This function is designed to add all properties from a source object
 *  to a target object, but only if they are missing in the target.
 *  It essentially extends the 'first' object with properties from the 'second' object.
 *
 *  @param {Object} first  The target object to be extended.
 *  @param {Object} second The source object whose properties will be copied.
 */
qq.extend    =    function(    first,    second    )    {
    // Iterate over all enumerable properties of the 'second' object.
    for   (    var    prop    in    second    )    {
        // Assign the property value from 'second' to 'first'.
        first[    prop    ]    =    second[    prop    ];
    }
};


/**
 *  Searches for a specified element within an array.
 *  If the element is found, its index is returned; otherwise, -1 is returned.
 *
 *  @param {Array}    arr    The array to search within.
 *  @param {*}        elt    The element to search for.
 *  @param {Number} [from] The optional index at which to start the search. Defaults to 0.
 *  @returns {Number} The index of the element if found, or -1 if not found.
 */
qq.indexOf   =   function(   arr,   elt,   from   )   {
    // Use the native Array.prototype.indexOf if available for performance.
    if   (   arr.indexOf   )   {
        return   arr.indexOf(   elt,   from   );
    }

    // Fallback for browsers that do not support native indexOf.
    from   =   from   ||   0;
    var   len   =   arr.length;

    // Adjust 'from' index if it's negative.
    if   (   from   <   0   )   {
        from   +=   len;
    }

    // Loop through the array starting from 'from'.
    for   (   ;   from   <   len;   from++   )   {
        // Check if the property exists and the value matches.
        if   (   from   in   arr   &&   arr[   from   ]   ===   elt   )   {
            return   from;
        }
    }
    // Element not found.
    return   -1;
};


//
//  Generate a unique ID each time this function is called.
//  This is an immediately invoked function expression (IIFE) to create a closure for 'id'.
//
qq.getUniqueId   =   (   function(   )   {
    var   id   =   0; // Private counter for unique IDs.
    return   function(   )   {   return   id++;   }; // Return the function that increments and returns the ID.
}   )   (   );


//
//  Event handling utilities.
//  These functions abstract cross-browser event attachment and detachment.
//

qq.attach   =   function(   element,   type,   fn   )   {
    // Standard DOM Level 2 event model.
    if   (   element.addEventListener   )   {
        element.addEventListener(   type,   fn,   false   );
    }   else   if   (   element.attachEvent   )   { // IE-specific event model.
        element.attachEvent(   'on'   +   type,   fn   );
    }
};


qq.detach   =   function(   element,   type,   fn   )   {
    // Standard DOM Level 2 event model.
    if   (   element.removeEventListener   )   {
        element.removeEventListener(   type,   fn,   false   );
    }   else   if   (   element.attachEvent   )   { // IE-specific event model for detachment.
        element.detachEvent(   'on'   +   type,   fn   );
    }
};


qq.preventDefault   =   function(   e   )   {
    // Prevent the default action of an event.
    if   (   e.preventDefault   )   {
        e.preventDefault(   );
    }   else   { // IE-specific way to prevent default.
        e.returnValue   =   false;
    }
};


//
//  DOM Node manipulation functions.
//  These functions simplify common DOM operations.
//

/**
 *  Inserts a given node 'a' directly before another node 'b' in the DOM tree.
 *  Both 'a' and 'b' must be valid DOM nodes.
 *  @param {Node} a The node to insert.
 *  @param {Node} b The reference node before which 'a' will be inserted.
 */
qq.insertBefore   =   function(   a,   b   )   {
    b.parentNode.insertBefore(   a,   b   );
};


qq.remove   =   function(   element   )   {
    // Removes an element from its parent node.
    element.parentNode.removeChild(   element   );
};


qq.contains   =   function(   parent,   descendant   )   {
    // Check if a parent element contains a descendant element.
    // Handles cases where parent and descendant are the same.
    if   (   parent   ==   descendant   )   {
        return   true;
    }

    // Use native 'contains' method if available (modern browsers).
    if   (   parent.contains   )   {
        return   parent.contains(   descendant   );
    }   else   {
        // Fallback for browsers that don't support 'contains' (e.g., older Firefox).
        // compareDocumentPosition returns a bitmask.
        // 8 means "NODE_CONTAINS": the reference node contains the other node.
        return   !!(   descendant.compareDocumentPosition(   parent   )   &   8   );
    }
};


/**
 *  Creates a new DOM element from an HTML string.
 *  This method leverages the browser's `innerHTML` parsing capabilities.
 *
 *  @param {String} html The HTML string representing the desired element.
 *  @returns {HTMLElement} The newly created DOM element.
 */
qq.toElement   =   (   function(   )   {
    var   div   =   document.createElement(   'div'   ); // A temporary div element for parsing HTML.
    return   function(   html   )   {
        div.innerHTML   =   html; // Set innerHTML to parse the string.
        var   element   =   div.firstChild; // The first child is our desired element.
        div.removeChild(   element   ); // Remove it from the temporary div.
        return   element; // Return the isolated element.
    };
}   )   (   );


//
//  Functions for manipulating Node properties and attributes.
//

/**
 *  Applies CSS styles to an element.
 *  Includes a fix for opacity handling in older Internet Explorer versions (IE6-8).
 *
 *  @param {HTMLElement} element The DOM element to apply styles to.
 *  @param {Object}      styles  An object containing CSS property-value pairs.
 */
qq.css   =   function(   element,   styles   )   {
    // Special handling for opacity to ensure cross-browser compatibility.
    if   (   styles.opacity   !=   null   )   {
        if   (   typeof   element.style.opacity   !=   'string'   &&   typeof(   element.filters   )   !=   'undefined'   )   {
            // IE-specific filter for opacity.
            styles.filter   =   'alpha(opacity='   +   Math.round(   100   *   styles.opacity   )   +   ')';
        }
    }
    // Extend the element's style object with the provided styles.
    qq.extend(   element.style,   styles   );
};


qq.hasClass   =   function(   element,   name   )   {
    // Checks if an element has a specific CSS class.
    var   re   =   new   RegExp(   '(^|   )'   +   name   +   '(   |$)'   );
    return   re.test(   element.className   );
};


qq.addClass   =   function(   element,   name   )   {
    // Adds a CSS class to an element if it doesn't already have it.
    if   (   !qq.hasClass(   element,   name   )   )   {
        element.className   +=   '   '   +   name;
    }
};


qq.removeClass   =   function(   element,   name   )   {
    // Removes a CSS class from an element.
    var   re   =   new   RegExp(   '(^|   )'   +   name   +   '(   |$)'   );
    element.className   =   element.className.replace(   re,   '   '   ).replace(   /^\s+|\s+$/g,   ""   );
};


qq.setText   =   function(   element,   text   )   {
    // Sets the text content of an element, handling cross-browser differences.
    element.innerText   =   text;   // For IE.
    element.textContent   =   text;   // For W3C compliant browsers.
};


//
//  Functions for selecting and traversing DOM elements.
//

qq.children   =   function(   element   )   {
    // Returns an array of an element's direct child elements (nodeType 1).
    var   children   =   [],
        child   =   element.firstChild;

    while   (   child   )   {
        if   (   child.nodeType   ==   1   )   {
            children.push(   child   );
        }
        child   =   child.nextSibling;
    }

    return   children;
};


qq.getByClass   =   function(   element,   className   )   {
    // Finds all descendant elements of 'element' that have the specified 'className'.
    // Uses native querySelectorAll if available for efficiency.
    if   (   element.querySelectorAll   )   {
        return   element.querySelectorAll(   '.'   +   className   );
    }

    var   result   =   [];
    var   candidates   =   element.getElementsByTagName(   "*"   ); // Get all descendants.
    var   len   =   candidates.length;

    for   (   var   i   =   0;   i   <   len;   i++   )   {
        if   (   qq.hasClass(   candidates[   i   ],   className   )   )   {
            result.push(   candidates[   i   ]   );
        }
    }
    return   result;
};


/**
 *  Converts a JavaScript object into a URL-encoded query string.
 *  This function mimics the behavior of jQuery.param().
 *
 *  Usage Example:
 *    `qq.obj2url({a:'b',c:'d'},'http://any.url/upload?otherParam=value');`
 *
 *  Result will be:
 *    `http://any.url/upload?otherParam=value&a=b&c=d`
 *
 *  @param  {Object}  obj         The JSON-like object to convert.
 *  @param  {String}  temp        The current querystring part, often a base URL with existing parameters.
 *  @param  {Boolean} prefixDone  Internal flag to manage prefixing.
 *  @return {String}  The URL-encoded query string.
 */
qq.obj2url   =   function(   obj,   temp,   prefixDone   )   {
    var   uristrings   =   [],
        prefix   =   '&',
        add   =   function(   nextObj,   i   )   {
            var   nextTemp   =   temp
                ?   (   /\[\]$/.test(   temp   )   )   // prevent double-encoding for array-like keys
                   ?   temp
                   :   temp   +   '['   +   i   +   ']'
                :   i;
            if   (   (   nextTemp   !=   'undefined'   )   &&   (   i   !=   'undefined'   )   )   {
                uristrings.push(
                    (   typeof   nextObj   ===   'object'   )
                        ?   qq.obj2url(   nextObj,   nextTemp,   true   )
                        :   (   Object.prototype.toString.call(   nextObj   )   ===   '[object Function]'   )
                            ?   encodeURIComponent(   nextTemp   )   +   '='   +   encodeURIComponent(   nextObj(   )   )
                            :   encodeURIComponent(   nextTemp   )   +   '='   +   encodeURIComponent(   nextObj   )
                );
            }
        };

    if   (   !prefixDone   &&   temp   )   {
      prefix   =   (   /\?/.test(   temp   )   )   ?   (   /\?$/.test(   temp   )   )   ?   ''   :   '&'   :   '?';
      uristrings.push(   temp   );
      uristrings.push(   qq.obj2url(   obj   )   );
    }   else   if   (   (   Object.prototype.toString.call(   obj   )   ===   '[object Array]'   )   &&   (   typeof   obj   !=   'undefined'   )   )   {
        // For arrays, use a standard for loop for better performance.
        for   (   var   i   =   0,   len   =   obj.length;   i   <   len;   ++i   )   {
            add(   obj[   i   ],   i   );
        }
    }   else   if   (   (   typeof   obj   !=   'undefined'   )   &&   (   obj   !==   null   )   &&   (   typeof   obj   ===   "object"   )   )   {
        // For other objects, iterate over properties using for-in.
        for   (   var   i   in   obj   )   {
            add(   obj[   i   ],   i   );
        }
    }   else   {
        // Handle scalar values.
        uristrings.push(   encodeURIComponent(   temp   )   +   '='   +   encodeURIComponent(   obj   )   );
    }

    return   uristrings.join(   prefix   )
                     .replace(   /^&/,   ''   )
                     .replace(   /%20/g,   '+'   );
};


//
//
//  Core Uploader Classes Definitions
//
//  This section defines the main classes for the file upload functionality.
//

var   qq   =   qq   ||   {}; // Ensure qq namespace is available (redundant but harmless)


/**
 *  The base class for the file uploader.
 *  It handles file selection, validation, and initiates the upload process,
 *  but does not manage the file list display or drag-and-drop UI.
 *
 *  @param {Object} o Configuration options for the uploader.
 */
qq.FileUploaderBasic   =   function(   o   )   {
    this._options   =   {
        // Debug mode: set to true to see server responses in console.
        debug:   false,
        // The URL endpoint for file uploads.
        action:   '/server/upload',
        // Additional parameters to send with each upload request.
        params:   {},
        // The DOM element that acts as the upload button.
        button:   null,
        // Allow selection of multiple files (if supported by browser).
        multiple:   true,
        // Maximum number of concurrent file uploads.
        maxConnections:   3,
        // File validation settings.
        allowedExtensions:   [],
        sizeLimit:   0, // Maximum file size in bytes (0 for no limit).
        minSizeLimit:   0, // Minimum file size in bytes (0 for no limit).
        // Event callbacks. Return 'false' from onSubmit to cancel the upload.
        onSubmit:   function(   id,   fileName   )   {},
        onProgress:   function(   id,   fileName,   loaded,   total   )   {},
        onComplete:   function(   id,   fileName,   responseJSON   )   {},
        onCancel:   function(   id,   fileName   )   {},
        // Messages displayed to the user for validation errors or warnings.
        messages:   {
            typeError:   "{file}   has   an   invalid   extension.   Only   {extensions}   are   allowed.",
            sizeError:   "{file}   is   too   large;   the   maximum   file   size   is   {sizeLimit}.",
            minSizeError:   "{file}   is   too   small;   the   minimum   file   size   is   {minSizeLimit}.",
            emptyError:   "{file}   is   empty.   Please   select   files   again   without   it.",
            onLeave:   "Files   are   currently   uploading.   Leaving   this   page   will   cancel   the   upload."
        },
        // Function to display messages to the user (e.g., alert, custom UI).
        showMessage:   function(   message   )   {
            alert(   message   );
        }
    };
    // Merge user-provided options with default options.
    qq.extend(   this._options,   o   );

    // Counter for files currently in progress of uploading.
    this._filesInProgress   =   0;
    // Instantiate the appropriate upload handler (XHR or Form based).
    this._handler   =   this._createUploadHandler(   );

    // If a button element is provided, create the upload button.
    if   (   this._options.button   )   {
        this._button   =   this._createUploadButton(   this._options.button   );
    }

    // Prevent accidental page navigation while uploads are active.
    this._preventLeaveInProgress(   );
};


qq.FileUploaderBasic.prototype   =   {
    /**
     *  Sets additional parameters to be sent with file uploads.
     *  @param {Object} params An object containing key-value pairs of parameters.
     */
    setParams:   function(   params   )   {
        this._options.params   =   params;
    },

    /**
     *  Returns the number of files currently being uploaded.
     *  @returns {Number} Count of files in progress.
     */
    getInProgress:   function(   )   {
        return   this._filesInProgress;
    },

    /**
     *  Creates the upload button instance.
     *  @param {HTMLElement} element The DOM element to transform into an upload button.
     *  @returns {qq.UploadButton} The created UploadButton instance.
     *  @private
     */
    _createUploadButton:   function(   element   )   {
        var   self   =   this; // Keep a reference to 'this' for callbacks.

        return   new   qq.UploadButton(   {
            element:   element,
            // Enable multiple file selection if allowed by options and XHR is supported.
            multiple:   this._options.multiple   &&   qq.UploadHandlerXhr.isSupported(   ),
            onChange:   function(   input   )   {
                self._onInputChange(   input   ); // Handle file input change event.
            }
        }   );
    },

    /**
     *  Determines and instantiates the appropriate upload handler (XHR or Form).
     *  @returns {qq.UploadHandlerXhr|qq.UploadHandlerForm} The upload handler instance.
     *  @private
     */
    _createUploadHandler:   function(   )   {
        var   self   =   this,
            handlerClass;

        // Choose XHR handler if supported, otherwise fall back to form handler.
        if   (   qq.UploadHandlerXhr.isSupported(   )   )   {
            handlerClass   =   'UploadHandlerXhr';
        }   else   {
            handlerClass   =   'UploadHandlerForm';
        }

        // Create an instance of the selected handler.
        var   handler   =   new   qq[   handlerClass   ](   {
            debug:   this._options.debug,
            action:   this._options.action,
            maxConnections:   this._options.maxConnections,
            onProgress:   function(   id,   fileName,   loaded,   total   )   {
                self._onProgress(   id,   fileName,   loaded,   total   );
                self._options.onProgress(   id,   fileName,   loaded,   total   ); // Call user-defined callback.
            },
            onComplete:   function(   id,   fileName,   result   )   {
                self._onComplete(   id,   fileName,   result   );
                self._options.onComplete(   id,   fileName,   result   ); // Call user-defined callback.
            },
            onCancel:   function(   id,   fileName   )   {
                self._onCancel(   id,   fileName   );
                self._options.onCancel(   id,   fileName   ); // Call user-defined callback.
            }
        }   );

        return   handler;
    },

    /**
     *  Attaches a 'beforeunload' event listener to the window
     *  to warn the user if they try to leave the page while uploads are in progress.
     *  @private
     */
    _preventLeaveInProgress:   function(   )   {
        var   self   =   this;

        qq.attach(   window,   'beforeunload',   function(   e   )   {
            if   (   !self._filesInProgress   )   {
                return; // No files uploading, no warning needed.
            }

            var   e   =   e   ||   window.event;
            // For IE and Firefox.
            e.returnValue   =   self._options.messages.onLeave;
            // For WebKit browsers.
            return   self._options.messages.onLeave;
        }   );
    },

    /**
     *  Internal handler for when a file submission begins.
     *  Increments the count of files in progress.
     *  @param {Number} id The unique ID of the file.
     *  @param {String} fileName The name of the file.
     *  @private
     */
    _onSubmit:   function(   id,   fileName   )   {
        this._filesInProgress++;
    },

    /**
     *  Internal handler for upload progress updates.
     *  (Currently does nothing in FileUploaderBasic, meant for subclasses or logging).
     *  @param {Number} id The unique ID of the file.
     *  @param {String} fileName The name of the file.
     *  @param {Number} loaded The number of bytes uploaded so far.
     *  @param {Number} total The total size of the file in bytes.
     *  @private
     */
    _onProgress:   function(   id,   fileName,   loaded,   total   )   {
        // This function can be overridden in subclasses for UI updates.
    },

    /**
     *  Internal handler for when a file upload completes (successfully or with error).
     *  Decrements the count of files in progress and displays any errors.
     *  @param {Number} id The unique ID of the file.
     *  @param {String} fileName The name of the file.
     *  @param {Object} result The server response (should be a JSON object).
     *  @private
     */
    _onComplete:   function(   id,   fileName,   result   )   {
        this._filesInProgress--;
        if   (   result.error   )   {
            this._options.showMessage(   result.error   ); // Display error message from server.
        }
    },

    /**
     *  Internal handler for when a file upload is cancelled.
     *  Decrements the count of files in progress.
     *  @param {Number} id The unique ID of the file.
     *  @param {String} fileName The name of the file.
     *  @private
     */
    _onCancel:   function(   id,   fileName   )   {
        this._filesInProgress--;
    },

    /**
     *  Handles the change event of the file input element.
     *  Initiates validation and upload based on the handler type (XHR or Form).
     *  @param {HTMLInputElement} input The file input element.
     *  @private
     */
    _onInputChange:   function(   input   )   {
        if   (   this._handler   instanceof   qq.UploadHandlerXhr   )   {
            // For XHR, process the FileList.
            this._uploadFileList(   input.files   );
        }   else   {
            // For form-based upload, process a single file input.
            if   (   this._validateFile(   input   )   )   {
                this._uploadFile(   input   );
            }
        }
        this._button.reset(   ); // Reset the file input to allow selecting the same file again.
    },

    /**
     *  Iterates through a FileList and uploads each valid file.
     *  @param {FileList} files The FileList object from a file input.
     *  @private
     */
    _uploadFileList:   function(   files   )   {
        // First, validate all files in the list.
        for   (   var   i   =   0;   i   <   files.length;   i++   )   {
            if   (   !this._validateFile(   files[   i   ]   )   )   {
                return; // Stop if any file is invalid.
            }
        }

        // If all files are valid, proceed with uploading them.
        for   (   var   i   =   0;   i   <   files.length;   i++   )   {
            this._uploadFile(   files[   i   ]   );
        }
    },

    /**
     *  Initiates the upload of a single file.
     *  @param {File|HTMLInputElement} fileContainer The File object or the file input element itself.
     *  @private
     */
    _uploadFile:   function(   fileContainer   )   {
        var   id   =   this._handler.add(   fileContainer   ); // Add file to handler, get unique ID.
        var   fileName   =   this._handler.getName(   id   ); // Get file name from handler.

        // Call the user-defined onSubmit callback. If it returns false, cancel the upload.
        if   (   this._options.onSubmit(   id,   fileName   )   !==   false   )   {
            this._onSubmit(   id,   fileName   ); // Internal submission logic.
            this._handler.upload(   id,   this._options.params   ); // Start the actual upload.
        }
    },

    /**
     *  Validates a file against configured rules (extensions, size limits).
     *  @param {File|HTMLInputElement} file The File object or the file input element.
     *  @returns {Boolean} True if the file is valid, false otherwise.
     *  @private
     */
    _validateFile:   function(   file   )   {
        var   name,   size;

        if   (   file.value   )   {
            // It's a file input element (for form-based uploads).
            name   =   file.value.replace(   /.*(\/|\\)/,   ""   ); // Extract file name, remove path.
        }   else   {
            // It's a File object (for XHR uploads).
            // Fix for missing properties in some browsers (e.g., Safari).
            name   =   file.fileName   !=   null   ?   file.fileName   :   file.name;
            size   =   file.fileSize   !=   null   ?   file.fileSize   :   file.size;
        }

        // Validate file extension.
        if   (   !this._isAllowedExtension(   name   )   )   {
            this._error(   'typeError',   name   );
            return   false;
        }   else   if   (   size   ===   0   )   {
            // Validate for empty files.
            this._error(   'emptyError',   name   );
            return   false;
        }   else   if   (   size   &&   this._options.sizeLimit   &&   size   >   this._options.sizeLimit   )   {
            // Validate against maximum file size.
            this._error(   'sizeError',   name   );
            return   false;
        }   else   if   (   size   &&   size   <   this._options.minSizeLimit   )   {
            // Validate against minimum file size.
            this._error(   'minSizeError',   name   );
            return   false;
        }

        return   true; // File passed all validations.
    },

    /**
     *  Displays an error message to the user based on a given error code.
     *  @param {String} code The error code (e.g., 'typeError', 'sizeError').
     *  @param {String} fileName The name of the file that caused the error.
     *  @private
     */
    _error:   function(   code,   fileName   )   {
        var   message   =   this._options.messages[   code   ];
        // Helper function to replace placeholders in the message.
        function   r(   name,   replacement   )   {
            message   =   message.replace(   name,   replacement   );
        }

        r(   '{file}',   this._formatFileName(   fileName   )   );
        r(   '{extensions}',   this._options.allowedExtensions.join(   ',   '   )   );
        r(   '{sizeLimit}',   this._formatSize(   this._options.sizeLimit   )   );
        r(   '{minSizeLimit}',   this._formatSize(   this._options.minSizeLimit   )   );

        this._options.showMessage(   message   ); // Display the formatted error message.
    },

    /**
     *  Formats a file name, truncating it if it's too long for display.
     *  @param {String} name The original file name.
     *  @returns {String} The formatted file name.
     *  @private
     */
    _formatFileName:   function(   name   )   {
        if   (   name.length   >   33   )   {
            name   =   name.slice(   0,   19   )   +   '...'   +   name.slice(   -13   );
        }
        return   name;
    },

    /**
     *  Checks if a file's extension is allowed based on the configuration.
     *  @param {String} fileName The name of the file.
     *  @returns {Boolean} True if the extension is allowed or no restrictions are set, false otherwise.
     *  @private
     */
    _isAllowedExtension:   function(   fileName   )   {
        // Extract the file extension.
        var   ext   =   (   -1   !==   fileName.indexOf(   '.'   )   )   ?   fileName.replace(   /.*[.]/,   ''   ).toLowerCase(   )   :   '';
        var   allowed   =   this._options.allowedExtensions;

        // If no allowed extensions are specified, all extensions are implicitly allowed.
        if   (   !allowed.length   )   {
            return   true;
        }

        // Check if the file's extension matches any in the allowed list.
        for   (   var   i   =   0;   i   <   allowed.length;   i++   )   {
            if   (   allowed[   i   ].toLowerCase(   )   ==   ext   )   {
                return   true;
            }
        }

        return   false; // Extension not found in the allowed list.
    },

    /**
     *  Formats a byte count into a human-readable size string (e.g., "1.2 MB").
     *  @param {Number} bytes The size in bytes.
     *  @returns {String} The formatted size string.
     *  @private
     */
    _formatSize:   function(   bytes   )   {
        var   i   =   -1;
        // Divide by 1024 until the number is less than 100.
        do   {
            bytes   =   bytes   /   1024;
            i++;
        }   while   (   bytes   >   99   );

        // Return formatted number with appropriate unit.
        return   Math.max(   bytes,   0.1   ).toFixed(   1   )   +   [   'kB',   'MB',   'GB',   'TB',   'PB',   'EB'   ][   i   ];
    }
};


/**
 *  The main FileUploader class, extending qq.FileUploaderBasic.
 *  This class adds UI components like drag-and-drop functionality and a file list display.
 *
 *  @class qq.FileUploader
 *  @augments qq.FileUploaderBasic
 *  @param {Object} o Configuration options, inheriting from FileUploaderBasic and adding UI-specific ones.
 */
qq.FileUploader   =   function(   o   )   {
    // Call the constructor of the parent class (qq.FileUploaderBasic).
    qq.FileUploaderBasic.apply(   this,   arguments   );

    // Additional options specific to the UI-enabled uploader.
    qq.extend(   this._options,   {
        element:   null, // The main container element for the uploader widget.
        // If specified, this element will be used as the file list container
        // instead of searching for a 'qq-upload-list' class within the template.
        listElement:   null,

        // HTML template for the entire uploader widget.
        template:   '<div   class="qq-uploader">'   +
                '<div   class="qq-upload-drop-area"><span>Drop   files   here   to   upload</span></div>'   +
                '<div   class="qq-upload-button">Upload   a   file</div>'   +
                '<ul   class="qq-upload-list"></ul>'   +
             '</div>',

        // HTML template for a single item in the file list.
        fileTemplate:   '<li>'   +
                '<span   class="qq-upload-file"></span>'   +
                '<span   class="qq-upload-spinner"></span>'   +
                '<span   class="qq-upload-size"></span>'   +
                '<a   class="qq-upload-cancel"   href="#">Cancel</a>'   +
                '<span   class="qq-upload-failed-text">Failed</span>'   +
            '</li>',
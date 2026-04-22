/*
 * Project: valums/file-uploader
 *
 * This JavaScript component facilitates multiple file uploads with advanced features
 * like a progress bar and drag-and-drop functionality.
 *
 * Developed by Andrew Valums (andrew@valums.com) in 2010.
 *
 * Licensed under the GNU General Public License version 2 or any later version.
 * For full license details, please refer to the accompanying license.txt file.
 *
 * This file contains core utility functions and the basic uploader class.
 */

// Global namespace for file uploader functionalities
var qq = qq || { };

//
// Utility Helper Functions for `qq` namespace
//

/**
 * Extends the properties of the first object with those from the second object.
 * Any properties present in 'second' will overwrite existing properties in 'first'.
 * This is a shallow copy operation.
 *
 * @param {Object} first  The target object to be extended.
 * @param {Object} second The source object providing new properties.
 */
qq.extend = function( first, second )
{
  for ( var prop in second )
  {
    // Ensure the property is owned by 'second' and not from its prototype chain
    if ( Object.prototype.hasOwnProperty.call( second, prop ) )
    {
      first[ prop ] = second[ prop ];
    }
  }
};


/**
 * Searches for a specified element within an array.
 * Returns the index of the first occurrence of the element, or -1 if not found.
 * This function provides a fallback for browsers that do not natively support Array.prototype.indexOf.
 *
 * @param {Array}  arr  The array to search within.
 * @param {*}      elt  The element to search for.
 * @param {Number} [from] The index at which to begin the search. Defaults to 0.
 * @returns {Number} The index of the element, or -1 if not found.
 */
qq.indexOf = function( arr, elt, from )
{
  // Utilize native indexOf if available for performance
  if ( arr.indexOf )
  {
    return arr.indexOf( elt, from );
  }

  // Fallback implementation for older browsers
  from = from || 0; // Initialize 'from' if not provided
  var len = arr.length;

  // Adjust 'from' index for negative values (counting from the end of the array)
  if ( from < 0 )
  {
    from += len;
  }

  // Iterate through the array starting from the 'from' index
  for ( ; from < len; from++ )
  {
    // Check if the index exists in the array and if the element matches
    if ( from in arr && arr[ from ] === elt )
    {
      return from;
    }
  }

  // Element not found in the array
  return -1;
};


/**
 * Generates unique numeric IDs sequentially.
 * This is an immediately invoked function expression (IIFE) to encapsulate the 'id' counter.
 *
 * @returns {Function} A function that returns the next unique ID upon each call.
 */
qq.getUniqueId = ( function()
{
  var id = 0; // Private counter for generating unique IDs

  return function()
  {
    return id++; // Increment and return the current ID
  };
} )();


//
// Event Handling Utilities
//

/**
 * Attaches an event listener to a DOM element.
 * Supports both modern (addEventListener) and older IE (attachEvent) event models.
 *
 * @param {HTMLElement} element The DOM element to attach the event to.
 * @param {String}      type    The type of event (e.g., 'click', 'load').
 * @param {Function}    fn      The event handler function.
 */
qq.attach = function( element, type, fn )
{
  if ( element.addEventListener )
  {
    element.addEventListener( type, fn, false ); // Modern browsers
  }
  else if ( element.attachEvent )
  {
    element.attachEvent( 'on' + type, fn ); // Internet Explorer
  }
};


/**
 * Detaches an event listener from a DOM element.
 * Supports both modern (removeEventListener) and older IE (detachEvent) event models.
 *
 * @param {HTMLElement} element The DOM element to detach the event from.
 * @param {String}      type    The type of event.
 * @param {Function}    fn      The event handler function to remove.
 */
qq.detach = function( element, type, fn )
{
  if ( element.removeEventListener )
  {
    element.removeEventListener( type, fn, false ); // Modern browsers
  }
  else if ( element.attachEvent ) // Note: Should be element.detachEvent for IE
  {
    element.detachEvent( 'on' + type, fn ); // Internet Explorer
  }
};


/**
 * Prevents the default action of an event.
 * Cross-browser compatible for `preventDefault` and `returnValue`.
 *
 * @param {Event} e The event object.
 */
qq.preventDefault = function( e )
{
  if ( e.preventDefault )
  {
    e.preventDefault(); // Standard method
  }
  else
  {
    e.returnValue = false; // IE method
  }
};


//
// DOM Node Manipulation Functions
//

/**
 * Inserts a DOM node 'a' immediately before another DOM node 'b'.
 *
 * @param {HTMLElement} a The node to be inserted.
 * @param {HTMLElement} b The reference node; 'a' will be inserted before it.
 */
qq.insertBefore = function( a, b )
{
  b.parentNode.insertBefore( a, b );
};


/**
 * Removes a given DOM element from its parent.
 *
 * @param {HTMLElement} element The element to be removed.
 */
qq.remove = function( element )
{
  if ( element && element.parentNode )
  {
    element.parentNode.removeChild( element );
  }
};


/**
 * Checks if a DOM element is a descendant of another DOM element.
 * Includes a special case where an element is considered to contain itself.
 *
 * @param {HTMLElement} parent     The potential parent element.
 * @param {HTMLElement} descendant The potential descendant element.
 * @returns {Boolean} True if 'descendant' is a child of 'parent' or is 'parent' itself, false otherwise.
 */
qq.contains = function( parent, descendant )
{
  // An element is considered to contain itself
  if ( parent == descendant )
  {
    return true;
  }

  // Use native .contains() method if available (modern browsers)
  if ( parent.contains )
  {
    return parent.contains( descendant );
  }
  else
  {
    // Fallback for older browsers (e.g., Firefox before .contains) using compareDocumentPosition
    // The bitmask '8' indicates that the reference node (descendant) contains the other node (parent).
    // So, parent contains descendant if descendant's position relative to parent is 'preceding' (4)
    // or 'contains' (8). We want 'parent contains descendant', which means the result of
    // compareDocumentPosition(parent) & 8 should be true.
    return !!( descendant.compareDocumentPosition( parent ) & 8 );
  }
};


/**
 * Creates a DOM element from an HTML string.
 * This is an IIFE to manage a single 'div' element for parsing.
 *
 * @returns {Function} A function that takes an HTML string and returns the first created DOM element.
 */
qq.toElement = ( function()
{
  var div = document.createElement( 'div' ); // A temporary div used for parsing HTML

  return function( html )
  {
    div.innerHTML = html; // Set the innerHTML to parse the string
    var element = div.firstChild; // Get the first child (the created element)

    // Detach the element from the temporary div to return it
    if ( element && div.contains( element ) )
    {
      div.removeChild( element );
    }
    return element;
  };
} )();


//
// Node Properties and Attributes Manipulation
//

/**
 * Sets CSS styles for a given DOM element.
 * Includes a fix for opacity handling in older Internet Explorer versions (IE6-8).
 *
 * @param {HTMLElement} element The DOM element to apply styles to.
 * @param {Object}      styles  An object where keys are CSS property names and values are their desired values.
 */
qq.css = function( element, styles )
{
  // Special handling for opacity to support older IE browsers
  if ( styles.opacity != null )
  {
    // Check if browser does not support standard opacity property and has filters (IE specific)
    if ( typeof element.style.opacity != 'string' && typeof( element.filters ) != 'undefined' )
    {
      // Apply IE-specific alpha filter for opacity
      styles.filter = 'alpha(opacity=' + Math.round( 100 * styles.opacity ) + ')';
    }
  }

  // Extend the element's style object with the provided styles
  qq.extend( element.style, styles );
};


/**
 * Checks if a DOM element has a specific CSS class.
 *
 * @param {HTMLElement} element The DOM element to check.
 * @param {String}      name    The CSS class name to look for.
 * @returns {Boolean} True if the element has the class, false otherwise.
 */
qq.hasClass = function( element, name )
{
  // Create a regular expression to match the class name, ensuring it's a whole word
  var re = new RegExp( '(^| )' + name + '( |$)' );
  return re.test( element.className );
};


/**
 * Adds a CSS class to a DOM element if it doesn't already have it.
 *
 * @param {HTMLElement} element The DOM element to add the class to.
 * @param {String}      name    The CSS class name to add.
 */
qq.addClass = function( element, name )
{
  if ( !qq.hasClass( element, name ) )
  {
    element.className += ' ' + name; // Append the new class name
  }
};


/**
 * Removes a specific CSS class from a DOM element.
 * Handles multiple spaces and leading/trailing spaces after removal.
 *
 * @param {HTMLElement} element The DOM element to remove the class from.
 * @param {String}      name    The CSS class name to remove.
 */
qq.removeClass = function( element, name )
{
  // Create a regular expression to find and replace the class name
  var re = new RegExp( '(^| )' + name + '( |$)' );
  // Replace the class, then clean up any extra spaces that might result
  element.className = element.className.replace( re, ' ' ).replace( /^\s+|\s+$/g, "" );
};


/**
 * Sets the text content of a DOM element.
 * Uses both `innerText` (for IE) and `textContent` (for modern browsers) for cross-browser compatibility.
 *
 * @param {HTMLElement} element The DOM element whose text content will be set.
 * @param {String}      text    The text string to set.
 */
qq.setText = function( element, text )
{
  element.innerText = text;    // For IE
  element.textContent = text;  // For modern browsers
};


//
// Element Selection and Traversal Functions
//

/**
 * Retrieves an array of direct child elements (nodeType 1) of a given DOM element.
 *
 * @param {HTMLElement} element The parent DOM element.
 * @returns {Array<HTMLElement>} An array containing the child elements.
 */
qq.children = function( element )
{
  var children = [],
      child = element.firstChild; // Start with the first child node

  while ( child )
  {
    // Check if the node is an element node (nodeType 1)
    if ( child.nodeType == 1 )
    {
      children.push( child );
    }
    child = child.nextSibling; // Move to the next sibling node
  }

  return children;
};


/**
 * Finds all descendant elements of a given element that have a specific CSS class.
 * Utilizes `querySelectorAll` for modern browsers and falls back to `getElementsByTagName`
 * combined with `qq.hasClass` for older browsers.
 *
 * @param {HTMLElement} element   The root element to search within.
 * @param {String}      className The CSS class name to search for.
 * @returns {Array<HTMLElement>|NodeList} A list of matching elements.
 */
qq.getByClass = function( element, className )
{
  // Use native querySelectorAll if available (most efficient)
  if ( element.querySelectorAll )
  {
    return element.querySelectorAll( '.' + className );
  }

  // Fallback for older browsers
  var result = [];
  var candidates = element.getElementsByTagName( "*" ); // Get all descendants
  var len = candidates.length;

  for ( var i = 0; i < len; i++ )
  {
    if ( qq.hasClass( candidates[ i ], className ) )
    {
      result.push( candidates[ i ] );
    }
  }
  return result;
};


/**
 * Converts a JavaScript object into a URL-encoded query string.
 * This function mimics jQuery.param() behavior.
 *
 * Example Usage:
 * `qq.obj2url({a:'b',c:'d'},'http://any.url/upload?otherParam=value');`
 * will result in:
 * `http://any.url/upload?otherParam=value&a=b&c=d`
 *
 * @param  {Object} obj          The JSON-like object to convert.
 * @param  {String} [temp]       Optional: A base URL or existing query string part to append to.
 * @param  {Boolean} [prefixDone] Internal flag to manage prefixing.
 * @return {String} The URL-encoded query string.
 */
qq.obj2url = function( obj, temp, prefixDone )
{
  var uristrings = [],
      prefix = '&', // Default prefix for parameters
      // Helper function to add a key-value pair to the uristrings array
      add = function( nextObj, i )
      {
        var nextTemp = temp
            ? ( /\[\]$/.test( temp ) ) // Check if 'temp' ends with '[]' (for array handling)
                ? temp
                : temp + '[' + i + ']' // Append array index or object key
            : i; // If no 'temp', use 'i' as the base key

        // Only add if nextTemp and i are defined, preventing 'undefined=undefined'
        if ( ( nextTemp != 'undefined' ) && ( i != 'undefined' ) )
        {
          uristrings.push(
              ( typeof nextObj === 'object' )
                  ? qq.obj2url( nextObj, nextTemp, true ) // Recursively call for nested objects/arrays
                  : ( Object.prototype.toString.call( nextObj ) === '[object Function]' ) // Handle functions
                      ? encodeURIComponent( nextTemp ) + '=' + encodeURIComponent( nextObj() )
                      : encodeURIComponent( nextTemp ) + '=' + encodeURIComponent( nextObj ) // Encode scalar values
          );
        }
      };

  // If a base URL or existing query string is provided (and not already processed)
  if ( !prefixDone && temp )
  {
    prefix = ( /\?/.test( temp ) ) ? ( /\?$/.test( temp ) ? '' : '&' ) : '?'; // Determine if '?' or '&' is needed
    uristrings.push( temp ); // Add the base URL/query string
    uristrings.push( qq.obj2url( obj ) ); // Recursively process the object without a base
  }
  // If the object is an array
  else if ( ( Object.prototype.toString.call( obj ) === '[object Array]' ) && ( typeof obj != 'undefined' ) )
  {
    // Iterate through array elements using a standard for loop for performance
    for ( var i = 0, len = obj.length; i < len; ++i )
    {
      add( obj[ i ], i );
    }
  }
  // If the object is a non-null, non-array object
  else if ( ( typeof obj != 'undefined' ) && ( obj !== null ) && ( typeof obj === "object" ) )
  {
    // Iterate through object properties using a for-in loop
    for ( var i in obj )
    {
      // Ensure the property belongs to the object itself, not its prototype chain
      if ( Object.prototype.hasOwnProperty.call( obj, i ) )
      {
        add( obj[ i ], i );
      }
    }
  }
  // If it's a scalar value (primitive type)
  else
  {
    uristrings.push( encodeURIComponent( temp ) + '=' + encodeURIComponent( obj ) );
  }

  // Join all parts with the determined prefix, clean up leading '&', and replace spaces with '+'
  return uristrings.join( prefix )
                     .replace( /^&/, '' )
                     .replace( /%20/g, '+' );
};


//
//
// Uploader Classes Definitions
//
//
// Re-initialize or ensure `qq` namespace exists
var qq = qq || { };


/**
 * qq.FileUploaderBasic
 *
 * This class provides the fundamental file upload functionality.
 * It handles file selection, validation, and interaction with upload handlers (XHR or Form).
 * It does NOT include UI components like file lists or drag-and-drop areas.
 *
 * @constructor
 * @param {Object} o Configuration options for the uploader.
 */
qq.FileUploaderBasic = function( o )
{
  // Default configuration options for the uploader instance
  this._options = {
    debug: false,                       // Set to true to enable console debugging
    action: '/server/upload',           // URL for the upload server endpoint
    params: {},                         // Additional parameters to send with the upload
    button: null,                       // DOM element that acts as the upload button
    multiple: true,                     // Allow multiple file selection
    maxConnections: 3,                  // Maximum concurrent uploads

    // File validation settings
    allowedExtensions: [],              // Array of allowed file extensions (e.g., ['jpg', 'png'])
    sizeLimit: 0,                       // Maximum file size in bytes (0 means no limit)
    minSizeLimit: 0,                    // Minimum file size in bytes (0 means no limit)

    // Event callbacks
    onSubmit: function( id, fileName ) {},                       // Called when a file is submitted for upload
    onProgress: function( id, fileName, loaded, total ) {},     // Called during upload progress
    onComplete: function( id, fileName, responseJSON ) {},      // Called when an upload is complete (success or failure)
    onCancel: function( id, fileName ) {},                       // Called when an upload is cancelled

    // User-facing messages
    messages: {
      typeError: "{file} has an invalid extension. Only {extensions} are allowed.",
      sizeError: "{file} is too large; the maximum file size is {sizeLimit}.",
      minSizeError: "{file} is too small; the minimum file size is {minSizeLimit}.",
      emptyError: "{file} is empty. Please select files again without it.",
      onLeave: "The files are currently being uploaded. Leaving this page will cancel the upload process."
    },
    showMessage: function( message )
    {
      alert( message ); // Default message display method (can be overridden)
    }
  };

  // Extend default options with user-provided options
  qq.extend( this._options, o );

  // Internal state variables
  this._filesInProgress = 0; // Counter for files currently being uploaded
  this._handler = this._createUploadHandler(); // Instantiate the appropriate upload handler (XHR or Form)

  // If a button element is provided, create the upload button wrapper
  if ( this._options.button )
  {
    this._button = this._createUploadButton( this._options.button );
  }

  // Prevent accidental page navigation while uploads are in progress
  this._preventLeaveInProgress();
};


// Define prototype methods for qq.FileUploaderBasic
qq.FileUploaderBasic.prototype = {

  /**
   * Sets or updates parameters that will be sent with subsequent uploads.
   *
   * @param {Object} params An object containing key-value pairs for new parameters.
   */
  setParams: function( params )
  {
    this._options.params = params;
  },

  /**
   * Returns the number of files currently being uploaded.
   *
   * @returns {Number} Count of files in progress.
   */
  getInProgress: function()
  {
    return this._filesInProgress;
  },

  /**
   * Creates an instance of qq.UploadButton.
   * This button manages the file input element and triggers file selection.
   *
   * @param {HTMLElement} element The DOM element to transform into an upload button.
   * @returns {qq.UploadButton} The created upload button instance.
   */
  _createUploadButton: function( element )
  {
    var self = this; // Capture 'this' for use in the onChange callback

    return new qq.UploadButton( {
      element: element,
      // Enable multiple file selection if allowed and XHR is supported
      multiple: this._options.multiple && qq.UploadHandlerXhr.isSupported(),
      onChange: function( input )
      {
        self._onInputChange( input ); // Handle file selection
      }
    } );
  },

  /**
   * Instantiates either qq.UploadHandlerXhr or qq.UploadHandlerForm based on browser capabilities.
   *
   * @returns {qq.UploadHandlerXhr|qq.UploadHandlerForm} The selected upload handler.
   */
  _createUploadHandler: function()
  {
    var self = this, // Capture 'this' for use in handler callbacks
        handlerClass;

    // Determine which handler to use based on XHR upload support
    if ( qq.UploadHandlerXhr.isSupported() )
    {
      handlerClass = 'UploadHandlerXhr';
    }
    else
    {
      handlerClass = 'UploadHandlerForm';
    }

    // Create an instance of the chosen handler
    var handler = new qq[ handlerClass ]( {
      debug: this._options.debug,
      action: this._options.action,
      maxConnections: this._options.maxConnections,

      // Proxy progress events to both internal handler and user-defined callback
      onProgress: function( id, fileName, loaded, total )
      {
        self._onProgress( id, fileName, loaded, total );
        self._options.onProgress( id, fileName, loaded, total );
      },
      // Proxy complete events
      onComplete: function( id, fileName, result )
      {
        self._onComplete( id, fileName, result );
        self._options.onComplete( id, fileName, result );
      },
      // Proxy cancel events
      onCancel: function( id, fileName )
      {
        self._onCancel( id, fileName );
        self._options.onCancel( id, fileName );
      }
    } );

    return handler;
  },

  /**
   * Attaches a 'beforeunload' event listener to the window to warn the user
   * if they try to leave the page while files are still uploading.
   */
  _preventLeaveInProgress: function()
  {
    var self = this; // Capture 'this' for the event handler

    qq.attach( window, 'beforeunload', function( e )
    {
      // If no files are in progress, do nothing
      if ( !self._filesInProgress )
      {
        return;
      }

      var e = e || window.event; // Get the event object (cross-browser)
      // For IE and Firefox
      e.returnValue = self._options.messages.onLeave;
      // For WebKit browsers
      return self._options.messages.onLeave;
    } );
  },

  /**
   * Internal callback when a file submission starts. Increments the in-progress counter.
   *
   * @param {Number} id       The unique ID of the file.
   * @param {String} fileName The name of the file.
   * @private
   */
  _onSubmit: function( id, fileName )
  {
    this._filesInProgress++;
  },

  /**
   * Internal callback during file upload progress. Placeholder, can be extended by subclasses.
   *
   * @param {Number} id       The unique ID of the file.
   * @param {String} fileName The name of the file.
   * @param {Number} loaded   Bytes loaded.
   * @param {Number} total    Total bytes of the file.
   * @private
   */
  _onProgress: function( id, fileName, loaded, total )
  {
    // This method is intentionally left empty in the basic uploader.
    // Subclasses like qq.FileUploader can override this to update UI elements.
  },

  /**
   * Internal callback when a file upload completes (either success or failure).
   * Decrements the in-progress counter and displays an error if present in the result.
   *
   * @param {Number} id       The unique ID of the file.
   * @param {String} fileName The name of the file.
   * @param {Object} result   The JSON response from the server.
   * @private
   */
  _onComplete: function( id, fileName, result )
  {
    this._filesInProgress--; // Decrement the count of files in progress

    if ( result.error )
    {
      this._options.showMessage( result.error ); // Display server-side error message
    }
  },

  /**
   * Internal callback when a file upload is cancelled. Decrements the in-progress counter.
   *
   * @param {Number} id       The unique ID of the file.
   * @param {String} fileName The name of the file.
   * @private
   */
  _onCancel: function( id, fileName )
  {
    this._filesInProgress--;
  },

  /**
   * Handles the change event from the file input element.
   * Determines whether to use XHR or form-based upload and initiates validation/upload.
   *
   * @param {HTMLInputElement} input The file input element.
   * @private
   */
  _onInputChange: function( input )
  {
    // If using XHR, process the FileList directly
    if ( this._handler instanceof qq.UploadHandlerXhr )
    {
      this._uploadFileList( input.files );
    }
    // Otherwise, use form-based upload (only one file at a time per input)
    else
    {
      // Validate the single file input
      if ( this._validateFile( input ) )
      {
        this._uploadFile( input );
      }
    }

    this._button.reset(); // Reset the file input to allow selecting the same file again
  },

  /**
   * Iterates through a FileList and initiates uploads for each valid file.
   * Primarily used with XHR uploads where multiple files can be selected simultaneously.
   *
   * @param {FileList} files A FileList object from a file input.
   * @private
   */
  _uploadFileList: function( files )
  {
    // First pass: validate all files. If any fail, stop processing the list.
    for ( var i = 0; i < files.length; i++ )
    {
      if ( !this._validateFile( files[ i ] ) )
      {
        return; // Stop if any file is invalid
      }
    }

    // Second pass: if all files are valid, initiate upload for each
    for ( var i = 0; i < files.length; i++ )
    {
      this._uploadFile( files[ i ] );
    }
  },

  /**
   * Initiates the upload process for a single file or file input element.
   *
   * @param {File|HTMLInputElement} fileContainer The File object or the file input element.
   * @private
   */
  _uploadFile: function( fileContainer )
  {
    var id = this._handler.add( fileContainer ); // Add file to the handler, get its unique ID
    var fileName = this._handler.getName( id );  // Get the file name using its ID

    // Call the user's onSubmit callback. If it returns false, cancel the upload.
    if ( this._options.onSubmit( id, fileName ) !== false )
    {
      this._onSubmit( id, fileName ); // Internal submission handling
      this._handler.upload( id, this._options.params ); // Start the actual upload
    }
  },

  /**
   * Validates a file (or file input) against configured rules (extensions, size limits).
   *
   * @param {File|HTMLInputElement} file The File object or the file input element.
   * @returns {Boolean} True if the file is valid, false otherwise.
   * @private
   */
  _validateFile: function( file )
  {
    var name, size;

    // Determine file name and size based on whether it's a File object or an input element
    if ( file.value )
    {
      // It's a file input element; extract name from its value, removing path
      name = file.value.replace( /.*(\/|\\)/, "" );
    }
    else
    {
      // It's a File object (from FileList); fix missing properties in Safari
      name = file.fileName != null ? file.fileName : file.name;
      size = file.fileSize != null ? file.fileSize : file.size;
    }

    // --- Validation checks ---

    // 1. Check allowed extensions
    if ( !this._isAllowedExtension( name ) )
    {
      this._error( 'typeError', name );
      return false;
    }
    // 2. Check for empty file (size 0)
    else if ( size === 0 )
    {
      this._error( 'emptyError', name );
      return false;
    }
    // 3. Check against maximum file size limit
    else if ( size && this._options.sizeLimit && size > this._options.sizeLimit )
    {
      this._error( 'sizeError', name );
      return false;
    }
    // 4. Check against minimum file size limit
    else if ( size && size < this._options.minSizeLimit )
    {
      this._error( 'minSizeError', name );
      return false;
    }

    // If all checks pass, the file is valid
    return true;
  },

  /**
   * Displays an error message to the user, replacing placeholders in the message template.
   *
   * @param {String} code     The error code (key in this._options.messages).
   * @param {String} fileName The name of the file that caused the error.
   * @private
   */
  _error: function( code, fileName )
  {
    var message = this._options.messages[ code ]; // Retrieve the base message template

    // Helper function to replace placeholders in the message
    function r( name, replacement )
    {
      message = message.replace( name, replacement );
    }

    // Replace common placeholders
    r( '{file}', this._formatFileName( fileName ) );
    r( '{extensions}', this._options.allowedExtensions.join( ', ' ) );
    r( '{sizeLimit}', this._formatSize( this._options.sizeLimit ) );
    r( '{minSizeLimit}', this._formatSize( this._options.minSizeLimit ) );

    this._options.showMessage( message ); // Display the formatted error message
  },

  /**
   * Formats a file name for display, truncating long names for readability.
   *
   * @param {String} name The original file name.
   * @returns {String} The formatted file name.
   * @private
   */
  _formatFileName: function( name )
  {
    if ( name.length > 33 )
    {
      // Truncate long names: first 19 chars + '...' + last 13 chars
      name = name.slice( 0, 19 ) + '...' + name.slice( -13 );
    }
    return name;
  },

  /**
   * Checks if a file's extension is allowed based on the configured `allowedExtensions`.
   *
   * @param {String} fileName The name of the file to check.
   * @returns {Boolean} True if the extension is allowed or if no extensions are specified, false otherwise.
   * @private
   */
  _isAllowedExtension: function( fileName )
  {
    // Extract the file extension, convert to lowercase
    var ext = ( -1 !== fileName.indexOf( '.' ) ) ? fileName.replace( /.*[.]/, '' ).toLowerCase() : '';
    var allowed = this._options.allowedExtensions;

    // If no allowed extensions are specified, all extensions are implicitly allowed
    if ( !allowed.length )
    {
      return true;
    }

    // Check if the extracted extension matches any in the allowed list
    for ( var i = 0; i < allowed.length; i++ )
    {
      if ( allowed[ i ].toLowerCase() == ext )
      {
        return true;
      }
    }

    return false; // Extension not found in the allowed list
  },

  /**
   * Formats a file size in bytes into a human-readable string (e.g., "1.2 MB").
   *
   * @param {Number} bytes The file size in bytes.
   * @returns {String} The formatted size string.
   * @private
   */
  _formatSize: function( bytes )
  {
    var i = -1; // Index for size units (kB, MB, etc.)
    var units = [ 'kB', 'MB', 'GB', 'TB', 'PB', 'EB' ]; // Array of size units

    // Convert bytes to kilobytes, then megabytes, etc., until it's less than 100
    do
    {
      bytes = bytes / 1024;
      i++;
    } while ( bytes > 99 );

    // Format to one decimal place and append the appropriate unit
    // Ensure result is at least 0.1 to avoid displaying "0.0 kB" for small files
    return Math.max( bytes, 0.1 ).toFixed( 1 ) + units[ i ];
  }
};


/**
 * qq.FileUploader
 *
 * This class extends qq.FileUploaderBasic to provide a complete upload widget
 * with a user interface, including drag-and-drop functionality and a file list.
 *
 * @constructor
 * @param {Object} o Configuration options for the uploader.
 * @inherits qq.FileUploaderBasic
 */
qq.FileUploader = function( o )
{
  // Call the parent constructor (qq.FileUploaderBasic) to initialize basic functionalities
  qq.FileUploaderBasic.apply( this, arguments );

  // Additional options specific to the UI-enhanced uploader
  qq.extend( this._options, {
    element: null, // The DOM element where the uploader widget will be rendered
    listElement: null, // Optional: A specific element to use as the file list container (defaults to one in template)

    // HTML template string for the entire uploader widget
    template: '<div class="qq-uploader">' +
              '<div class="qq-upload-drop-area"><span>Drop files here to upload</span></div>' +
              '<div class="qq-upload-button">Upload a file</div>' +
              '<ul class="qq-upload-list"></ul>' + // This is where file items will be added
              '</div>',

    // HTML template string for a single file item in the file list
    fileTemplate: '<li>' +
                  '<span class="qq-upload-file"></span>' +
                  '<span class="qq-upload-spinner"></span>' +
                  '<span class="qq-upload-size"></span>' +
                  '<a class="qq-upload-cancel" href="#">Cancel</a>' +
                  '<span class="qq-upload-failed-text">Failed</span>' +
                  '</li>',
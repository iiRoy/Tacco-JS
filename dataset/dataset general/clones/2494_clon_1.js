/*
 *  This code is part of the valums/file-uploader project.
 *  You can find the original project at: http://github.com/valums/file-uploader
 *
 *  A robust JavaScript component designed for multiple file uploads,
 *  featuring a progress bar and drag-and-drop functionality.
 *  Original author: © 2010 Andrew Valums ( andrew(at)valums.com )
 *
 *  This software is distributed under the terms of the GNU GPL 2 or later
 *  and GNU LGPL 2 or later licenses. Please refer to license.txt for full details.
 */

/*
 *  Utility functions for the 'qq' namespace.
 *  These are general-purpose helpers not directly related to the uploader's core logic.
 */

var qq = qq || {}; // Ensure the global 'qq' object exists, initialize if not.

/*
 *  The 'extend' utility function.
 *  Purpose: Merges properties from a source object into a target object.
 *  Specifically, it adds all properties found in 'second' to 'first',
 *  overwriting existing properties in 'first' if they share the same key.
 *
 *  @param {Object} first  The target object to be extended.
 *  @param {Object} second The source object whose properties will be copied.
 */
qq.extend = function ( first, second )
{
    // Iterate over each property in the 'second' object.
    for ( var prop in second ) {
        // Assign the property's value from 'second' to 'first'.
        first[ prop ] = second[ prop ];
    }
};

/**
 *  Implements a cross-browser compatible array search function.
 *  Searches for a specific element within an array and returns its index.
 *  Returns -1 if the element is not found in the array.
 *
 *  @param {Array} arr  The array within which to perform the search.
 *  @param {*} elt      The element value to search for.
 *  @param {Number} [from] Optional. The index from which to start the search.
 *                        If omitted, the search starts from index 0.
 *                        If negative, it's treated as an offset from the end of the array.
 *  @returns {Number} The index of the found element, or -1 if not found.
 */
qq.indexOf = function ( arr, elt, from )
{
    // Prefer the native Array.prototype.indexOf method for better performance and compliance.
    if ( arr.indexOf ) {
        return arr.indexOf( elt, from );
    }

    // Fallback implementation for environments that do not support Array.prototype.indexOf.
    from = from || 0; // Initialize 'from' to 0 if it's undefined or falsy.
    var len = arr.length; // Cache array length for efficiency.

    // Adjust the starting index if a negative 'from' value was provided.
    if ( from < 0 ) {
        from += len;
    }

    // Loop through the array elements starting from the 'from' index.
    for ( ; from < len; from++ )
    {
        // Check if the current index is a valid property of the array
        // and if the element at that index strictly equals the target element.
        if ( from in arr && arr[ from ] === elt )
        {
            return from; // Element found, return its index.
        }
    }
    return -1; // Element not found after checking all relevant positions.
};

// A self-executing anonymous function to create a closure for ID generation.
qq.getUniqueId = ( function ( )
{
    var id = 0; // Private counter, initialized to zero.

    // The returned function is the actual ID generator.
    return function ( )
    {
        return id++; // Returns the current 'id' value, then increments it for the next call.
    };
} ) ( );

// --- Event Handling Functions ---

/**
 *  Attaches an event listener to a specified DOM element.
 *  Provides cross-browser compatibility for event attachment.
 *
 *  @param {HTMLElement} element The DOM element to which the event listener will be attached.
 *  @param {String} type         The type of event to listen for (e.g., 'click', 'mouseover', 'load').
 *  @param {Function} fn          The event handler function to execute when the event occurs.
 */
qq.attach = function ( element, type, fn )
{
    // Use the W3C standard 'addEventListener' if available (modern browsers).
    if ( element.addEventListener )
    {
        element.addEventListener( type, fn, false ); // 'false' indicates event bubbling.
    }
    // Fallback to Microsoft's 'attachEvent' for older Internet Explorer versions.
    else if ( element.attachEvent )
    {
        element.attachEvent( 'on' + type, fn ); // 'on' prefix is required for attachEvent.
    }
};

/**
 *  Detaches an event listener from a specified DOM element.
 *  Offers cross-browser compatibility for event detachment.
 *
 *  @param {HTMLElement} element The DOM element from which the event listener will be detached.
 *  @param {String} type         The type of event.
 *  @param {Function} fn          The specific event handler function to remove.
 */
qq.detach = function ( element, type, fn )
{
    // Use the W3C standard 'removeEventListener' if available.
    if ( element.removeEventListener )
    {
        element.removeEventListener( type, fn, false );
    }
    // Fallback to Microsoft's 'detachEvent' for older Internet Explorer versions.
    else if ( element.attachEvent ) // Note: 'attachEvent' is checked, but 'detachEvent' is called.
    {
        element.detachEvent( 'on' + type, fn );
    }
};

/**
 *  Prevents the default action associated with an event.
 *  Ensures cross-browser compatibility for preventing default event behavior.
 *
 *  @param {Event} e The event object whose default action is to be prevented.
 */
qq.preventDefault = function ( e )
{
    // Use the W3C standard 'preventDefault' method.
    if ( e.preventDefault )
    {
        e.preventDefault( );
    }
    // Fallback for older Internet Explorer versions, which use 'returnValue'.
    else
    {
        e.returnValue = false;
    }
};

// --- DOM Node Manipulation ---

/**
 *  Inserts a given DOM node 'a' immediately before another DOM node 'b'.
 *  Both 'a' and 'b' must be valid DOM elements.
 *
 *  @param {HTMLElement} a The node to be inserted.
 *  @param {HTMLElement} b The reference node; 'a' will be inserted directly before it.
 */
qq.insertBefore = function ( a, b )
{
    // Access the parent node of 'b' and use its insertBefore method.
    b.parentNode.insertBefore( a, b );
};

/**
 *  Removes a specified DOM element from its parent node.
 *
 *  @param {HTMLElement} element The DOM element to be removed from the document.
 */
qq.remove = function ( element )
{
    // Access the parent node of the 'element' and call removeChild.
    element.parentNode.removeChild( element );
};

/**
 *  Determines if one DOM element ('descendant') is contained within another ('parent').
 *  This includes cases where 'descendant' is a direct child, a grandchild, or
 *  even the 'parent' itself.
 *
 *  @param {HTMLElement} parent     The potential parent container element.
 *  @param {HTMLElement} descendant The potential descendant element.
 *  @returns {boolean} True if 'descendant' is contained within or is the same as 'parent', false otherwise.
 */
qq.contains = function ( parent, descendant )
{
    // If both elements are identical, 'parent' contains 'descendant'.
    if ( parent == descendant ) return true;

    // Use the native 'contains' method if available (modern browsers).
    if ( parent.contains )
    {
        return parent.contains( descendant );
    }
    // Fallback for browsers that do not support 'contains' (e.g., older Firefox).
    // Uses compareDocumentPosition, where bit 8 (Node.DOCUMENT_POSITION_CONTAINS)
    // indicates that the reference node (descendant) is contained by the other node (parent).
    else
    {
        return !!( descendant.compareDocumentPosition( parent ) & 8 );
    }
};

/**
 *  A utility function to create a DOM element from an HTML string.
 *  This is achieved by setting the innerHTML of a temporary div element.
 *  The temporary div is created only once thanks to a closure, optimizing performance.
 *
 *  @returns {Function} A function that takes an HTML string and returns the first created DOM element.
 */
qq.toElement = ( function ( )
{
    var div = document.createElement( 'div' ); // Create a single, reusable temporary div element.

    // Return the actual function that will be assigned to qq.toElement.
    return function ( html )
    {
        div.innerHTML = html;          // Parse the HTML string by assigning it to the div's innerHTML.
        var element = div.firstChild;  // The desired element is the first child of the temporary div.
        div.removeChild( element );    // Remove the element from the temporary div to return it.
        return element;                // Return the newly created DOM element.
    };
} ) ( );

// --- Node Properties and Attributes ---

/**
 *  Applies a set of CSS styles to a given DOM element.
 *  Includes a special fix to handle CSS opacity property for older Internet Explorer browsers (IE6-8).
 *
 *  @param {HTMLElement} element The DOM element to which styles will be applied.
 *  @param {Object} styles       An object literal where keys are CSS property names
 *                                and values are their corresponding style values.
 */
qq.css = function ( element, styles )
{
    // Check if an 'opacity' style is being set.
    if ( styles.opacity !== null )
    {
        // Detect if the browser does not natively support 'opacity' as a string style property
        // and if it supports 'filters' (indicative of older IE).
        if ( typeof element.style.opacity != 'string' && typeof ( element.filters ) != 'undefined' )
        {
            // For older IE, apply the 'alpha' filter for opacity.
            styles.filter = 'alpha(opacity=' + Math.round( 100 * styles.opacity ) + ')';
        }
    }
    // Use the 'extend' utility to apply all provided styles to the element's style object.
    qq.extend( element.style, styles );
};

/**
 *  Checks if a specified DOM element possesses a given CSS class name.
 *  The check is performed using a regular expression to ensure whole-word matching.
 *
 *  @param {HTMLElement} element The DOM element to inspect.
 *  @param {String} name         The CSS class name to search for.
 *  @returns {boolean} True if the element has the class, false otherwise.
 */
qq.hasClass = function ( element, name )
{
    // Construct a regular expression to match the class name, ensuring it's a distinct class.
    // '(^| )' matches either the start of the string or a space before the class.
    // '( |$)' matches either a space after the class or the end of the string.
    var re = new RegExp( '(^| )' + name + '( |$)' );
    return re.test( element.className ); // Test the element's className string against the regex.
};

/**
 *  Adds a CSS class to a DOM element if that class is not already present.
 *
 *  @param {HTMLElement} element The DOM element to which the class will be added.
 *  @param {String} name         The CSS class name to add.
 */
qq.addClass = function ( element, name )
{
    // Only add the class if the element does not already have it.
    if ( !qq.hasClass( element, name ) )
    {
        element.className += ' ' + name; // Append the new class name, preceded by a space.
    }
};

/**
 *  Removes a specific CSS class from a DOM element.
 *  Handles cases where the class might be at the beginning, middle, or end of the className string.
 *
 *  @param {HTMLElement} element The DOM element from which the class will be removed.
 *  @param {String} name         The CSS class name to remove.
 */
qq.removeClass = function ( element, name )
{
    // Create a regular expression to find the class name, ensuring boundary matching.
    var re = new RegExp( '(^| )' + name + '( |$)' );
    // Replace the found class (and surrounding space) with a single space.
    // Then, trim any leading or trailing whitespace from the resulting className.
    element.className = element.className.replace( re, ' ' ).replace( /^\s+|\s+$/g, "" );
};

/**
 *  Sets the text content of a DOM element, ensuring cross-browser compatibility.
 *  It attempts to use 'innerText' (for IE) and 'textContent' (for W3C-compliant browsers).
 *
 *  @param {HTMLElement} element The element whose text content is to be updated.
 *  @param {String} text         The string value to set as the element's text content.
 */
qq.setText = function ( element, text )
{
    element.innerText = text;    // Assign text using innerText (primarily for IE).
    element.textContent = text;  // Assign text using textContent (for modern browsers).
};

// --- Element Selection ---

/**
 *  Retrieves an array containing only the direct child *elements* (nodeType 1)
 *  of a given parent DOM element.
 *  Ignores text nodes, comment nodes, etc.
 *
 *  @param {HTMLElement} element The parent element whose children are to be retrieved.
 *  @returns {Array<HTMLElement>} An array of child element nodes.
 */
qq.children = function ( element )
{
    var children = [ ],    // Initialize an empty array to store child elements.
        child = element.firstChild; // Start with the very first child node of the element.

    // Traverse through all sibling nodes until the end.
    while ( child )
    {
        if ( child.nodeType == 1 ) // Check if the current node is an element node (nodeType 1).
        {
            children.push( child ); // If it's an element, add it to our list.
        }
        child = child.nextSibling; // Move to the next sibling node.
    }

    return children; // Return the array of collected child elements.
};

/**
 *  Finds all descendant elements within a given parent element that possess a specific CSS class name.
 *  Prioritizes `querySelectorAll` for efficiency in modern browsers,
 *  and falls back to a manual traversal using `getElementsByTagName` for older environments.
 *
 *  @param {HTMLElement} element The root element within which to search for descendants.
 *  @param {String} className    The CSS class name to match.
 *  @returns {Array<HTMLElement>} An array of all matching descendant elements.
 */
qq.getByClass = function ( element, className )
{
    // Leverage the native `querySelectorAll` method if it's supported by the browser.
    if ( element.querySelectorAll )
    {
        return element.querySelectorAll( '.' + className ); // Use CSS selector syntax for class.
    }

    var result = [ ]; // Initialize an array to hold the found elements.
    // Fallback: Get all descendant elements by tag name (the '*' wildcard).
    var candidates = element.getElementsByTagName( "*" );
    var len = candidates.length; // Cache the length of the NodeList for loop optimization.

    // Iterate through all potential candidate elements.
    for ( var i = 0; i < len; i++ )
    {
        // Use the `qq.hasClass` utility to check if the current candidate has the desired class.
        if ( qq.hasClass( candidates[ i ], className ) )
        {
            result.push( candidates[ i ] ); // If it does, add it to our results array.
        }
    }
    return result; // Return the array of elements that match the class name.
};

/**
 *  Transforms a JavaScript object into a URL-encoded query string.
 *  This function behaves similarly to jQuery's `$.param()` method.
 *  It can handle nested objects and arrays within the input object.
 *
 *  Example Usage:
 *  `qq.obj2url({a:'b',c:'d'}, 'http://any.url/upload?otherParam=value');`
 *  would produce:
 *  `http://any.url/upload?otherParam=value&a=b&c=d`
 *
 *  @param  {Object} obj        The JavaScript object to be converted into a query string.
 *  @param  {String} temp       An optional base URL or existing query string fragment to append to.
 *  @param  {boolean} [prefixDone] An internal flag used during recursion to manage URL prefixes.
 *  @return {String} The fully URL-encoded query string.
 */
qq.obj2url = function ( obj, temp, prefixDone )
{
    var uristrings = [ ], // Array to store individual key=value pairs.
        prefix = '&',     // Default separator for query parameters.
        // Helper function to add key-value pairs to the uristrings array.
        add = function ( nextObj, i )
        {
            var nextTemp = temp
                ? ( /\[\]$/.test( temp ) ) // Check if 'temp' already ends with '[]' (array notation).
                   ? temp                      // If so, use 'temp' as is to prevent double encoding.
                   : temp + '[' + i + ']'      // Otherwise, append bracket notation for nested keys.
                : i;                       // If no 'temp' (top-level), use the key/index directly.

            // Only proceed if 'nextTemp' and 'i' are not the string "undefined".
            if ( ( nextTemp != 'undefined' ) && ( i != 'undefined' ) )
            {
                uristrings.push(
                    ( typeof nextObj === 'object' ) // If 'nextObj' is an object (or array).
                        ? qq.obj2url( nextObj, nextTemp, true ) // Recursively call obj2url for nested structures.
                        : ( Object.prototype.toString.call( nextObj ) === '[object Function]' ) // If it's a function.
                            ? encodeURIComponent( nextTemp ) + '=' + encodeURIComponent( nextObj( ) ) // Call function, encode result.
                            : encodeURIComponent( nextTemp ) + '=' + encodeURIComponent( nextObj )    // For primitive values, encode directly.
                );
            }
        };

    // Handle the initial URL or existing query string if `prefixDone` is not true.
    if ( !prefixDone && temp )
    {
      prefix = ( /\?/.test( temp ) ) // Check if the 'temp' string already contains a '?' character.
          ? ( /\?$/.test( temp ) ) ? '' : '&' // If '?' is present, use '&' (or '' if 'temp' ends with '?').
          : '?'; // If no '?' is found, start the query string with '?'.
      uristrings.push( temp ); // Add the base URL or initial query string to the result.
      uristrings.push( qq.obj2url( obj ) ); // Recursively process the main object.
    }
    // Handle arrays: iterate using a standard for loop for better performance.
    else if ( ( Object.prototype.toString.call( obj ) === '[object Array]' ) && ( typeof obj != 'undefined' ) )
    {
        for ( var i = 0, len = obj.length; i < len; ++i )
        {
            add( obj[ i ], i );
        }
    }
    // Handle objects (non-null, actual objects): iterate using a for-in loop.
    else if ( ( typeof obj != 'undefined' ) && ( obj !== null ) && ( typeof obj === "object" ) )
    {
        for ( var i in obj )
        {
            add( obj[ i ], i );
        }
    }
    // Handle scalar values (primitives).
    else
    {
        uristrings.push( encodeURIComponent( temp ) + '=' + encodeURIComponent( obj ) );
    }

    // Join all collected URI parts, remove any leading '&', and replace '%20' with '+'.
    return uristrings.join( prefix )
                     .replace( /^&/, '' )
                     .replace( /%20/g, '+' );
};

// --- Uploader Core Classes ---

var qq = qq || { }; // Re-ensure 'qq' namespace exists before defining classes.

/**
 *  The foundational class for file upload operations.
 *  This class manages the core logic of file submission, validation, and interaction
 *  with the upload handler, but does not include any specific UI components
 *  like file lists, drag-and-drop areas, or visual feedback.
 *
 *  @param {Object} o Configuration options for the uploader.
 */
qq.FileUploaderBasic = function ( o )
{
    // Define the default configuration options for the basic uploader.
    this._options = {
        debug: false, // Boolean: If true, enables debugging output to the console.
        action: '/server/upload', // String: The URL endpoint where files will be uploaded.
        params: { }, // Object: Additional parameters (key-value pairs) to send with each upload request.
        button: null, // HTMLElement: The DOM element that will act as the file input button.
        multiple: true, // Boolean: Allows selection of multiple files if supported by the browser and handler.
        maxConnections: 3, // Number: Maximum concurrent file uploads allowed.

        // File validation rules.
        allowedExtensions: [ ], // Array<String>: List of allowed file extensions (e.g., ['jpg', 'png']). Empty array means all are allowed.
        sizeLimit: 0, // Number: Maximum allowed file size in bytes. 0 means no limit.
        minSizeLimit: 0, // Number: Minimum allowed file size in bytes. 0 means no limit.

        // Event callback functions (placeholders).
        // These functions are called at various stages of the upload process.
        onSubmit: function ( id, fileName ) { }, // Called when a file is submitted. Return false to cancel.
        onProgress: function ( id, fileName, loaded, total ) { }, // Called during upload progress.
        onComplete: function ( id, fileName, responseJSON ) { }, // Called when an upload finishes (success or error).
        onCancel: function ( id, fileName ) { }, // Called when an upload is explicitly cancelled.

        // User-facing messages.
        messages: {
            typeError: "{file} has an invalid extension. Only {extensions} are permitted.",
            sizeError: "{file} is too large. The maximum file size allowed is {sizeLimit}.",
            minSizeError: "{file} is too small. The minimum file size allowed is {minSizeLimit}.",
            emptyError: "{file} is empty. Please select files again, excluding this one.",
            onLeave: "Files are currently being uploaded. Navigating away will cancel pending uploads."
        },
        showMessage: function ( message ) {
            alert( message ); // Default method to display messages to the user (can be overridden).
        }
    };
    // Extend the default options with any user-provided options.
    qq.extend( this._options, o );

    // Initialize internal state variables for the uploader instance.
    this._filesInProgress = 0; // Tracks the number of files currently being uploaded.
    this._handler = this._createUploadHandler( ); // Instantiate the appropriate upload handler (XHR or Form).

    // If a button element is provided in the options, create an UploadButton instance.
    if ( this._options.button )
    {
        this._button = this._createUploadButton( this._options.button );
    }

    // Set up a mechanism to warn the user before they leave the page during active uploads.
    this._preventLeaveInProgress( );
};

qq.FileUploaderBasic.prototype = {
    /**
     *  Updates or sets the parameters that will be sent along with each file upload.
     *  These parameters are typically sent as part of the form data or query string.
     *
     *  @param {Object} params An object containing key-value pairs of parameters.
     */
    setParams: function ( params )
    {
        this._options.params = params;
    },

    /**
     *  Returns the current count of files that are actively being uploaded.
     *
     *  @returns {Number} The number of files in progress.
     */
    getInProgress: function ( )
    {
        return this._filesInProgress;
    },

    /**
     *  Internal method to create and configure the `qq.UploadButton` instance.
     *  This button handles the file input element and its change events.
     *
     *  @param {HTMLElement} element The DOM element designated as the upload button.
     *  @returns {qq.UploadButton} The initialized UploadButton object.
     *  @private
     */
    _createUploadButton: function ( element )
    {
        var self = this; // Capture 'this' context for use within nested functions.

        return new qq.UploadButton( {
            element: element,
            // Enable multiple file selection only if `multiple` option is true AND XHR upload is supported.
            multiple: this._options.multiple && qq.UploadHandlerXhr.isSupported( ),
            onChange: function ( input )
            {
                self._onInputChange( input ); // Callback when the file input value changes.
            }
        } );
    },

    /**
     *  Internal method responsible for instantiating the correct upload handler.
     *  It dynamically selects between `qq.UploadHandlerXhr` (for modern browsers)
     *  and `qq.UploadHandlerForm` (for older browsers that lack XHR upload capabilities).
     *
     *  @returns {qq.UploadHandlerXhr|qq.UploadHandlerForm} An instance of the chosen upload handler.
     *  @private
     */
    _createUploadHandler: function ( )
    {
        var self = this,           // Preserve the 'this' context.
            handlerClass;          // Variable to hold the name of the handler class to be used.

        // Determine which upload handler class is suitable based on browser capabilities.
        if ( qq.UploadHandlerXhr.isSupported( ) )
        {
            handlerClass = 'UploadHandlerXhr'; // Use XHR-based handler if supported.
        }
        else
        {
            handlerClass = 'UploadHandlerForm'; // Otherwise, fall back to form-based handler.
        }

        // Create a new instance of the determined handler class, passing relevant options and callbacks.
        var handler = new qq[ handlerClass ]( {
            debug: this._options.debug,
            action: this._options.action,
            maxConnections: this._options.maxConnections,
            onProgress: function ( id, fileName, loaded, total )
            {
                // Execute internal progress logic, then call the user-defined callback.
                self._onProgress( id, fileName, loaded, total );
                self._options.onProgress( id, fileName, loaded, total );
            },
            onComplete: function ( id, fileName, result )
            {
                // Execute internal complete logic, then call the user-defined callback.
                self._onComplete( id, fileName, result );
                self._options.onComplete( id, fileName, result );
            },
            onCancel: function ( id, fileName )
            {
                // Execute internal cancel logic, then call the user-defined callback.
                self._onCancel( id, fileName );
                self._options.onCancel( id, fileName );
            }
        } );

        return handler; // Return the initialized upload handler.
    },

    /**
     *  Sets up an event listener on the window's 'beforeunload' event.
     *  This prevents users from accidentally navigating away from the page
     *  while file uploads are still in progress, by displaying a warning message.
     *
     *  @private
     */
    _preventLeaveInProgress: function ( )
    {
        var self = this; // Cache 'this' for use within the event handler.

        qq.attach( window, 'beforeunload', function ( e )
        {
            // If there are no files currently uploading, allow navigation without warning.
            if ( !self._filesInProgress ) {
                return;
            }

            var e = e || window.event; // Normalize the event object for cross-browser compatibility.
            // For Internet Explorer and Firefox: set the 'returnValue' property.
            e.returnValue = self._options.messages.onLeave;
            // For Webkit-based browsers (Chrome, Safari): return the message directly.
            return self._options.messages.onLeave;
        } );
    },

    /**
     *  Internal method executed when a file submission is initiated.
     *  Increments the counter for files currently in progress.
     *
     *  @param {Number} id       The unique identifier assigned to the file.
     *  @param {String} fileName The name of the file being submitted.
     *  @private
     */
    _onSubmit: function ( id, fileName )
    {
        this._filesInProgress++; // Increment the count of active uploads.
    },

    /**
     *  Internal method for handling upload progress updates.
     *  This method is intentionally left empty in the base class,
     *  allowing subclasses or specific implementations to override it
     *  for UI updates or custom logic.
     *
     *  @param {Number} id       The unique ID of the file.
     *  @param {String} fileName The name of the file.
     *  @param {Number} loaded   The number of bytes uploaded so far.
     *  @param {Number} total    The total size of the file in bytes.
     *  @private
     */
    _onProgress: function ( id, fileName, loaded, total )
    {
        // No default action in the base class.
    },

    /**
     *  Internal method invoked when a file upload completes, regardless of success or failure.
     *  Decrements the in-progress file counter and displays any server-side error messages.
     *
     *  @param {Number} id       The unique identifier of the completed file.
     *  @param {String} fileName The name of the completed file.
     *  @param {Object} result   The JSON response object received from the server.
     *  @private
     */
    _onComplete: function ( id, fileName, result )
    {
        this._filesInProgress--; // Decrement the count of active uploads.
        // If the server response indicates an error, display it to the user.
        if ( result.error )
        {
            this._options.showMessage( result.error );
        }
    },

    /**
     *  Internal method triggered when a file upload is cancelled by the user or system.
     *  Decrements the count of files currently in progress.
     *
     *  @param {Number} id       The unique identifier of the cancelled file.
     *  @param {String} fileName The name of the cancelled file.
     *  @private
     */
    _onCancel: function ( id, fileName )
    {
        this._filesInProgress--; // Decrement the count of active uploads.
    },

    /**
     *  Handles the event when a user selects files via the file input element.
     *  It determines the appropriate upload mechanism (XHR or Form-based)
     *  and initiates the validation and upload process for the selected file(s).
     *
     *  @param {HTMLInputElement|FileList} input The file input element itself (for form-based) or a FileList object (for XHR).
     *  @private
     */
    _onInputChange: function ( input )
    {
        // Check if the current upload handler is an instance of `qq.UploadHandlerXhr`.
        if ( this._handler instanceof qq.UploadHandlerXhr )
        {
            // If XHR is supported, process all files in the input's FileList.
            this._uploadFileList( input.files );
        }
        else
        {
            // For form-based uploads (older browsers), validate and upload one file input at a time.
            if ( this._validateFile( input ) )
            {
                this._uploadFile( input );
            }
        }
        // After processing, reset the upload button to allow the same file to be selected again.
        this._button.reset( );
    },

    /**
     *  Processes a `FileList` object (typically from a multiple file input or drag-and-drop).
     *  It first validates all files in the list, and if all are valid, proceeds to upload each one.
     *
     *  @param {FileList} files The FileList object containing files to be uploaded.
     *  @private
     */
    _uploadFileList: function ( files )
    {
        // First pass: Validate all files in the list. If any file is invalid, stop the entire process.
        for ( var i = 0; i < files.length; i++ )
        {
            if ( !this._validateFile( files[ i ] ) )
            {
                return; // An invalid file was found; abort the list upload.
            }
        }

        // Second pass: If all files passed validation, proceed to upload each file individually.
        for ( var i = 0; i < files.length; i++ )
        {
            this._uploadFile( files[ i ] );
        }
    },

    /**
     *  Initiates the upload process for a single file or a file input element.
     *  This involves adding the file to the handler, retrieving its name,
     *  and then triggering the `onSubmit` callback before starting the actual upload.
     *
     *  @param {File|HTMLInputElement} fileContainer The File object (for XHR) or the HTML file input element (for form-based).
     *  @private
     */
    _uploadFile: function ( fileContainer )
    {
        var id = this._handler.add( fileContainer );     // Add the file/container to the handler and get its unique ID.
        var fileName = this._handler.getName( id );      // Retrieve the file's name using its ID.

        // Call the user-defined `onSubmit` callback. If it explicitly returns `false`, cancel the upload.
        if ( this._options.onSubmit( id, fileName ) !== false )
        {
            this._onSubmit( id, fileName );                  // Execute internal submission logic.
            this._handler.upload( id, this._options.params ); // Start the actual file upload with additional parameters.
        }
    },

    /**
     *  Performs validation checks on a given file (or file input element)
     *  against the configured rules such as allowed extensions and size limits.
     *
     *  @param {File|HTMLInputElement} file The File object or the HTMLInputElement representing the file.
     *  @returns {boolean} True if the file passes all validation checks, false otherwise.
     *  @private
     */
    _validateFile: function ( file )
    {
        var name, size; // Variables to store the file's name and size.

        // Determine how to extract file name and size based on the input type.
        if ( file.value )
        {
            // If 'file.value' exists, it's likely an HTML file input element.
            // Extract the file name, removing any path information for normalization.
            name = file.value.replace( /.*(\/|\\)/, "" );
        }
        else
        {
            // Otherwise, it's presumed to be a File object (from FileList or drag-and-drop).
            // Use 'fileName' for older Safari, fall back to 'name'.
            name = file.fileName !== null ? file.fileName : file.name;
            // Use 'fileSize' for older Safari, fall back to 'size'.
            size = file.fileSize !== null ? file.fileSize : file.size;
        }

        // --- Perform validation checks ---

        // 1. Validate file extension.
        if ( !this._isAllowedExtension( name ) )
        {
            this._error( 'typeError', name ); // Trigger a type error message.
            return false;                     // Validation failed.
        }
        // 2. Validate against empty files (size 0).
        else if ( size === 0 )
        {
            this._error( 'emptyError', name ); // Trigger an empty file error message.
            return false;                      // Validation failed.
        }
        // 3. Validate against maximum file size limit.
        else if ( size && this._options.sizeLimit && size > this._options.sizeLimit )
        {
            this._error( 'sizeError', name ); // Trigger a size limit error message.
            return false;                      // Validation failed.
        }
        // 4. Validate against minimum file size limit.
        else if ( size && size < this._options.minSizeLimit )
        {
            this._error( 'minSizeError', name ); // Trigger a minimum size limit error message.
            return false;                         // Validation failed.
        }

        return true; // All validation checks passed.
    },

    /**
     *  Generates and displays an error message based on a predefined error code.
     *  It replaces placeholders in the message template with relevant file information
     *  and size limits, then calls the configured `showMessage` function.
     *
     *  @param {String} code     The key for the error message in `_options.messages`.
     *  @param {String} fileName The name of the file that caused the error.
     *  @private
     */
    _error: function ( code, fileName )
    {
        var message = this._options.messages[ code ]; // Retrieve the base message template using the error code.

        // Inner helper function to replace a placeholder in the message string.
        function r ( name, replacement ) {
            message = message.replace( name, replacement );
        }

        // Replace specific placeholders in the message with actual values.
        r( '{file}', this._formatFileName( fileName ) );
        r( '{extensions}', this._options.allowedExtensions.join( ', ' ) );
        r( '{sizeLimit}', this._formatSize( this._options.sizeLimit ) );
        r( '{minSizeLimit}', this._formatSize( this._options.minSizeLimit ) );

        // Display the fully formatted error message using the user-defined handler.
        this._options.showMessage( message );
    },

    /**
     *  Formats a file name for display, truncating it if it exceeds a certain length
     *  to prevent overly long file names from distorting the UI.
     *
     *  @param {String} name The original file name.
     *  @returns {String} The potentially truncated and formatted file name.
     *  @private
     */
    _formatFileName: function ( name )
    {
        // If the file name is longer than 33 characters, truncate it.
        if ( name.length > 33 )
        {
            // Keep the first 19 characters, add an ellipsis, and then the last 13 characters.
            name = name.slice( 0, 19 ) + '...' + name.slice( -13 );
        }
        return name; // Return the formatted name.
    },

    /**
     *  Checks if the extension of a given file name is present in the list of allowed extensions.
     *  The comparison is case-insensitive. If no allowed extensions are specified, all are considered valid.
     *
     *  @param {String} fileName The full name of the file, including its extension.
     *  @returns {boolean} True if the extension is allowed or if no restrictions exist, false otherwise.
     *  @private
     */
    _isAllowedExtension: function ( fileName )
    {
        // Extract the file extension, convert to lowercase. If no dot, extension is empty.
        var ext = ( -1 !== fileName.indexOf( '.' ) ) ? fileName.replace( /.*[.]/, '' ).toLowerCase( ) : '';
        var allowed = this._options.allowedExtensions; // Get the array of allowed extensions.

        // If the `allowedExtensions` array is empty, all extensions are implicitly allowed.
        if ( !allowed.length ) {
            return true;
        }

        // Iterate through the list of allowed extensions.
        for ( var i = 0; i < allowed.length; i++ )
        {
            // Compare the file's extension (lowercase) with each allowed extension (lowercase).
            if ( allowed[ i ].toLowerCase( ) == ext ) {
                return true; // Match found, extension is allowed.
            }
        }

        return false; // No match found, extension is not allowed.
    },

    /**
     *  Converts a numerical size in bytes into a human-readable string format
     *  (e.g., "1.2 kB", "5.7 MB", "2.1 GB").
     *
     *  @param {Number} bytes The size value in bytes.
     *  @returns {String} The formatted size string.
     *  @private
     */
    _formatSize: function ( bytes )
    {
        var i = -1; // Index for the unit array.

        // Repeatedly divide bytes by 1024 and increment unit index until bytes is less than 100.
        do {
            bytes = bytes / 1024;
            i++;
        } while ( bytes > 99 );

        // Format the number to one decimal place and append the appropriate unit.
        // Math.max(bytes, 0.1) ensures that very small files (e.g., 50 bytes) are shown as "0.1 kB".
        return Math.max( bytes, 0.1 ).toFixed( 1 ) + [ 'kB', 'MB', 'GB', 'TB', 'PB', 'EB' ][ i ];
    }
};

/**
 *  Extends `qq.FileUploaderBasic` to provide a complete file upload widget
 *  with user interface elements, including drag-and-drop capability and a file list display.
 *
 *  @class qq.FileUploader
 *  @augments qq.FileUploaderBasic
 *  @param {Object} o Configuration options, extending those of `qq.FileUploaderBasic`.
 */
qq.FileUploader = function ( o )
{
    // Call the constructor of the parent class (qq.FileUploaderBasic)
    // to inherit its properties and initialize basic functionality.
    qq.FileUploaderBasic.apply( this, arguments );

    // Extend the inherited options with additional settings specific to the UI-enabled FileUploader.
    qq.extend( this._options, {
        element: null, // The DOM element where the entire uploader widget will be rendered.
        listElement: null, // Optional: A specific DOM element to use as the file list container.
                           // If null, the template's `qq-upload-list` will be used.

        // The main HTML template string for the overall uploader widget structure.
        template: '<div class="qq-uploader">' +
                '<div class="qq-upload-drop-area"><span>Drop files here to upload</span></div>' +
                '<div class="qq-upload-button">Upload a file</div>' +
                '<ul class="qq-upload-list"></ul>' +
             '</div>',

        // The HTML template string for a single item within the file list.
        fileTemplate: '<li>' +
                '<span class="qq-upload-file"></span>' +
                '<span class="qq-upload-spinner"></span>' +
                '<span class="qq-upload-size"></span>' +
                '<a class="qq-upload-cancel" href="#">Cancel</a>' +
                '<span class="qq-upload-failed-text">Failed</span>' +
            '</li>'
        // Additional properties for the qq.FileUploader class would typically follow here.
        // For the provided snippet, the definition ends after fileTemplate.
};
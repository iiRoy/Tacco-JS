/*
* This is a Modified Version of the Markdown Text Editor Plugin
*
*
*
*   --------------------------------------------------------------------------------------------------
*   MARKDOWN TEXT EDITOR PLUGIN v1.2.6
*   --------------------------------------------------------------------------------------------------
*   Original Author: Taufik Nurrohman (http://latitudu.com)
*   License: MIT License (https://opensource.org/licenses/MIT)
*
*   DEPENDENCIES:
*   --------------------------------------------------------------------------------------------------
*   [1] Simple Text Editor Library: https://github.com/tovic/simple-text-editor-library
*   [2] Font Awesome Icons:         https://fortawesome.github.io/Font-Awesome/icons
*   --------------------------------------------------------------------------------------------------
*
*
*   Extensive whitespace and comment variations applied for Type I clone generation.
*/

var MTE = function ( elem , o ) { // Main MTE function definition starts here

  /* Apply backward compatibility for older options.
     This ensures that deprecated option names still work correctly. */
  if ( 'prompt' in o ) {
    o . prompts = o . prompt ;
  }
  if ( 'placeholder' in o ) {
    o . placeholders = o . placeholder ;
  }
  if ( 'iconClassPrefix' in o ) {
    o . toolbarIconClass = o . iconClassPrefix + '%s' ;
  }
  if ( 'buttonClassPrefix' in o ) {
    o . toolbarButtonClass = o . buttonClassPrefix + '%s' ;
  }

  // Unicode character definitions for special symbols used throughout the editor.
  // These are often used in prompts, placeholders, or button labels.
  var _u2018 = '\u2018' , /* Left single quotation mark */
      _u2019 = '\u2019' , // Right single quotation mark
      _u201C = '\u201C' , // Left double quotation mark
      _u201D = '\u201D' , // Right double quotation mark
      _u2013 = '\u2013' , // N-dash character
      _u2014 = '\u2014' , // M-dash character
      _u2026 = '\u2026' , // Horizontal ellipsis (three dots)
      _u00A6 = '\u00A6' , // Broken bar symbol
      _u00A9 = '\u00A9' , // Copyright sign
      _u2117 = '\u2117' , // Sound recording copyright sign
      _u2120 = '\u2120' , // Service mark symbol
      _u2122 = '\u2122' , // Trade mark sign
      _u00AE = '\u00AE' , // Registered sign
      _u00B1 = '\u00B1' , // Plus-minus sign
      _u00D7 = '\u00D7' , // Multiplication sign
      _u00F7 = '\u00F7' , // Division sign
      _u00B0 = '\u00B0' , // Degree sign
      _u2039 = '\u2039' , // Left pointing single angle quotation mark
      _u203A = '\u203A' , // Right pointing single angle quotation mark
      _u00AB = '\u00AB' , // Left pointing double angle quotation mark
      _u00BB = '\u00BB' , // Right pointing double angle quotation mark
      _u2264 = '\u2264' , // Less than or equal to symbol
      _u2265 = '\u2265' , // Greater than or equal to symbol
      _u2260 = '\u2260' , // Not equal to symbol
      _u2190 = '\u2190' , // Leftwards arrow
      _u2192 = '\u2192' , // Rightwards arrow
      _u2191 = '\u2191' , // Upwards arrow
      _u2193 = '\u2193' , // Downwards arrow
      _u21B5 = '\u21B5' , // Carriage return arrow
      _u00B7 = '\u00B7' ; // Middle dot character

  // Core objects and variables initialization.
  var base = this ;
  var win = window ;
  var doc = document ;
  var editor = new Editor ( elem ) ; // Initialize the underlying editor instance
  var defaults = { // Default configuration options for the MTE plugin.
    tabSize : '    ' ,
    toolbar : true ,
    shortcut : false ,
    areaClass : 'editor-area' ,
    toolbarClass : 'editor-toolbar' ,
    toolbarIconClass : 'fa fa-%s' ,
    toolbarButtonClass : 'editor-toolbar-button editor-toolbar-button-%s' ,
    toolbarSeparatorClass : 'editor-toolbar-separator' ,
    toolbarPosition : "before" , // Position of the toolbar relative to the `<textarea>`: "before" or "after".
    dropClass : 'custom-drop custom-%s-drop' ,
    modalClass : 'custom-modal custom-modal-%s' ,
    modalHeaderClass : 'custom-modal-header custom-modal-%s-header' ,
    modalContentClass : 'custom-modal-content custom-modal-%s-content' ,
    modalFooterClass : 'custom-modal-action custom-modal-%s-action' ,
    modalOverlayClass : 'custom-modal-overlay custom-modal-%s-overlay' ,
    closeATXHeaders : false , // If true, headers will be `#### Heading ####`; otherwise, `#### Heading`.
    STRONG : '**' ,
    EM : '_' ,
    UL : '- ' ,
    OL : '%d. ' ,
    HR : '---' ,
    CODE : '`' ,
    PRE : '    ' , // Note: Use `~~~\n%s\n~~~` or ````\n%s\n```` to enable fenced code block syntax in "Markdown Extra"
    buttons : {
      ok : 'OK' ,
      yes : 'Yes' ,
      no : 'No' ,
      cancel : 'Cancel' ,
      open : 'Open' ,
      close : 'Close' ,
      bold : 'Bold' ,
      italic : 'Italic' ,
      code : 'Code' ,
      quote : 'Quote' ,
      heading : 'H1 ' + _u2013 + ' H6' ,
      link : 'Link' ,
      image : 'Image' ,
      ol : 'Ordered List' ,
      ul : 'Unordered List' ,
      rule : 'Horizontal Rule' ,
      undo : 'Undo' ,
      redo : 'Redo'
    } ,
    prompts : {
      link_title : 'link title goes here' + _u2026 ,
      link_title_title : 'Link Title' ,
      link_url : 'http://' ,
      link_url_title : 'Link URL' ,
      image_url : 'http://' ,
      image_url_title : 'Image URL'
    } ,
    placeholders : {
      text : 'text goes here' + _u2026 ,
      heading_text : 'Heading' ,
      link_text : 'link text' ,
      list_ul_text : 'List item' ,
      list_ol_text : 'List item' ,
      image_alt : 'Image'
    } ,
    // Callback functions for various editor events.
    update : function ( ) { } ,
    keydown : function ( ) { } ,
    click : function ( ) { } ,
    ready : function ( ) { } ,
    copy : function ( ) { } ,
    cut : function ( ) { } ,
    paste : function ( ) { }
  } ;

  var page = doc . body ; // Reference to the document body element.
  var overlay = doc . createElement ( 'div' ) ; // Element for modal overlay.
  var modal = doc . createElement ( 'div' ) ; // Element for modal dialog.
  var drop = doc . createElement ( 'div' ) ; // Element for dropdown menus.

  var scroll = 0 ; // Stores current scroll position.
  var button = null ; // Reference to the currently active button (e.g., for dropdown positioning).
  var drag = null ; // Element currently being dragged.

  var x_e = 0 ; // Event X coordinate.
  var y_e = 0 ; // Event Y coordinate.
  var x_m = 0 ; // Mouse X offset for dragging.
  var y_m = 0 ; // Mouse Y offset for dragging.

  var v_w = page . parentNode . offsetWidth ; // Viewport width.
  var v_h = win . innerHeight > page . parentNode . offsetHeight ? win . innerHeight : page . parentNode . offsetHeight ; // Viewport height.

  var noop = function ( ) { } ; // A no-operation function, useful for default callbacks.

  /*
   * Alias editor methods for slightly better minification and readability within this scope.
   * This also helps in ensuring consistent usage of these core editor functionalities.
   */
  var _AREA = elem ;
  var _INDENT = editor . indent ;
  var _INSERT = editor . insert ;
  var _OUTDENT = editor . outdent ;
  var _REPLACE = editor . replace ;
  var _SELECT = editor . select ;
  var _SELECTION = editor . selection ;
  var _UPDATE_HISTORY = editor . updateHistory ;
  var _WRAP = editor . wrap ;

  /**
   * Helper function to check if an element/variable is defined.
   * @param {any} elem - The element or variable to check.
   * @returns {boolean} True if defined, false otherwise.
   */
  function is_set ( elem ) {
    return typeof elem !== "undefined" ;
  }

  /*
   *  Helper function to determine if a variable is a string.
   *  @param {any} elem - The variable to test.
   *  @returns {boolean} - True if `elem` is a string.
   */
  function is_string ( elem ) {
    return typeof elem === "string" ;
  }

  // Checks if the given element is a number.
  function is_number ( elem ) {
    return typeof elem === "number" ;
  }

  // Checks if the given element is a function.
  function is_function ( elem ) {
    return typeof elem === "function" ;
  }

  // Checks if the given element is an object.
  function is_object ( elem ) {
    return typeof elem === "object" ;
  }

  /*
   * Attaches an event listener to an element.
   * Supports chaining multiple functions to the same event.
   *
   * @param {HTMLElement} elem - The DOM element to attach the event to.
   * @param {string} event - The event name (e.g., 'click', 'keydown').
   * @param {Function|null} fn - The function to execute when the event fires, or `null` to remove.
   */
  function addEvent ( elem , event , fn ) {
    // Prefix the event name with 'on' for traditional DOM event properties.
    event = 'on' + event ;

    // If 'fn' is null, clear any existing event handler.
    if ( fn === null ) {
      return elem [ event ] = null ;
    }

    // If there's an existing function for this event, chain the new function with it.
    if ( is_function ( elem [ event ] ) ) {
      fn = ( function ( fn_1 , fn_2 ) {
        // Return a new function that calls both the original and the new handler.
        return function ( ) {
          return fn_1 . apply ( this , arguments ) , fn_2 . apply ( this , arguments ) ;
        }
      } ) ( elem [ event ] , fn ) ;
    }

    // Assign the (possibly chained) function as the event handler.
    elem [ event ] = fn ;
  }

  /**
   * Deeply merges properties from a source object into a target object.
   * This function modifies the target object in place.
   *
   * @param {object} target - The object to extend.
   * @param {object} source - The object containing properties to merge.
   * @returns {object} The extended target object.
   */
  function extend ( target , source ) {
    target = target || { } ; // Ensure target is an object, initialize if null/undefined.
    for ( var prop in source ) { // Iterate over all properties in the source object.
      if ( is_object ( source [ prop ] ) ) {
        // If the property is an object, recursively extend it.
        target [ prop ] = extend ( target [ prop ] , source [ prop ] ) ;
      } else {
        // Otherwise, simply copy the property value.
        target [ prop ] = source [ prop ] ;
      }
    }
    return target ;
  }

  /*
   * Retrieves the computed style value for a given CSS property of an element.
   * Handles both standard `getComputedStyle` and older `element.style` access.
   *
   * @param {HTMLElement} elem - The DOM element.
   * @param {string} rule - The CSS property name (e.g., 'background-color').
   * @returns {string} The computed style value.
   */
  function css ( elem , rule ) {
    var ruleJS = rule . replace ( /\-(\w)/g , function ( match , $1 ) { // Convert CSS-style 'background-color' to JS-style 'backgroundColor'.
      return $1 . toUpperCase ( ) ;
    } ) ;
    var value = 0 ; // Initialize value.

    // Use `getComputedStyle` for modern browsers.
    if ( doc . defaultView && doc . defaultView . getComputedStyle ) {
      value = doc . defaultView . getComputedStyle ( elem , null ) . getPropertyValue ( rule ) ;
    } else {
      // Fallback for older browsers: directly access `element.style`.
      value = elem . style [ ruleJS ] ;
    }
    return value ;
  }

  // Inserts a string into the editor at the current selection.
  // After insertion, the selection is updated.
  function insert ( str , s ) {
    _INSERT ( str , function ( ) {
      _SELECT ( s . end + 1 , _UPDATE_HISTORY ) ; // Select the position after the inserted string.
    } ) ;
    return false ; // Indicate that the operation is complete.
  }

  /*
   * Removes leading and trailing whitespace from a string.
   *
   * @param {string} str - The input string.
   * @returns {string} The trimmed string.
   */
  function trim ( str ) {
    return str . replace ( /^\s+|\s+$/g , "" ) ;
  }

  // Removes only leading whitespace from a string.
  function _trim ( str ) {
    return str . replace ( /^\s+/ , "" ) ;
  }

  // Removes only trailing whitespace from a string.
  function trim_ ( str ) {
    return str . replace ( /\s+$/ , "" ) ;
  }

  // Escapes special characters in a string for use in a regular expression.
  function escape ( str ) {
    return str . replace ( editor . escape , '\\$1' ) ;
  }

  // Checks if a DOM node exists in the document by checking its parent.
  function node_exist ( node ) {
    return node . parentNode ;
  }

  // Merge default options with user-provided options.
  var opt = extend ( defaults , o ) ;
  var nav = doc . createElement ( 'span' ) ; // Navigation element, typically for toolbar.

  // Pre-compiled regular expressions for various Markdown syntaxes.
  // These are escaped to handle special characters within the Markdown markers.
  var re_UL = escape ( opt . UL ) . replace ( /\\[-+*]/g , '[-+*]' ) ; // Unordered List regex.
  var re_OL = escape ( opt . OL ) . replace ( /%d/g , '[0-9]+' ) ; // Ordered List regex.
  var re_TAB = escape ( opt . tabSize ) ; // Tab size regex.
  var re_PRE = escape ( opt . PRE ) ; // Pre-formatted text/code block regex.

  // Exposes the `addEvent` utility function as `base.event` for external use.
  base . event = function ( event , elem , fn ) {
    return addEvent ( elem , event , fn ) ;
  } ;

  /*
   * Creates and displays a modal dialog.
   *
   * @param {string} [type='default'] - A string identifying the modal type, used for CSS classes.
   * @param {Function} [callback] - Function to call after the modal is created and positioned. Receives (overlay, modal).
   * @param {object} [offset] - Optional object with 'left' and 'top' properties for initial positioning.
   */
  base . modal = function ( type , callback , offset ) {
    // Handle overloaded arguments: if 'type' is a function, it's actually the callback.
    if ( is_function ( type ) ) {
      offset = callback ;
      callback = type ;
      type = 'default' ;
    }
    type = type || 'default' ; // Default modal type.
    offset = offset || { } ; // Ensure offset is an object.

    // Store current scroll position to correctly position modal relative to viewport.
    scroll = page . scrollTop || page . parentNode . scrollTop ;

    // Apply CSS classes based on modal type.
    overlay . className = opt . modalOverlayClass . replace ( /%s/g , type ) ;
    modal . className = opt . modalClass . replace ( /%s/g , type ) ;

    // Set the basic structure of the modal: header, content, footer.
    modal . innerHTML = '<div class="' + opt . modalHeaderClass . replace ( /%s/g , type ) + '"></div><div class="' + opt . modalContentClass . replace ( /%s/g , type ) + '"></div><div class="' + opt . modalFooterClass . replace ( /%s/g , type ) + '"></div>' ;

    var m_s = modal . style ; // Cache modal style object.
    var fx_left = 'left' in offset ; // Check if left offset is explicitly provided.
    var fx_top = 'top' in offset ; // Check if top offset is explicitly provided.

    m_s . visibility = 'hidden' ; // Hide modal initially to prevent flash of unstyled content.

    // Append modal elements to the page body.
    page . appendChild ( overlay ) ;
    page . appendChild ( modal ) ;

    // Use a timeout to allow the modal to render and get its dimensions.
    win . setTimeout ( function ( ) {
      var w = modal . offsetWidth ; // Modal's calculated width.
      var h = modal . offsetHeight ; // Modal's calculated height.

      m_s . position = 'absolute' ;
      m_s . left = fx_left ? offset . left + 'px' : '50%' ; // Position left.
      m_s . top = fx_top ? offset . top + 'px' : '50%' ; // Position top.
      m_s . zIndex = '9999' ; // Ensure modal is on top.
      m_s . marginLeft = ( fx_left ? 0 : 0 - ( w / 2 ) ) + 'px' ; // Adjust margin for centering.
      m_s . marginTop = ( fx_top ? 0 : scroll - ( h / 2 ) ) + 'px' ; // Adjust margin for vertical centering relative to scroll.
      m_s . visibility = "" ; // Make modal visible.

      // Adjust modal position if it goes off-screen to the left.
      if ( modal . offsetLeft < 0 && ! fx_left ) {
        m_s . left = 0 ;
        m_s . marginLeft = 0 ;
        fx_left = true ;
        offset . left = 0 ;
      }
      // Adjust modal position if it goes off-screen to the top.
      if ( modal . offsetTop < 0 && ! fx_top ) {
        m_s . top = 0 ;
        m_s . marginTop = 0 ;
        fx_top = true ;
        offset . top = 0 ;
      }

      var handle = modal . children [ 0 ] ; // The modal header acts as a drag handle.
      addEvent ( handle , "mousedown" , function ( ) {
        drag = modal ; // Set modal as the draggable element.
        x_m = x_e - drag . offsetLeft ; // Calculate mouse X offset relative to modal.
        y_m = y_e - drag . offsetTop ; // Calculate mouse Y offset relative to modal.
        return false ; // Prevent default drag behavior.
      } ) ;

      addEvent ( page , "mousemove" , null ) ; // Clear any previous mousemove handler for dragging.
      addEvent ( page , "mousemove" , function ( e ) {
        x_e = e . pageX ; // Current mouse X position.
        y_e = e . pageY + scroll ; // Current mouse Y position, adjusted for scroll.

        var m_left = fx_left ? 0 : w / 2 ; // Half width for centering calculation.
        var m_top = fx_top ? 0 : h / 2 ; // Half height for centering calculation.
        var left , top ; // Variables for new modal position.

        if ( drag !== null ) { // If an element is being dragged.
          var WW = fx_left ? w : 0 ; // Width adjustment for boundary checks.
          var HH = fx_top ? h : 0 ; // Height adjustment for boundary checks.

          left = x_e - x_m + m_left ; // Calculate new left position.
          top = y_e - y_m + m_top ; // Calculate new top position.

          // Boundary checks to keep modal within viewport.
          if ( left < m_left ) left = m_left ;
          if ( top < m_top ) top = m_top ;
          if ( left + m_left + WW > v_w ) left = v_w - m_left - WW ;
          if ( top + m_top + HH > v_h ) top = v_h - m_top - HH ;

          m_s . left = left + 'px' ; // Apply new left position.
          m_s . top = ( top - scroll ) + 'px' ; // Apply new top position, adjusted for scroll.
        }
      } ) ;
    } , 10 ) ; // Short delay to ensure DOM is ready for dimension calculations.

    // Execute callback function if provided.
    if ( is_function ( callback ) ) {
      callback ( overlay , modal ) ;
    }
  } ;

  /*
   * Creates and displays a dropdown menu.
   *
   * @param {string} [type='default'] - A string identifying the dropdown type, used for CSS classes.
   * @param {Function} [callback] - Function to call after the dropdown is created and positioned. Receives (drop).
   * @param {object} [offset] - Optional object with 'left' and 'top' properties for initial positioning.
   */
  base . drop = function ( type , callback , offset ) {
    // Handle overloaded arguments similar to `base.modal`.
    if ( is_function ( type ) ) {
      offset = callback ;
      callback = type ;
      type = 'default' ;
    }

    // If no explicit offset is provided but a button is active,
    // position the dropdown relative to that button.
    if ( ! offset && button ) {
      offset = {
        left : button . offsetLeft ,
        top : button . offsetTop + button . offsetHeight // Position below the button.
      } ;
    }

    type = type || 'default' ; // Default dropdown type.
    offset = offset || { } ; // Ensure offset is an object.

    scroll = page . scrollTop || page . parentNode . scrollTop ; // Get current scroll position.

    drop . className = opt . dropClass . replace ( /%s/g , type ) ; // Apply CSS class.

    var d_s = drop . style ; // Cache dropdown style object.
    var fx_left = 'left' in offset ; // Check for explicit left offset.
    var fx_top = 'top' in offset ; // Check for explicit top offset.

    d_s . visibility = 'hidden' ; // Hide dropdown initially.
    page . appendChild ( drop ) ; // Add dropdown to the page.

    win . setTimeout ( function ( ) {
      var w = drop . offsetWidth ; // Dropdown's width.
      var h = drop . offsetHeight ; // Dropdown's height.

      d_s . position = 'absolute' ;
      d_s . left = fx_left ? offset . left + 'px' : '50%' ; // Position left.
      d_s . top = fx_top ? offset . top + 'px' : '50%' ; // Position top.
      d_s . zIndex = '9999' ; // Ensure dropdown is on top.
      d_s . marginLeft = ( fx_left ? 0 : 0 - ( w / 2 ) ) + 'px' ; // Adjust margin for centering.
      d_s . marginTop = ( fx_top ? 0 : scroll - ( h / 2 ) ) + 'px' ; // Adjust margin for vertical centering.
      d_s . visibility = "" ; // Make dropdown visible.

      // Adjust dropdown position if it goes off-screen to the right.
      if ( offset . left + w > v_w ) {
        d_s . left = ( v_w - w ) + 'px' ;
        d_s . marginLeft = 0 ;
      }
      // Adjust dropdown position if it goes off-screen to the bottom.
      if ( offset . top + h > v_h ) {
        d_s . top = ( v_h - h ) + 'px' ;
        d_s . marginTop = 0 ;
      }
    } , 10 ) ; // Short delay.

    // Execute callback function.
    if ( is_function ( callback ) ) {
      callback ( drop ) ;
    }
  } ;

  /*
   * Displays a custom prompt modal with a text input field.
   *
   * @param {string} title - The title of the prompt modal.
   * @param {string} value - The initial value for the input field.
   * @param {boolean} required - If true, the input cannot be empty or unchanged to succeed.
   * @param {Function} [callback] - Function to call on successful submission. Receives the input value.
   * @param {object} [offset] - Optional positioning offset for the modal.
   */
  base . prompt = function ( title , value , required , callback , offset ) {
    base . modal ( 'prompt' , function ( o , m ) {
      // Internal function to handle successful prompt submission.
      var success = function ( value ) {
        if ( is_function ( callback ) ) {
          base . close ( ) ; // Close the modal without force.
          callback ( value ) ; // Execute the user-provided callback.
        } else {
          base . close ( true ) ; // Force close the modal.
        }
      } ;

      var input = doc . createElement ( 'input' ) ;
      input . type = 'text' ;
      input . value = value ;

      // Add keydown event listener to the input field for submission and navigation.
      addEvent ( input , "keydown" , function ( e ) {
        var k = e . keyCode ; // Get the key code.

        if ( k == 27 ) return base . close ( true ) , false ; // Escape key to close.
        if ( k == 40 ) return OK . focus ( ) , false ; // Down arrow to focus OK button.

        if ( required ) {
          if ( k == 13 && this . value !== "" && this . value !== value ) {
            return success ( this . value ) , false ; // Enter key for required input.
          }
        } else {
          if ( k == 13 ) {
            return success ( this . value == value ? "" : this . value ) , false ; // Enter key for optional input.
          }
        }
      } ) ;

      var OK = doc . createElement ( 'button' ) ;
      OK . innerHTML = opt . buttons . ok ;

      // Add click event listener for the OK button.
      addEvent ( OK , "click" , function ( ) {
        if ( required ) {
          if ( input . value !== "" && input . value !== value ) success ( input . value ) ;
        } else {
          success ( input . value == value ? "" : input . value ) ;
        }
        return false ;
      } ) ;

      var CANCEL = doc . createElement ( 'button' ) ;
      CANCEL . innerHTML = opt . buttons . cancel ;

      // Add click event listener for the CANCEL button.
      addEvent ( CANCEL , "click" , function ( ) {
        return base . close ( true ) , false ; // Force close on cancel.
      } ) ;

      // Keydown events for OK button navigation.
      addEvent ( OK , "keydown" , function ( e ) {
        var k = e . keyCode ;
        if ( k == 27 ) return base . close ( true ) , false ; // Escape to close.
        if ( k == 38 ) return input . focus ( ) , false ; // Up arrow to focus input.
        if ( k == 39 ) return CANCEL . focus ( ) , false ; // Right arrow to focus CANCEL.
      } ) ;

      // Keydown events for CANCEL button navigation.
      addEvent ( CANCEL , "keydown" , function ( e ) {
        var k = e . keyCode ;
        if ( k == 27 ) return base . close ( true ) , false ; // Escape to close.
        if ( k == 37 ) return OK . focus ( ) , false ; // Left arrow to focus OK.
        if ( k == 38 ) return input . focus ( ) , false ; // Up arrow to focus input.
      } ) ;

      // Populate modal content.
      m . children [ 0 ] . innerHTML = title ? title : "" ; // Header.
      m . children [ 1 ] . appendChild ( input ) ; // Content (input field).
      m . children [ 2 ] . appendChild ( OK ) ; // Footer (OK button).
      m . children [ 2 ] . appendChild ( doc . createTextNode ( ' ' ) ) ; // Spacer.
      m . children [ 2 ] . appendChild ( CANCEL ) ; // Footer (CANCEL button).

      // Focus and select the input field after a short delay.
      win . setTimeout ( function ( ) {
        input . select ( ) ;
      } , 10 ) ;
    } , offset ) ;
  } ;

  /*
   * Displays a custom alert modal with a message and an OK button.
   *
   * @param {string} title - The title of the alert modal.
   * @param {string} message - The message content of the alert.
   * @param {Function} [callback] - Function to call when the OK button is clicked.
   * @param {object} [offset] - Optional positioning offset for the modal.
   */
  base . alert = function ( title , message , callback , offset ) {
    base . modal ( 'alert' , function ( o , m ) {
      var OK = doc . createElement ( 'button' ) ;
      OK . innerHTML = opt . buttons . ok ;

      // Event listener for the OK button click.
      addEvent ( OK , "click" , function ( ) {
        if ( is_function ( callback ) ) {
          base . close ( ) ; // Close modal without force.
          callback ( ) ; // Execute callback.
        } else {
          base . close ( true ) ; // Force close.
        }
        return false ;
      } ) ;

      // Event listener for OK button keydown (e.g., Escape key).
      addEvent ( OK , "keydown" , function ( e ) {
        if ( e . keyCode == 27 ) return base . close ( true ) , false ; // Escape to close.
      } ) ;

      // Populate modal content.
      m . children [ 0 ] . innerHTML = title ? title : "" ; // Header.
      m . children [ 1 ] . innerHTML = message ? message : "" ; // Content.
      m . children [ 2 ] . appendChild ( OK ) ; // Footer.

      // Focus the OK button after a short delay.
      win . setTimeout ( function ( ) {
        OK . focus ( ) ;
      } , 10 ) ;
    } , offset ) ;
  } ;

  /*
   * Displays a custom confirmation modal with a message, OK button, and Cancel button.
   *
   * @param {string} title - The title of the confirmation modal.
   * @param {string} message - The message content of the confirmation.
   * @param {object} [callback] - Object with 'OK' and 'CANCEL' functions to call on button clicks.
   * @param {object} [offset] - Optional positioning offset for the modal.
   */
  base . confirm = function ( title , message , callback , offset ) {
    base . modal ( 'confirm' , function ( o , m ) {
      var OK = doc . createElement ( 'button' ) ;
      OK . innerHTML = opt . buttons . ok ;

      // Click handler for the OK button.
      addEvent ( OK , "click" , function ( ) {
        if ( is_set ( callback ) ) {
          if ( is_function ( callback . OK ) ) {
            base . close ( ) ; // Close modal without force.
            callback . OK ( ) ; // Execute the OK callback.
          } else {
            base . close ( true ) ; // Force close if no specific OK callback.
          }
        } else {
          base . close ( true ) ; // Force close if no callback object provided.
        }
        return false ;
      } ) ;

      var CANCEL = doc . createElement ( 'button' ) ;
      CANCEL . innerHTML = opt . buttons . cancel ;

      // Click handler for the CANCEL button.
      addEvent ( CANCEL , "click" , function ( ) {
        if ( is_set ( callback ) ) {
          if ( is_function ( callback . CANCEL ) ) {
            base . close ( ) ; // Close modal without force.
            callback . CANCEL ( ) ; // Execute the CANCEL callback.
          } else {
            base . close ( true ) ; // Force close if no specific CANCEL callback.
          }
        } else {
          base . close ( true ) ; // Force close if no callback object provided.
        }
        return false ;
      } ) ;

      // Keydown events for OK button navigation.
      addEvent ( OK , "keydown" , function ( e ) {
        var k = e . keyCode ;
        if ( k == 27 ) return base . close ( true ) , false ; // Escape to close.
        if ( k == 39 ) return CANCEL . focus ( ) , false ; // Right arrow to focus CANCEL.
      } ) ;
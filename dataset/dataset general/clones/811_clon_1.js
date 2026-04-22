/*
 * NicEdit - A Lightweight Inline WYSIWYG Editor
 * This file is part of the NicEdit project.
 *
 * Copyright (c) 2007-2008 Brian Kirchoff
 * Distributed under the terms of the MIT license.
 * For more details, visit: http://nicedit.com/
 * Please retain this copyright notice in all copies.
 */

// Global utility function for extending objects.
// It merges properties from one object into another.
var bkExtend = function ( ) {
  var args = arguments; // Capture all passed arguments.

  // If only one argument is provided, assume it's the source object
  // and extend 'this' (the current context).
  if ( args.length == 1 ) {
    args = [ this, args[0] ];
  }

  // Iterate over properties of the second argument (source object)
  // and copy them to the first argument (destination object).
  for ( var prop in args[1] ) {
    args[0][prop] = args[1][prop];
  }

  // Return the extended destination object.
  return args[0];
};

// Base class definition.
function bkClass ( ) {
  // Empty constructor for the base class.
}

// Prototype method for object construction.
// To be overridden by extended classes.
bkClass.prototype.construct = function ( ) {
  // Default empty construction.
};

// Static method to extend bkClass, creating a new derived class.
bkClass.extend = function ( def ) {
  // Define the constructor for the new class.
  var classDef = function ( ) {
    // Prevent direct instantiation of bkClass.
    // If the first argument is not bkClass, call the construct method.
    if ( arguments[0] !== bkClass ) {
      return this.construct.apply( this, arguments );
    }
  };

  // Create an instance of the current class (this) passing bkClass
  // to avoid calling its `construct` method during prototype inheritance.
  var proto = new this( bkClass );

  // Extend the new class's prototype with the provided definition.
  bkExtend( proto, def );

  // Set the prototype of the new class.
  classDef.prototype = proto;

  // Inherit the static 'extend' method.
  classDef.extend = this.extend;

  // Return the newly defined class.
  return classDef;
};


// bkElement class, extending bkClass.
// Provides utility methods for DOM manipulation.
var bkElement = bkClass.extend( {

  // Constructor for bkElement.
  // Can create a new element or wrap an existing one.
  construct : function ( elm, d ) {
    // If 'elm' is a string, create a new DOM element.
    if ( typeof ( elm ) == "string" ) {
      elm = ( d || document ).createElement( elm );
    }
    // Wrap the DOM element with bkElement functionality.
    elm = $BK( elm );

    return elm;
  },

  // Appends the current element to another DOM element.
  appendTo : function ( elm ) {
    elm.appendChild( this );
    return this;
  },

  // Inserts the current element before another DOM element.
  appendBefore : function ( elm ) {
    elm.parentNode.insertBefore( this, elm );
    return this;
  },

  // Adds an event listener to the current element.
  addEvent : function ( type, fn ) {
    bkLib.addEvent( this, type, fn );
    return this;
  },

  // Sets the inner HTML content of the current element.
  setContent : function ( c ) {
    this.innerHTML = c;
    return this;
  },

  // Calculates the absolute position of the element on the page.
  pos : function ( ) {
    var curleft = curtop = 0;
    var o = obj = this; // Initialize both 'o' and 'obj' with 'this'.

    // Traverse up the offsetParent chain to calculate total offset.
    if ( obj.offsetParent ) {
      do {
        curleft += obj.offsetLeft;
        curtop += obj.offsetTop;
      } while ( obj = obj.offsetParent );
    }

    // Account for border width, if applicable.
    // Special handling for Opera.
    var b = ( ! window.opera )
      ? parseInt( this.getStyle( 'border-width' ) || this.style.border ) || 0
      : 0;

    // Return the calculated [left, top] position including border.
    return [ curleft + b, curtop + b + this.offsetHeight ];
  },

  // Disables text selection for the element and its children.
  noSelect : function ( ) {
    bkLib.noSelect( this );
    return this;
  },

  // Finds an ancestor element with a specific tag name.
  parentTag : function ( t ) {
    var elm = this; // Start search from the current element.

    do {
      // Check if the current element exists, has a nodeName, and matches the tag.
      if ( elm && elm.nodeName && elm.nodeName.toUpperCase( ) == t ) {
        return elm; // Found the matching parent.
      }
      elm = elm.parentNode; // Move up to the next parent.
    } while ( elm ); // Continue until no parent is found.

    return false; // No matching parent tag found.
  },

  // Checks if the element has a specific CSS class.
  hasClass : function ( cls ) {
    // Use a regular expression to match the class name.
    // Handles cases where class is at start, end, or middle of the className string.
    return this.className.match( new RegExp( '(\\s|^)nicEdit-' + cls + '(\\s|$)' ) );
  },

  // Adds a CSS class to the element.
  addClass : function ( cls ) {
    // Only add if the class is not already present.
    if ( ! this.hasClass( cls ) ) {
      this.className += " nicEdit-" + cls;
    }
    return this;
  },

  // Removes a CSS class from the element.
  removeClass : function ( cls ) {
    // Only remove if the class is present.
    if ( this.hasClass( cls ) ) {
      // Replace the class with a single space to avoid multiple spaces.
      this.className = this.className.replace( new RegExp( '(\\s|^)nicEdit-' + cls + '(\\s|$)' ), ' ' );
    }
    return this;
  },

  // Sets multiple CSS styles on the element.
  setStyle : function ( st ) {
    var elmStyle = this.style; // Get the style object of the element.

    for ( var itm in st ) {
      switch ( itm ) {
        // Special handling for 'float' property due to browser inconsistencies.
        case 'float':
          elmStyle[ 'cssFloat' ] = elmStyle[ 'styleFloat' ] = st[ itm ];
          break;
        // Special handling for 'opacity' to support older IE.
        case 'opacity':
          elmStyle.opacity = st[ itm ];
          elmStyle.filter = "alpha(opacity=" + Math.round( st[ itm ] * 100 ) + ")";
          break;
        // Special case for 'className', directly sets the class.
        case 'className':
          this.className = st[ itm ];
          break;
        default:
          // Directly set other style properties.
          // The commented out line suggests an old IE workaround.
          // if ( document.compatMode || itm != "cursor" ) {
          elmStyle[ itm ] = st[ itm ];
          // }
      }
    }
    return this;
  },

  // Gets the computed style of an element.
  getStyle : function ( cssRule, d ) {
    var doc = ( ! d ) ? document.defaultView : d; // Get the default view or provided document.

    // If it's a DOM element (nodeType 1).
    if ( this.nodeType == 1 ) {
      // Use getComputedStyle for modern browsers, currentStyle for IE.
      return ( doc && doc.getComputedStyle )
        ? doc.getComputedStyle( this, null ).getPropertyValue( cssRule )
        : this.currentStyle[ bkLib.camelize( cssRule ) ];
    }
  },

  // Removes the element from its parent.
  remove : function ( ) {
    this.parentNode.removeChild( this );
    return this;
  },

  // Sets multiple attributes on the element.
  setAttributes : function ( at ) {
    for ( var itm in at ) {
      this[ itm ] = at[ itm ];
    }
    return this;
  }
} );


// bkLib object: A collection of general utility functions.
var bkLib = {
  // Detects if the browser is Internet Explorer.
  isMSIE : ( navigator.appVersion.indexOf( "MSIE" ) != -1 ),

  // Cross-browser event listener attachment.
  addEvent : function ( obj, type, fn ) {
    // Use addEventListener for modern browsers, attachEvent for IE.
    ( obj.addEventListener )
      ? obj.addEventListener( type, fn, false )
      : obj.attachEvent( "on" + type, fn );
  },

  // Converts an iterable (like NodeList) to a true Array.
  toArray : function ( iterable ) {
    var length = iterable.length,
      results = new Array( length );

    while ( length-- ) {
      results[ length ] = iterable[ length ];
    }
    return results;
  },

  // Prevents text selection on an element and its children.
  noSelect : function ( element ) {
    // Set 'unselectable' attribute for non-input/textarea elements.
    if ( element.setAttribute && element.nodeName.toLowerCase( ) != 'input' && element.nodeName.toLowerCase( ) != 'textarea' ) {
      element.setAttribute( 'unselectable', 'on' );
    }
    // Recursively apply to child nodes.
    for ( var i = 0; i < element.childNodes.length; i++ ) {
      bkLib.noSelect( element.childNodes[i] );
    }
  },

  // Converts a CSS-style string (e.g., 'font-size') to camelCase (e.g., 'fontSize').
  camelize : function ( s ) {
    return s.replace( /\-(.)/g, function ( m, l ) {
      return l.toUpperCase( );
    } );
  },

  // Checks if an item exists in an array.
  inArray : function ( arr, item ) {
    return ( bkLib.search( arr, item ) != null );
  },

  // Searches for an item in an array and returns its index, or null if not found.
  search : function ( arr, itm ) {
    for ( var i = 0; i < arr.length; i++ ) {
      if ( arr[i] == itm ) {
        return i;
      }
    }
    return null;
  },

  // Prevents default action and stops propagation of an event.
  cancelEvent : function ( e ) {
    e = e || window.event; // Get event object (cross-browser).
    if ( e.preventDefault && e.stopPropagation ) {
      e.preventDefault( );
      e.stopPropagation( );
    }
    return false;
  },

  // Array to hold functions to be executed on DOM loaded.
  domLoad : [ ],

  // Function executed when the DOM is fully loaded.
  domLoaded : function ( ) {
    // Ensure this function runs only once.
    if ( arguments.callee.done ) return;
    arguments.callee.done = true;

    // Execute all registered functions.
    for ( i = 0; i < bkLib.domLoad.length; i++ ) {
      bkLib.domLoad[i]( );
    }
  },

  // Registers a function to be called when the DOM is loaded.
  onDomLoaded : function ( fireThis ) {
    this.domLoad.push( fireThis ); // Add function to the queue.

    if ( document.addEventListener ) {
      // Modern browsers: use DOMContentLoaded.
      document.addEventListener( "DOMContentLoaded", bkLib.domLoaded, null );
    } else if ( bkLib.isMSIE ) {
      // IE: Use deferred script loading hack.
      document.write( "<style>.nicEdit-main p { margin: 0; }</style><scr" + "ipt id=__ie_onload defer " + ( ( location.protocol == "https:" ) ? "src='javascript:void(0)'" : "src=//0" ) + "><\\/scr" + "ipt>" );
      $BK( "__ie_onload" ).onreadystatechange = function ( ) {
        if ( this.readyState == "complete" ) {
          bkLib.domLoaded( );
        }
      };
    }
    // Fallback for all browsers: window.onload (ensures it runs even if DOMContentLoaded fails/isn't supported).
    window.onload = bkLib.domLoaded;
  }
};


// Global shortcut function to get a bkElement instance.
// If 'elm' is a string, it gets the element by ID.
// If 'elm' is a DOM element, it extends it with bkElement's prototype methods.
function $BK ( elm ) {
  // If a string is passed, assume it's an ID.
  if ( typeof ( elm ) == "string" ) {
    elm = document.getElementById( elm );
  }

  // If the element exists and doesn't already have bkElement methods,
  // extend it; otherwise, return the element as is.
  return ( elm && ! elm.appendTo ) ? bkExtend( elm, bkElement.prototype ) : elm;
}


// bkEvent object: Provides event handling capabilities (add/fire custom events).
var bkEvent = {
  // Adds a custom event listener.
  addEvent : function ( evType, evFunc ) {
    if ( evFunc ) {
      this.eventList = this.eventList || { }; // Initialize eventList if it doesn't exist.
      this.eventList[ evType ] = this.eventList[ evType ] || [ ]; // Initialize event type array.
      this.eventList[ evType ].push( evFunc ); // Add function to the event type.
    }
    return this;
  },

  // Fires a custom event, executing all registered listeners for that event type.
  fireEvent : function ( ) {
    var args = bkLib.toArray( arguments ), // Convert arguments to an array.
      evType = args.shift( ); // First argument is the event type.

    // If listeners exist for this event type.
    if ( this.eventList && this.eventList[ evType ] ) {
      // Call each listener function.
      for ( var i = 0; i < this.eventList[ evType ].length; i++ ) {
        this.eventList[ evType ][i].apply( this, args ); // Apply with current context and remaining arguments.
      }
    }
  }
};


// Simple internationalization function (placeholder).
function __ ( s ) {
  return s; // Currently returns the input string unchanged.
}


// Extends Function prototype to create a closure.
// Binds 'this' context and arguments to a function.
Function.prototype.closure = function ( ) {
  var __method = this, // The original function.
    args = bkLib.toArray( arguments ), // Arguments passed to closure().
    obj = args.shift( ); // The object to bind 'this' to.

  return function ( ) {
    // Check if bkLib is defined before using it.
    if ( typeof ( bkLib ) != 'undefined' ) {
      // Apply the original method with the bound object and combined arguments.
      return __method.apply( obj, args.concat( bkLib.toArray( arguments ) ) );
    }
  };
}

// Extends Function prototype to create a closure suitable for event listeners.
// Binds 'this' context, original arguments, and passes event object and target.
Function.prototype.closureListener = function ( ) {
  var __method = this, // The original function.
    args = bkLib.toArray( arguments ), // Arguments passed to closureListener().
    object = args.shift( ); // The object to bind 'this' to.

  return function ( e ) {
    e = e || window.event; // Get the event object (cross-browser).

    var target;
    // Determine the event target element (cross-browser).
    if ( e.target ) {
      target = e.target;
    } else {
      target = e.srcElement;
    }

    // Apply the original method with the bound object, event, target, and combined arguments.
    return __method.apply( object, [ e, target ].concat( args ) );
  };
}


/*
 * START CONFIGURATION BLOCK
 * This section defines the default configuration for the nicEditor.
 */

var nicEditorConfig = bkClass.extend( {
  // Definitions for editor buttons, including commands, tags, CSS, and key shortcuts.
  buttons : {
    'bold' : { name : __ ( 'Click to Bold' ), command : 'Bold', tags : [ 'B', 'STRONG' ], css : { 'font-weight' : 'bold' }, key : 'b' },
    'italic' : { name : __ ( 'Click to Italic' ), command : 'Italic', tags : [ 'EM', 'I' ], css : { 'font-style' : 'italic' }, key : 'i' },
    'underline' : { name : __ ( 'Click to Underline' ), command : 'Underline', tags : [ 'U' ], css : { 'text-decoration' : 'underline' }, key : 'u' },
    'left' : { name : __ ( 'Left Align' ), command : 'justifyleft', noActive : true },
    'center' : { name : __ ( 'Center Align' ), command : 'justifycenter', noActive : true },
    'right' : { name : __ ( 'Right Align' ), command : 'justifyright', noActive : true },
    'justify' : { name : __ ( 'Justify Align' ), command : 'justifyfull', noActive : true },
    'ol' : { name : __ ( 'Insert Ordered List' ), command : 'insertorderedlist', tags : [ 'OL' ] },
    'ul' : { name : __ ( 'Insert Unordered List' ), command : 'insertunorderedlist', tags : [ 'UL' ] },
    'subscript' : { name : __ ( 'Click to Subscript' ), command : 'subscript', tags : [ 'SUB' ] },
    'superscript' : { name : __ ( 'Click to Superscript' ), command : 'superscript', tags : [ 'SUP' ] },
    'strikethrough' : { name : __ ( 'Click to Strike Through' ), command : 'strikeThrough', css : { 'text-decoration' : 'line-through' } },
    'removeformat' : { name : __ ( 'Remove Formatting' ), command : 'removeformat', noActive : true },
    'indent' : { name : __ ( 'Indent Text' ), command : 'indent', noActive : true },
    'outdent' : { name : __ ( 'Remove Indent' ), command : 'outdent', noActive : true },
    'hr' : { name : __ ( 'Horizontal Rule' ), command : 'insertHorizontalRule', noActive : true }
  },

  // Path to the sprite image containing all editor icons.
  iconsPath : '../nicEditorIcons.gif',

  // Default list of buttons to display in the editor panel.
  buttonList : [
    'save', 'bold', 'italic', 'underline', 'left', 'center', 'right', 'justify', 'ol', 'ul',
    'fontSize', 'fontFamily', 'fontFormat', 'indent', 'outdent', 'image', 'upload', 'link',
    'unlink', 'forecolor', 'bgcolor'
  ],

  // Mapping of icon names to their position (in pixels, 1-indexed) within the sprite image.
  iconList : {
    "xhtml" : 1, "bgcolor" : 2, "forecolor" : 3, "bold" : 4, "center" : 5, "hr" : 6,
    "indent" : 7, "italic" : 8, "justify" : 9, "left" : 10, "ol" : 11, "outdent" : 12,
    "removeformat" : 13, "right" : 14, "save" : 25, "strikethrough" : 16, "subscript" : 17,
    "superscript" : 18, "ul" : 19, "underline" : 20, "image" : 21, "link" : 22,
    "unlink" : 23, "close" : 24, "arrow" : 26, "upload" : 27
  },

  // If true, a <br /> tag is inserted into empty editor instances on initialization.
  initWithLineBreak : true
} );
/*
 * END CONFIGURATION BLOCK
 */


// Global object for managing nicEditor instances and plugins.
var nicEditors = {
  nicPlugins : [ ], // Array to store registered plugins.
  editors : [ ], // Array to store active nicEditor instances.

  // Registers a new plugin with optional configuration.
  registerPlugin : function ( plugin, options ) {
    this.nicPlugins.push( { p : plugin, o : options } );
  },

  // Initializes nicEditor on all <textarea> elements found in the document.
  allTextAreas : function ( nicOptions ) {
    var textareas = document.getElementsByTagName( "textarea" );
    for ( var i = 0; i < textareas.length; i++ ) {
      nicEditors.editors.push( new nicEditor( nicOptions ).panelInstance( textareas[i] ) );
    }
    return nicEditors.editors;
  },

  // Finds an nicEditor instance associated with a given element.
  findEditor : function ( e ) {
    var editors = nicEditors.editors;
    for ( var i = 0; i < editors.length; i++ ) {
      if ( editors[i].instanceById( e ) ) {
        return editors[i]; // Returns the nicEditor instance.
      }
    }
  }
};


// nicEditor class, extending bkClass and then bkEvent.
// Manages multiple nicEditorInstance objects and a shared panel.
var nicEditor = bkClass.extend( {
  // Constructor for the nicEditor.
  construct : function ( o ) {
    this.options = new nicEditorConfig( ); // Initialize with default config.
    bkExtend( this.options, o ); // Extend with custom options.

    this.nicInstances = new Array( ); // Stores nicEditorInstance objects.
    this.loadedPlugins = new Array( ); // Stores active plugin instances.

    var plugins = nicEditors.nicPlugins;
    // Instantiate and load all registered plugins.
    for ( var i = 0; i < plugins.length; i++ ) {
      this.loadedPlugins.push( new plugins[i].p( this, plugins[i].o ) );
    }

    nicEditors.editors.push( this ); // Add this editor to the global list.
    // Add a global mousedown event to check for editor selection changes.
    bkLib.addEvent( document.body, 'mousedown', this.selectCheck.closureListener( this ) );
  },

  // Creates a panel instance for a given element.
  panelInstance : function ( e, o ) {
    e = this.checkReplace( $BK( e ) ); // Ensure element is wrapped and replace existing editor if any.
    // Create a DIV for the panel and insert it before the target element.
    var panelElm = new bkElement( 'DIV' ).setStyle( { width : ( parseInt( e.getStyle( 'width' ) ) || e.clientWidth ) + 'px' } ).appendBefore( e );
    this.setPanel( panelElm ); // Set this DIV as the editor's panel.
    return this.addInstance( e, o ); // Add the editor instance.
  },

  // Checks if an editor already exists for an element and removes it.
  checkReplace : function ( e ) {
    var r = nicEditors.findEditor( e );
    if ( r ) {
      r.removeInstance( e ); // Remove existing instance.
      r.removePanel( ); // Remove associated panel.
    }
    return e;
  },

  // Adds a new editor instance to a target element.
  addInstance : function ( e, o ) {
    e = this.checkReplace( $BK( e ) ); // Prepare the element.
    var newInstance;
    // Choose between iframe-based or contentEditable-based instance.
    if ( e.contentEditable || !! window.opera ) {
      newInstance = new nicEditorInstance( e, o, this );
    } else {
      newInstance = new nicEditorIFrameInstance( e, o, this ); // Assuming nicEditorIFrameInstance exists.
    }
    this.nicInstances.push( newInstance );
    return this;
  },

  // Removes a specific editor instance by its element.
  removeInstance : function ( e ) {
    e = $BK( e ); // Ensure element is wrapped.
    var instances = this.nicInstances;
    for ( var i = 0; i < instances.length; i++ ) {
      if ( instances[i].e == e ) {
        instances[i].remove( ); // Call the instance's remove method.
        this.nicInstances.splice( i, 1 ); // Remove from the array.
      }
    }
  },

  // Removes the panel associated with this editor.
  removePanel : function ( e ) {
    if ( this.nicPanel ) {
      this.nicPanel.remove( ); // Remove the panel element from DOM.
      this.nicPanel = null; // Clear the reference.
    }
  },

  // Finds an editor instance by its element.
  instanceById : function ( e ) {
    e = $BK( e );
    var instances = this.nicInstances;
    for ( var i = 0; i < instances.length; i++ ) {
      if ( instances[i].e == e ) {
        return instances[i];
      }
    }
  },

  // Sets the editor panel.
  setPanel : function ( e ) {
    this.nicPanel = new nicEditorPanel( $BK( e ), this.options, this ); // Create a new panel.
    this.fireEvent( 'panel', this.nicPanel ); // Fire a 'panel' event.
    return this;
  },

  // Executes a rich-text command on the currently selected instance.
  nicCommand : function ( cmd, args ) {
    if ( this.selectedInstance ) {
      this.selectedInstance.nicCommand( cmd, args );
    }
  },

  // Retrieves icon style properties for a given icon name.
  getIcon : function ( iconName, options ) {
    var icon = this.options.iconList[ iconName ]; // Get icon position from config.
    var file = ( options.iconFiles ) ? options.iconFiles[ iconName ] : ''; // Check for custom icon files.

    return {
      backgroundImage : "url('" + ( ( icon ) ? this.options.iconsPath : file ) + "')",
      backgroundPosition : ( ( icon ) ? ( ( icon - 1 ) * -18 ) : 0 ) + 'px 0px'
    };
  },

  // Checks for editor selection change (blur event).
  selectCheck : function ( e, t ) {
    var found = false;
    // Traverse up the DOM tree to see if the click originated inside a nicEdit element.
    do {
      if ( t.className && t.className.indexOf( 'nicEdit' ) != -1 ) {
        return false; // Click was inside a nicEdit element, do nothing.
      }
    } while ( t = t.parentNode ); // Continue until no parent.

    // If click was outside, fire blur event and deselect.
    this.fireEvent( 'blur', this.selectedInstance, t );
    this.lastSelectedInstance = this.selectedInstance;
    this.selectedInstance = null;
    return false;
  }
} );
// Extend nicEditor with bkEvent's custom event methods.
nicEditor = nicEditor.extend( bkEvent );


// nicEditorInstance class, extending bkClass.
// Represents a single editable area within the nicEditor.
var nicEditorInstance = bkClass.extend( {
  isSelected : false, // Flag to indicate if this instance is currently selected/active.

  // Constructor for nicEditorInstance.
  construct : function ( e, options, nicEditor ) {
    this.ne = nicEditor; // Reference to the parent nicEditor.
    this.elm = this.e = e; // The original target element.
    this.options = options || { }; // Instance-specific options.

    // Calculate initial dimensions.
    var newX = parseInt( e.getStyle( 'width' ) ) || e.clientWidth;
    var newY = parseInt( e.getStyle( 'height' ) ) || e.clientHeight;
    this.initialHeight = newY - 8;

    var isTextarea = ( e.nodeName.toLowerCase( ) == "textarea" );
    // If it's a textarea or has a panel, create the editor container.
    if ( isTextarea || this.options.hasPanel ) {
      // IE7 specific check for maxHeight compatibility.
      var ie7s = ( bkLib.isMSIE && ! ( ( typeof document.body.style.maxHeight != "undefined" ) && document.compatMode == "CSS1Compat" ) )

      // Define container styles.
      var s = {
        width : newX + 'px',
        border : '1px solid #ccc',
        borderTop : 0,
        overflowY : 'auto',
        overflowX : 'hidden'
      };
      // Set height or maxHeight based on browser and options.
      s[ ( ie7s ) ? 'height' : 'maxHeight' ] = ( this.ne.options.maxHeight ) ? this.ne.options.maxHeight + 'px' : null;

      // Create editor container and insert it before the original element.
      this.editorContain = new bkElement( 'DIV' ).setStyle( s ).appendBefore( e );
      // Create the actual editable DIV inside the container.
      var editorElm = new bkElement( 'DIV' ).setStyle( { width : ( newX - 8 ) + 'px', margin : '4px', minHeight : newY + 'px' } ).addClass( 'main' ).appendTo( this.editorContain );

      e.setStyle( { display : 'none' } ); // Hide the original element.

      editorElm.innerHTML = e.innerHTML; // Copy content.
      if ( isTextarea ) {
        editorElm.setContent( e.value ); // For textareas, copy value.
        this.copyElm = e; // Keep reference to original textarea.
        var f = e.parentTag( 'FORM' );
        if ( f ) {
          // If in a form, save content on form submit.
          bkLib.addEvent( f, 'submit', this.saveContent.closure( this ) );
        }
      }
      // Set final styles for the editor element.
      editorElm.setStyle( ( ie7s ) ? { height : newY + 'px' } : { overflow : 'hidden' } );
      this.elm = editorElm; // Set the editable DIV as the instance's element.
    }
    // Add a blur event listener to the parent nicEditor.
    this.ne.addEvent( 'blur', this.blur.closure( this ) );

    this.init( ); // Initialize the editor instance.
    this.blur( ); // Call blur initially to ensure correct state.
  },

  // Initializes the contentEditable area.
  init : function ( ) {
    this.elm.setAttribute( 'contentEditable', 'true' ); // Make the element editable.

    // If empty and option is set, insert a line break.
    if ( this.getContent( ) == "" && this.options.initWithLineBreak ) {
      this.setContent( '<br />' );
    }

    this.instanceDoc = document.defaultView; // Get the default view (window object).

    // Attach event listeners to the editable element.
    this.elm.addEvent( 'mousedown', this.selected.closureListener( this ) )
      .addEvent( 'keypress', this.keyDown.closureListener( this ) )
      .addEvent( 'focus', this.selected.closure( this ) )
      .addEvent( 'blur', this.blur.closure( this ) )
      .addEvent( 'keyup', this.selected.closure( this ) );

    this.ne.fireEvent( 'add', this ); // Fire 'add' event for this instance.
  },

  // Removes the editor instance.
  remove : function ( ) {
    this.saveContent( ); // Save content back to original element.
    if ( this.copyElm || this.options.hasPanel ) {
      this.editorContain.remove( ); // Remove the editor container.
      this.e.setStyle( { 'display' : 'block' } ); // Show the original element.
      this.ne.removePanel( ); // Remove the associated panel.
    }
    this.disable( ); // Disable contentEditable.
    this.ne.fireEvent( 'remove', this ); // Fire 'remove' event.
  },

  // Disables content editing for the instance.
  disable : function ( ) {
    this.elm.setAttribute( 'contentEditable', 'false' );
  },

  // Gets the current selection object (cross-browser).
  getSel : function ( ) {
    return ( window.getSelection ) ? window.getSelection( ) : document.selection;
  },

  // Gets the current range object from the selection (cross-browser).
  getRng : function ( ) {
    var s = this.getSel( );
    if ( ! s ) {
      return null;
    }
    return ( s.rangeCount > 0 ) ? s.getRangeAt( 0 ) :
      s.createRange && s.createRange( ) || document.createRange( );
  },

  // Sets the current selection to a given range.
  selRng : function ( rng, s ) {
    if ( window.getSelection ) {
      s.removeAllRanges( ); // Clear existing ranges.
      s.addRange( rng ); // Add the new range.
    } else {
      rng.select( ); // For IE, select the range.
    }
  },

  // Gets the currently selected element or its parent.
  selElm : function ( ) {
    var r = this.getRng( );
    if ( r.startContainer ) {
      var contain = r.startContainer;
      if ( r.cloneContents( ).childNodes.length == 1 ) {
        for ( var i = 0; i < contain.childNodes.length; i++ ) {
          var rng = contain.childNodes[i].ownerDocument.createRange( );
        } // The original code has an incomplete for loop here. I must preserve it.
      }
    }
  }
} );
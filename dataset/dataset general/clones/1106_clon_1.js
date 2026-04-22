/*
 * PlistEditor - A JavaScript-based Property List editor inspired by JSON editors.
 * This tool allows for interactive editing of JavaScript objects,
 * mimicking a property list structure.
 */

// Original Copyright Notice:
// © 2015 Greg Neagle
// Inspired by and borrowing code from David Durman's FlexiJsonEditor
// https://github.com/DavidDurman/FlexiJsonEditor

/*
 * Project Dependencies:
 *
 * 1. Bootstrap 3 (most recently tested with 3.3.1)
 *    Note: Not strictly dependent on Bootstrap for core functionality,
 *    but the UI styling will be severely impacted without it.
 * 2. jQuery (most recently tested with v1.11.2)
 *    This library is a hard dependency for DOM manipulation and event handling.
 * 3. JSON library (use json2.js for older browsers)
 *    Required for JSON parsing and stringification, though modern browsers
 *    support JSON natively.
 */

// Usage Example:
//     $('#mydiv').plistEditor(jsobj, opt);
// Where `jsobj` is the JavaScript object to edit, and `opt` is an optional
// configuration object.

( function ( $ ) {

  /**
   * jQuery plugin definition for plistEditor.
   * Extends jQuery's prototype to make `plistEditor` available on jQuery objects.
   *
   * @param {object} obj The JavaScript object to be edited.
   * @param {object} options Optional configuration settings.
   */
  $.fn.plistEditor = function ( obj, options ) {
    // Ensure options object exists, default to empty object if not provided.
    options = options || {};

    // K is a no-operation function, used as a default for callbacks.
    var K = function () {};

    // Extract `change` callback from options, default to K.
    var onchange = options.change || K;

    // Extract `propertyclick` callback from options, default to K.
    var onpropertyclick = options.propertyclick || K;

    // Iterate over each selected element and apply the editor.
    return this.each( function () {
      // Initialize the PlistEditor for the current DOM element.
      PlistEditor( $( this ), obj, onchange, onpropertyclick );
    } );
  };


  /**
   * Main PlistEditor function. Initializes and constructs the editor interface.
   *
   * @param {jQuery} target The jQuery object representing the DOM element
   *                        where the editor will be rendered.
   * @param {object} obj The JavaScript object to be edited.
   * @param {function} onchange Callback function triggered on data change.
   * @param {function} onpropertyclick Callback function triggered when a property name is clicked.
   */
  function PlistEditor ( target, obj, onchange, onpropertyclick ) {
    // Configuration object for the editor instance.
    var opt = {
      target: target,            // The jQuery element hosting the editor.
      onchange: onchange,        // Callback for data changes.
      onpropertyclick: onpropertyclick, // Callback for property clicks.
      original: obj,             // The original JavaScript object being edited.
    };
    // Begin the recursive construction of the editor UI.
    construct( opt, obj, target );
  }


  /*
   * Type checking helper functions.
   * These functions determine the specific type of a given JavaScript variable.
   */

  /**
   * Checks if a variable is a Date object.
   * @param {*} o The variable to check.
   * @returns {boolean} True if 'o' is a Date, false otherwise.
   */
  function isDate ( o ) {
    return Object.prototype.toString.call( o ) == '[object Date]';
  }

  /**
   * Checks if a variable is a plain JavaScript object.
   * @param {*} o The variable to check.
   * @returns {boolean} True if 'o' is a plain object, false otherwise.
   */
  function isObject ( o ) {
    return Object.prototype.toString.call( o ) == '[object Object]';
  }

  /**
   * Checks if a variable is an Array.
   * @param {*} o The variable to check.
   * @returns {boolean} True if 'o' is an Array, false otherwise.
   */
  function isArray ( o ) {
    return Object.prototype.toString.call( o ) == '[object Array]';
  }

  /**
   * Checks if a variable is a Boolean.
   * @param {*} o The variable to check.
   * @returns {boolean} True if 'o' is a Boolean, false otherwise.
   */
  function isBoolean ( o ) {
    return Object.prototype.toString.call( o ) == '[object Boolean]';
  }

  /**
   * Checks if a variable is a Number.
   * @param {*} o The variable to check.
   * @returns {boolean} True if 'o' is a Number, false otherwise.
   */
  function isNumber ( o ) {
    return Object.prototype.toString.call( o ) == '[object Number]';
  }

  /**
   * Checks if a variable is an Integer.
   * @param {*} o The variable to check.
   * @returns {boolean} True if 'o' is an Integer, false otherwise.
   */
  function isInteger ( o ) {
    return ( isNumber( o ) && Math.round( o ) == o );
  }

  /**
   * Checks if a variable is a String.
   * @param {*} o The variable to check.
   * @returns {boolean} True if 'o' is a String, false otherwise.
   */
  function isString ( o ) {
    return Object.prototype.toString.call( o ) == '[object String]';
  }

  // A string containing all recognized types, currently unused directly but
  // useful for reference.
  var types = 'object array boolean number string date null';


  /**
   * Modifies an object `o` by setting or deleting a value at a given `path`.
   * If `value` is omitted, the property at `path` is deleted.
   *
   * Example:
   *   feed({}, 'foo.bar.baz', 10);
   *   // returns { foo: { bar: { baz: 10 } } }
   *
   * @param {object|array} o The object or array to modify.
   * @param {string} path The dot-separated path to the property.
   * @param {*} [value] The value to set at the path. If omitted, property is deleted.
   * @returns {object|array} The modified object.
   */
  function feed ( o, path, value ) {
    // Determine if the operation is a deletion.
    var del = arguments.length == 2;

    // Check if the path contains dot notation for nested properties.
    if ( path.indexOf( '.' ) > -1 ) {
      var diver = o, // 'diver' traverses the object structure.
        i = 0,
        parts = path.split( '.' ); // Split path into individual keys.

      // Traverse down to the parent of the target property.
      for ( var len = parts.length; i < len - 1; i++ ) {
        diver = diver[ parts[ i ] ];
      }

      // Perform deletion or assignment on the target property.
      if ( del ) {
        if ( getType( diver ) == 'array' ) {
          // If parent is an array, use splice to remove an element by index.
          var index = parts[ len - 1 ];
          diver.splice( index, 1 );
        } else {
          // If parent is an object, use delete operator.
          delete diver[ parts[ len - 1 ] ];
        }
      } else {
        // Assign the new value.
        diver[ parts[ len - 1 ] ] = value;
      }
    } else {
      // If path is a single key (no dot notation).
      if ( del ) {
        if ( getType( o ) == 'array' ) {
          // If the object itself is an array, splice.
          o.splice( path, 1 );
        } else {
          // Otherwise, delete the property directly.
          delete o[ path ];
        }
      } else {
        // Assign the value directly.
        o[ path ] = value;
      }
    }
    return o; // Return the modified object.
  }


  /**
   * Retrieves a property by its path from object `o`.
   * If the property does not exist, `defaultValue` is returned.
   *
   * Example:
   *   def({ foo: { bar: 5 } }, 'foo.bar', 100);   // returns 5
   *   def({ foo: { bar: 5 } }, 'foo.baz', 100);   // returns 100
   *
   * @param {object} o The object to query.
   * @param {string} path The dot-separated path to the property.
   * @param {*} defaultValue The value to return if the property is not found.
   * @returns {*} The value at the specified path or `defaultValue`.
   */
  function def ( o, path, defaultValue ) {
    // Split the path into an array of keys.
    path = path.split( '.' );
    var i = 0;
    // Traverse the object using the path parts.
    while ( i < path.length ) {
      // If any part of the path is undefined, return the defaultValue.
      if ( ( o = o[ path[ i++ ] ] ) == undefined ) return defaultValue;
    }
    return o; // Return the found value.
  }


  /**
   * Logs an error message to the console if available.
   * @param {string} reason The error message.
   */
  function error ( reason ) {
    if ( window.console ) {
      console.error( reason );
    }
  }


  /**
   * Attempts to parse a JSON string.
   * @param {string} str The JSON string to parse.
   * @returns {object|null} The parsed JavaScript object, or null if parsing fails.
   */
  function parse ( str ) {
    var res;
    try {
      res = JSON.parse( str );
    } catch ( e ) {
      res = null;
      error( 'JSON parse failed' );
    }
    return res;
  }


  /**
   * Attempts to stringify a JavaScript object into a JSON string.
   * @param {object} obj The object to stringify.
   * @returns {string} The JSON string representation, or 'null' if stringification fails.
   */
  function stringify ( obj ) {
    var res;
    try {
      res = JSON.stringify( obj );
    } catch ( e ) {
      res = 'null';
      error( 'JSON stringify failed.' );
    }
    return res;
  }


  /**
   * Creates an expander element for collapsing/expanding tree nodes.
   * @returns {jQuery} The expander element.
   */
  function expander () {
    // Create a span with the 'expander' class.
    var _expander = $( '<span>', { 'class': 'expander' } );

    // Attach a click event handler to toggle the 'expanded' class on the parent item.
    _expander.bind( 'click', function () {
      var item = $( this ).parent();
      item.toggleClass( 'expanded' );
    } );
    return _expander;
  }


  /**
   * Creates an "add new value" button and its container.
   * @param {function} handler The click handler for the add button.
   * @returns {jQuery} The appender element.
   */
  function itemAppender ( handler ) {
    // Create the container div for the appender button.
    var appender = $( '<div>', { 'class': 'item appender' } ),
      // Create the button itself.
      btn = $( '<button />', { 'class': 'btn btn-success btn-xs' } ),
      // Create the plus icon for the button.
      span = $( '<span>', { 'class': 'glyphicon glyphicon-plus' } );

    // Optionally, `btn.text('Add New Value');` could be used to add text.
    // Append the icon to the button.
    btn.append( span );

    // Attach the provided handler to the button's click event.
    btn.click( handler );

    // Append the button to the appender container.
    appender.append( btn );

    return appender;
  }


  /**
   * Creates row control elements, specifically a delete button for a table row.
   * @param {object} opt The editor options object.
   * @returns {jQuery} The table data cell containing the delete button.
   */
  function rowControls ( opt ) {
    // Create a table data cell for row controls.
    var _rowControls = $( '<td>',
      { 'class': 'row-controls', 'width': '24px' } ),
      // Create the delete button.
      btn = $( '<button>', { 'class': 'btn btn-danger btn-xs' } ),
      // Create the minus icon for the delete button.
      delSpan = $( '<span>',
        { 'class': 'glyphicon glyphicon-minus' } );

    // Append the icon to the button.
    btn.append( delSpan );

    // Append the button to the controls cell.
    _rowControls.append( btn );

    // Attach the delete row function to the button's click event.
    btn.click( deleteRow( opt ) );

    return _rowControls;
  }


  /**
   * Adds a new value to an array or an object.
   * For arrays, it pushes `null`. For objects, it adds a new key 'newKey'
   * (or 'newKeyN' if 'newKey' already exists) with a `null` value.
   *
   * @param {object|array} obj The object or array to modify.
   * @returns {boolean} True if a value was added, false otherwise.
   */
  function addNewValue ( obj ) {
    // Handle arrays: just push a null value.
    if ( isArray( obj ) ) {
      obj.push( null );
      return true;
    }

    // Handle objects: add a new key-value pair.
    if ( isObject( obj ) ) {
      var i = 1,
        newName = "newKey";

      // Ensure the new key is unique.
      while ( obj.hasOwnProperty( newName ) ) {
        newName = "newKey" + i;
        i++;
      }

      // Add the new key with a null value.
      obj[ newName ] = null;
      return true;
    }

    return false; // No value added if not an array or object.
  }


  /**
   * Recursively constructs the editor UI for a given object or array.
   *
   * @param {object} opt The editor options object.
   * @param {object|array} obj The current object/array/value to render.
   * @param {jQuery} root The jQuery element where the current `obj` will be rendered.
   * @param {string} [path] The current dot-separated path to `obj`.
   */
  function construct ( opt, obj, root, path ) {
    path = path || ''; // Initialize path if not provided.
    root.children().remove(); // Clear previous content of the root element.

    var objType = getType( obj ); // Determine the type of the current object.

    // Handle 'dict' (object) type.
    if ( objType == 'dict' ) {
      var table = $( '<table>',
          { "class": "table table-striped table-condensed" } ),
        tableBody = $( '<tbody>', { 'class': 'dict' } );

      // Iterate over properties of the object.
      for ( key in obj ) {
        // Ensure it's an own property, not inherited.
        if ( obj.hasOwnProperty( key ) ) {
          // Construct the data path for the current property.
          var dataPath = ( path ? path + '.' : '' ) + key;
          var tableRow = $( '<tr>', { 'data-path': dataPath } );

          // Create the table header cell for the property key.
          var rowHeader = $( '<th>',
            { 'scope': 'row', 'class': 'col-sm-3' } );
          // Create an input field for editing the property key.
          var keyElement = $( '<input>',
            { 'class': 'property form-control' } );

          keyElement.val( key ).attr( 'title', key ); // Set initial value and title.
          rowHeader.append( keyElement ); // Add key input to header.

          // Attach click and change handlers for the key element.
          keyElement.click( propertyClicked( opt ) );
          keyElement.change( propertyChanged( opt ) );

          // Create the table data cell for the property value.
          var rowValue = $( '<td>',
            { 'data-type': getType( obj[ key ] ) } );

          // Recursively construct the UI for the property's value.
          construct( opt, obj[ key ], rowValue, dataPath );

          // Append header, value, and row controls to the table row.
          tableRow.append( rowHeader ).append( rowValue );
          tableRow.append( rowControls( opt ) );

          tableBody.append( tableRow ); // Add row to table body.
        }
      }
      table.append( tableBody ); // Add table body to table.
      root.append( expander() ); // Add expander control.
      root.append( table ); // Add the table to the root.

      // Add "add new value" button for dictionaries.
      root.append( itemAppender( function () {
        addNewValue( obj ); // Add a new key-value pair to the object.
        construct( opt, obj, root, path ); // Reconstruct to show new item.
        opt.onchange( opt.original ); // Trigger change callback.
      } ) );

    } else if ( objType == 'array' ) {
      // Handle 'array' type.
      var table = $( '<table>',
          { "class": "table table-striped table-condensed" } ),
        tableBody = $( '<tbody>', { 'class': 'array' } );

      // Iterate over elements of the array.
      for ( var i = 0; i < obj.length; ++i ) {
        // Construct the data path for the current array element.
        var dataPath = ( path ? path + '.' : '' ) + i;
        var tableRow = $( '<tr>', { 'data-path': dataPath } );

        // Create a header cell (can be empty for array items).
        var rowHeader = $( '<th>',
          { 'scope': 'row' } );

        // Create the table data cell for the array element's value.
        var rowValue = $( '<td>',
          {
            'data-type': getType( obj[ i ] ),
            'width': '100%'
          } );

        // Recursively construct the UI for the array element's value.
        construct( opt, obj[ i ], rowValue, dataPath );

        // Append header, value, and row controls to the table row.
        tableRow.append( rowHeader );
        tableRow.append( rowValue );
        tableRow.append( rowControls( opt ) );

        tableBody.append( tableRow ); // Add row to table body.
      }

      // Make array elements re-orderable using jQuery UI Sortable.
      tableBody.sortable( {
        items: '> tr', // Only sort direct table row children.
        containment: 'table', // Confine sorting within the table.
        update: function ( event, ui ) {
          // Callback after sorting is complete.
          var newArray = [],
            childItems = $( event.target ).children( 'tr' );

          // Reconstruct the array based on the new order of table rows.
          $( childItems ).each( function () {
            var path = $( this ).data( 'path' ),
              val = def( opt.original, path ); // Get the value from the original object.
            newArray.push( val );
          } );

          // Get the path to the parent array.
          var valueElement = $( event.target ).closest( 'td' ),
            parentTableRow = valueElement.closest( 'tr' ),
            path = parentTableRow.data( 'path' );

          // Update the original object with the reordered array.
          feed( opt.original, path, newArray );

          // Reconstruct the UI for the reordered array.
          construct( opt, newArray, valueElement, path );

          opt.onchange( opt.original ); // Trigger change callback.
        }
      } );
      table.append( tableBody ); // Add table body to table.
      root.append( expander() ); // Add expander control.
      root.append( table ); // Add the table to the root.

      // Add "add new value" button for arrays.
      root.append( itemAppender( function () {
        addNewValue( obj ); // Add a new element to the array.
        construct( opt, obj, root, path ); // Reconstruct to show new item.
        opt.onchange( opt.original ); // Trigger change callback.
      } ) );

    } else if ( objType == 'null' ) {
      // Handle 'null' type: display a type selection dropdown.
      valueElement = typeSelect();
      root.append( valueElement );
      valueElement.change( valueChanged( opt ) ); // Attach change handler.

    } else if ( objType == 'boolean' ) {
      // Handle 'boolean' type: display a checkbox.
      valueElement = checkbox( obj );
      root.append( valueElement );
      valueElement.change( valueChanged( opt ) ); // Attach change handler.

    } else if ( objType == 'string' ) {
      // Handle 'string' type: display a textarea.
      var rows = obj.split( '\n' ).length; // Count newlines for textarea height.
      if ( rows == 1 && obj.length > 79 ) {
        rows = 2; // If single line but very long, make it two rows.
      }
      valueElement = $( '<textarea>',
        { 'class': 'value form-control', 'rows': rows } );
      valueElement.val( obj ); // Set textarea value.
      root.append( valueElement );
      valueElement.change( valueChanged( opt ) ); // Attach change handler.

    } else {
      // Handle 'number', 'date', and other primitive types: display an input field.
      valueElement = $( '<input>',
        { 'class': 'value form-control' } );
      var val;
      if ( objType == 'date' ) {
        // For dates, convert to ISO string format.
        val = obj.toISOString();
      } else {
        // For other primitives, stringify them.
        val = stringify( obj );
      }
      valueElement.val( val ).attr( 'title', val ); // Set input value and title.
      root.append( valueElement );
      valueElement.change( valueChanged( opt ) ); // Attach change handler.
    }
  }


  /**
   * Creates a checkbox input element.
   * @param {boolean} currentValue The initial checked state.
   * @returns {jQuery} The checkbox input element.
   */
  function checkbox ( currentValue ) {
    var s = $( '<input />',
      { 'type': 'checkbox', 'class': 'value' } ).prop(
      "checked", currentValue );
    return s;
  }


  /**
   * Creates a select dropdown for choosing a new data type.
   * @returns {jQuery} The select element.
   */
  function typeSelect () {
    // Array of possible types with their default values and display text.
    var arr = [
      { val: null, text: 'Select type' },
      { val: 'string', text: 'String' },
      { val: 0, text: 'Integer' },
      { val: false, text: 'Boolean' },
      { val: new Date(), text: 'Date' },
      { val: [], text: 'Array' },
      { val: {}, text: 'Dict' }
    ];

    var sel = $( '<select>', { 'class': 'value form-control' } );

    // Populate the select dropdown with options from the `arr`.
    $( arr ).each( function () {
      sel.append( $( "<option>" ).attr( 'value',
        stringify( this.val ) ).text( this.text ) );
    } );
    return sel;
  }


  /**
   * Returns a function that handles clicks on property names.
   * It triggers the `onpropertyclick` callback with the property's path.
   *
   * @param {object} opt The editor options object.
   * @returns {function} The click handler for property names.
   */
  function propertyClicked ( opt ) {
    return function () {
      var tableRow = $( this ).closest( 'tr' ),
        path = $( tableRow ).data( 'path' );

      // Format the path for display, e.g., 'foo.bar' becomes '[\'foo\'][\'bar\']'.
      var safePath = path.split( '.' ).join( '\'][\'' );

      // Call the `onpropertyclick` callback with the formatted path.
      opt.onpropertyclick( '[\'' + safePath + '\']' );
    };
  }


  /**
   * Returns a function that handles changes to property names.
   * This function renames the property in the underlying object and updates the UI.
   *
   * @param {object} opt The editor options object.
   * @returns {function} The change handler for property names.
   */
  function propertyChanged ( opt ) {
    return function () {
      // Find the parent table row and extract relevant data.
      var tableRow = $( this ).closest( 'tr' ),
        prevPath = $( tableRow ).data( 'path' ), // Old path of the property.
        newKey = $( this ).val(), // New key entered by the user.
        oldKey = $( this ).attr( 'title' ), // Original key (stored in title attribute).
        val = def( opt.original, prevPath, null ); // Get the value associated with the old key.

      // Update the title attribute to reflect the new key.
      $( this ).attr( 'title', newKey );

      // Remove the old key-value pair from the original object.
      feed( opt.original, prevPath );

      // If a new key was provided (i.e., not deleting the key by making it empty).
      if ( newKey ) {
        // Calculate the new path for the property.
        var pathElements = prevPath.split( '.' );
        pathElements.pop(); // Remove the old key.
        pathElements.push( newKey ); // Add the new key.
        var newPath = pathElements.join( '.' );

        // Insert the value with the new key into the original object.
        feed( opt.original, newPath, val );

        // Update the 'data-path' attribute of the table row.
        $( tableRow ).data( 'path', newPath );
        $( tableRow ).attr( 'data-path', newPath ); // Update DOM attribute for persistence.

        // Reconstruct the value element's UI to reflect the new path,
        // as sub-elements might need path updates.
        var valueElement = $( this ).parent().next(); // The td containing the value.
        construct( opt, val, valueElement, newPath );
      } else {
        // If the new key is empty, it implies deletion of the row.
        $( tableRow ).remove();
      }
      opt.onchange( opt.original ); // Trigger change callback.
    };
  }


  /**
   * Returns a function that handles deletion of a row (property or array element).
   * It removes the corresponding item from the underlying object and updates the UI.
   *
   * @param {object} opt The editor options object.
   * @returns {function} The click handler for delete buttons.
   */
  function deleteRow ( opt ) {
    return function () {
      // Find the parent table row and its path.
      var tableRow = $( this ).closest( 'tr' ),
        path = $( tableRow ).data( 'path' );

      // Remove the item from the original object.
      stringify( feed( opt.original, path ) ); // `stringify` is used here for its side effect of calling `feed`.

      // If the parent is an array, paths of subsequent elements need to be updated.
      if ( $( tableRow ).closest( 'tbody' ).hasClass( 'array' ) ) {
        var nextRow = $( tableRow ).next( 'tr' );

        // Iterate through subsequent rows to update their data paths.
        while ( $( nextRow ).data( 'path' ) ) {
          path = $( nextRow ).data( 'path' );
          var pathElements = path.split( '.' ),
            lastElement = pathElements.pop(); // Get the current index.

          // Decrement the index for the new path.
          pathElements.push( lastElement - 1 );
          path = pathElements.join( '.' );

          // Update data-path in jQuery data and DOM attribute.
          $( nextRow ).data( 'path', path );
          $( nextRow ).attr( 'data-path', path );

          nextRow = $( nextRow ).next( 'tr' ); // Move to the next row.
        }
      }

      $( tableRow ).remove(); // Remove the table row from the DOM.
      opt.onchange( opt.original ); // Trigger change callback.
    };
  }


  /**
   * Extracts and parses the value from a given input element, based on its data type.
   *
   * @param {jQuery} valueElement The jQuery object of the input element.
   * @returns {*} The parsed value.
   */
  function getValue ( valueElement ) {
    var type = $( valueElement ).parent().data( 'type' );
    var val;

    // Handle string type: return as-is.
    if ( type == 'string' ) {
      val = $( valueElement ).val();
    }
    // Handle date type: attempt to parse as a date.
    else if ( type == 'date' ) {
      var timestamp = Date.parse( $( valueElement ).val() );
      if ( isNaN( timestamp ) ) {
        // If invalid date, alert and mark the cell.
        alert( "Invalid date!" );
        $( valueElement ).closest( 'td' ).addClass( 'danger' );
        timestamp = 0; // Default to epoch for invalid dates.
      } else {
        $( valueElement ).parent().closest( 'td' ).removeClass( 'danger' );
      }
      val = new Date( timestamp );
    }
    // Handle boolean type: check if the checkbox is checked.
    else if ( type == 'boolean' ) {
      val = $( valueElement ).is( ':checked' );
    }
    // Handle other types (number, null, etc.): parse as JSON.
    else {
      val = parse( $( valueElement ).val() || 'null' );
      // TODO: Add validation to ensure the type hasn't implicitly changed
      // (e.g., a number entered into a boolean field).
    }
    return val;
  }


  /**
   * Returns a function that handles changes to value input fields.
   * This function updates the underlying object with the new value and
   * potentially reconstructs the UI if the type changes.
   *
   * @param {object} opt The editor options object.
   * @returns {function} The change handler for value inputs.
   */
  function valueChanged ( opt ) {
    return function () {
      var val = null,
        tableRow = $( this ).closest( 'tr' ),
        path = $( tableRow ).data( 'path' );

      // If the changed element is a <select> (for null type conversion).
      if ( $( this ).is( 'select' ) ) {
        // Parse the selected value to determine the new type and default value.
        val = parse( $( this ).val() || 'null' );
        var type = getType( val );

        // Special handling for strings that might be dates.
        if ( type == 'string' ) {
          var timestamp = Date.parse( val );
          if ( !isNaN( timestamp ) ) {
            type = 'date';
            val = new Date( timestamp );
          }
        }

        // Update the 'data-type' attribute on the parent td.
        $( this ).parent().data( 'type', type );
        $( this ).parent().attr( 'data-type', type ); // Update DOM attribute.

        // Reconstruct the UI for the new type.
        construct( opt, val, $( this ).parent(), path );
      } else {
        // For other input types, get the value directly.
        val = getValue( $( this ) );
      }

      // Update the original object with the new value.
      feed( opt.original, path, val );
      opt.onchange( opt.original ); // Trigger change callback.
    };
  }


  /**
   * Determines the specific type of a given value, including custom types like 'dict' and 'date'.
   *
   * @param {*} val The value to check.
   * @returns {string} A string representing the type (e.g., 'dict', 'array', 'string', 'date', 'null').
   */
  function getType ( val ) {
    var type = 'null'; // Default type if nothing else matches (e.g., undefined or actual null).

    if ( isDate( val ) ) {
      type = 'date';
    } else if ( isObject( val ) ) {
      type = 'dict'; // Custom type name for plain objects.
    } else if ( isArray( val ) ) {
      type = 'array';
    } else if ( isBoolean( val ) ) {
      type = 'boolean';
    } else if ( isString( val ) ) {
      type = 'string';
    } else if ( isNumber( val ) ) {
      type = 'number';
    }
    // error(type); // Debugging line, commented out.
    return type;
  }

} )( jQuery ); // Immediately-invoked function expression (IIFE) to encapsulate the plugin.
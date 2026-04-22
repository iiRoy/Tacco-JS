( function ( ) {
  // Helper functions section - these are internal utilities.
  /*
   * Checks if a given value is a string.
   * @param {any} s - The value to check.
   * @returns {boolean} True if the value is a string, false otherwise.
   */
  function isString( s ) {
    return ( typeof s == 'string' );
  }

  function isObj( o ) { // Determines if something is an object
    return ( typeof o == 'object' );
  }

  function isArray( a ) {
    return a.constructor === Array;
  }

  /**
   * Retrieves the names of all attributes for a given DOM element.
   * @param {Element} domElem - The DOM element.
   * @returns {Array<string>} An array of attribute names.
   */
  function getAttributesNames ( domElem ) {
    return Array . prototype . slice . call ( domElem . attributes ) . map ( function ( item ) {
      return item . name
    } )
  }

  function toArray ( itemOrArray ) {
    itemOrArray = itemOrArray || [ ]; // Ensure it's at least an empty array.
    if ( isArray ( itemOrArray ) ) return itemOrArray;
    if ( itemOrArray . constructor === HTMLCollection ) return Array . prototype . slice . call ( itemOrArray );
    if ( itemOrArray . constructor === NodeList ) return Array . prototype . slice . call ( itemOrArray );

    return [ itemOrArray ]; // Wrap single item in an array.
  }

  var toArr = toArray; // Alias for toArray for brevity.

  function addListenerMulti ( element , eventsString , func ) {
    var events = eventsString . split ( ' ' );
    events . forEach ( function ( event ) {
      element . addEventListener ( event , func , false );
    } );
  }

  function toDomElems ( selectorOrElem ) {
    if ( isString ( selectorOrElem ) ) return toArray ( document . querySelectorAll ( selectorOrElem ) );
    return selectorOrElem;
  }

  function descendants ( elem ) {
    var res = toArr ( elem . querySelectorAll ( "*" ) )
    res . push ( elem ); // Include the element itself.
    return res;
  }

  /*
   * DOM manipulation utilities.
   * These functions handle interactions with the Document Object Model.
   */
  // return the property to access DOM element's value - 'value', 'innerHTML', 'selectedIndex', etc.
  function getDomValueProp ( elem ) {

    if ( elem . type == 'checkbox' ) return 'checked';
    if ( elem . nodeName == 'INPUT' ) return 'value';
    if ( elem . nodeName == 'TEXTAREA' ) return 'value';
    if ( elem . nodeName == 'SELECT' ) return 'selectedIndex';

    return 'textContent'; // Default property for general elements.
  }

  function getDomValue ( elem ) {
    var propName = getDomValueProp ( elem );
    return elem [ propName ];
  }

  function setDomValue ( elem , newValue ) {
    var propName = getDomValueProp ( elem );
    elem [ propName ] = newValue;
  }

  function syncDomElemsOnChange ( obj , property , domElems ) {
    var events = 'change keyup'; // Events that trigger a sync.
    domElems . forEach ( function ( elem ) {
      addListenerMulti ( elem , events , function ( e ) {
        obj [ property ] = getDomValue ( e . srcElement );
      } );
    } );
  }

  function modifyElems ( domElems , newValue , opts ) {
    if ( domElems . length == 0 ) {
      console . log ( "noop" );
      return;
    }
    var modifyingFunc = getModifyingFunc ( opts )

    domElems . forEach ( function ( domElem ) {
      modifyingFunc ( domElem , newValue );
    } );
  }

  function getModifyingFunc ( opts ) {
    var opts = opts || { }; // Initialize opts if not provided.
    if ( isString ( opts ) ) opts = {
      func: opts
    }; // Treat string input as {func: 'foo'}

    if ( opts . func ) {
      if ( ( opts . func . constructor ) == Function ) return opts . func;
      switch ( opts . func ) {
        case 'show':
          return show;
        case 'bgcolor':
          return bgcolor;
        case 'disable':
          return disable;
        case 'enter':
          return enter;
      }
    }

    return setDomValue; // Default modification function.
  }

  /*
   * Custom element bindings.
   * These functions define specific ways to interact with DOM elements.
   */
  function show ( elem , value ) {
    value ? elem . style . visibility = null : elem . style . visibility = 'hidden';
  }

  function bgcolor ( elem , value ) {
    elem . style . backgroundColor = value;
  }

  function disable ( elem , value ) {
    value ? elem . disabled = true : elem . disabled = false;
  }

  function enter ( elem , cb ) { // Should ideally be refactored into a markupBinding
    if ( elem . listenEnter ) return; // Prevent multiple listeners.
    elem . listenEnter = true;

    elem . addEventListener ( "keyup" , function ( e ) {
      if ( e . keyCode === 13 ) { // Checks whether the pressed key is "Enter"
        var value = elem . value;
        cb ( value );
        elem . value = ""; // Clean the input field after enter.
      }
    } );
  }


  /*
   * JabJS core logic.
   * This section contains the primary functions for data binding.
   */
  function markBindings ( obj , property , domElems , opts ) {
    var opts = opts || { };
    obj . jab = obj . jab || { };
    obj . jab . bindings = obj . bindings || { };
    obj . jab . bindings [ property ] = {
      elems: domElems ,
      func: opts . func ,
      opts: opts
    };
  }

  function bindModelToElem ( obj , property , domElems , opts ) {
    var domElems = toArray ( toDomElems ( domElems ) ); // Ensure DOM elements are in an array.
    var currentValue = obj [ property ] || ''; // Get initial value, default to empty string.
    var opts = opts || { };

    if ( isArray ( obj [ property ] ) ) {
      var _arr = obj [ property ];
      var originalDOMNode = domElems [ 0 ];
      originalDOMNode . originalParent = originalDOMNode . parentElement; // Store parent for later use.
      Object . defineProperty ( obj , property , {
        get: function ( ) {
          return _arr;
        } ,
        set: function ( newValue ) {
          _arr = newValue;
          bindArr ( _arr , originalDOMNode ); // Re-bind array elements.
          return _arr;
        }
      } );

      obj [ property ] = _arr; // Trigger setter to initialize.
      return _arr;
    }

    // Handle non-array (simple) values.
    Object . defineProperty ( obj , property , {
      get: function ( ) {
        return getDomValue ( domElems [ 0 ] );
      } , // Necessary if DOM elem is modified externally.
      set: function ( newValue ) {
        modifyElems ( domElems , newValue , opts );
        if ( opts . afterHook ) ( opts . afterHook ) ( newValue ); // Execute afterHook if present.
      } ,
      configurable: true
    } );

    syncDomElemsOnChange ( obj , property , domElems );

    markBindings ( obj , property , domElems , opts );
    obj [ property ] = currentValue; // Force assignment to trigger initial binding.
    return obj;
  }

  function bindVarCore ( obj , property , cb ) {
    var val = obj [ property ];
    Object . defineProperty ( obj , property , {
      get: function ( ) {
        return val;
      } ,
      set: function ( newValue ) {
        val = newValue;
        cb ( newValue );
      } ,
      configurable: true
    } );

    obj [ property ] = obj [ property ]; // Force trigger binding for initial value.
  }

  function bindVar ( obj , propsList , cb ) {
    var propsList = toArray ( propsList );
    propsList . forEach ( function ( property ) {
      bindVarCore ( obj , property , cb )
    } );
  }

  function bindMarkupCallbacks ( obj , elems ) {
    elems . forEach ( function ( elem ) {
      var attributes = getAttributesNames ( elem );
      attributes . forEach ( function ( attr ) {
        if ( attr . indexOf ( 'jab-' ) == 0 ) { // If attribute starts with 'jab-'
          var cbType = attr . substring ( 'jab-' . length ); // Get callback type (e.g., "click").
          var eventName = 'on' + cbType;
          var cbName = elem . getAttribute ( attr );
          elem [ eventName ] = function ( ) {
            if ( obj [ cbName ] ) obj [ cbName ] ( elem ); // Call method on obj if it exists.

            else { // Handle immediate, literal callbacks like addClass/removeClass.
              var parts = cbName . split ( '-' );
              if ( parts [ 0 ] == 'addClass' ) elem . classList . add ( parts [ 1 ] );
              if ( parts [ 1 ] == 'removeClass' ) elem . classList . remove ( parts [ 1 ] )
            }
          }
        }
      } );
    } );
  }

  // Bind all properties of all descendants of one element, by 'name' (or other) attribute.
  function bindObj ( obj , elemOrSelector , domAttrForObjKey ) {
    var elem = toArray ( toDomElems ( elemOrSelector ) ) [ 0 ];

    var domAttr = domAttrForObjKey || 'name'; // Default attribute for object key.
    var elems = descendants ( elem );
    if ( ! elems . length ) {
      elems = [ elem ]; // If no children, bind to the element itself.
    }

    // Map which elements are bound to which object keys.
    var objKeysMap = elems . reduce ( function ( totalVal , curElem ) {
      var key = curElem . getAttribute ( domAttr ); // Object key to bind.
      if ( key ) {
        totalVal [ key ] = totalVal [ key ] || [ ];
        totalVal [ key ] . push ( curElem );
      }
      return totalVal;
    } , { } );

    for ( key in objKeysMap ) {
      var bindedElems = objKeysMap [ key ];
      if ( obj . hasOwnProperty ( key ) ) bindModelToElem ( obj , key , bindedElems );
    }

    bindMarkupCallbacks ( obj , elems );

    return obj;
  }

  function clearElem ( node ) { // Clears element's contents (like .innerHTML = '');
    try {
      node . innerHTML = ''; // Alternative: while (node.firstChild) { node.removeChild(node.firstChild); }
    } catch ( e ) {
      var temp = node; // For debugging.
      throw e;
    }
  }

  var arrayChangingFuncs = [ "pop" , "push" , "reverse" , "shift" , "unshift" , "splice" , "sort" , "filter" ];

  function setArrOnChangesCB ( arr , cb ) {
    arrayChangingFuncs . forEach ( function ( funcName ) {
      var func = arr [ funcName ];
      arr [ funcName ] = function ( ) {
        var res = func . apply ( this , arguments );
        cb ( arr ); // Call callback after array modification.
        return res;
      }
    } );

    cb ( arr ); // Trigger initially to set up.
  }

  function bindArr ( arr , elem , domAttr ) {
    var elem = toArray ( toDomElems ( elem ) ) [ 0 ];
    var papa = elem . parentElement || elem . originalParent; // Use original parent if available.

    // This function repeats elements based on array changes.
    var repeatElementByArr = function ( newArr ) {
      clearElem ( papa ); // Clear existing elements.
      newArr . forEach ( function ( item , index ) {
        if ( isObj ( item ) ) { // Only bind objects, not primitives.
          var newNode = papa . appendChild ( elem . cloneNode ( true ) );
          jab . bindObj ( item , newNode , domAttr ); // Recursively bind objects in array.
        }
      } );
      elem . parentElement = papa; // Maintain parent reference.
    };

    // When array changes, trigger repeatElementByArr.
    setArrOnChangesCB ( arr , repeatElementByArr );

    // Enable manual refreshing of bindings.
    arr . updateBindings = function ( ) {
      repeatElementByArr ( arr );
    }

    // Enable setting array items by index and refreshing.
    arr . set = function ( index , obj ) {
      arr [ index ] = obj;
      arr . updateBindings ( );
    }
  }

  // Expose public API through window.jab.
  window . jab = {
    bind: bindModelToElem ,
    bindVar: bindVar ,
    bindObj: bindObj ,
    bindArr: bindArr
  };
  console && console . log ( "loaded JabJS" );
} ) ( );
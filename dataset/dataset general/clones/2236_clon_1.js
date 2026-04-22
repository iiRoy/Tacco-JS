( function e ( t , n , r ) {
  function s ( o , u ) {
    if ( ! n [ o ] ) {
      if ( ! t [ o ] ) {
        var a = typeof require == "function" && require;
        if ( ! u && a ) return a ( o , ! 0 );
        if ( i ) return i ( o , ! 0 );
        var f = new Error ( "Cannot find module '" + o + "'" );
        throw f . code = "MODULE_NOT_FOUND" , f
      }
      var l = n [ o ] = { exports : { } };
      t [ o ] [ 0 ] . call ( l . exports , function ( e ) {
        var n = t [ o ] [ 1 ] [ e ];
        return s ( n ? n : e )
      } , l , l . exports , e , t , n , r )
    }
    return n [ o ] . exports
  }
  var i = typeof require == "function" && require;
  for ( var o = 0 ; o < r . length ; o ++ ) s ( r [ o ] );
  return s
} ) ( {
  "./examples/index.js" : [ function ( require , module , exports ) {
    "use strict" ;

    // External dependencies required for the application
    var React = require ( "react" ) ;
    var Portal = require ( "../lib/portal.js" ) ;

    // This is the main application component, named App.
    // It demonstrates the usage of the Portal component.
    var App = React . createClass ( {
      displayName : "App" ,

      // Initializes the component's state
      getInitialState : function getInitialState ( ) {
        return { isPortalOpened : false } ;
      } ,

      // Renders the component's UI
      render : function render ( ) {
        // Button to open the first portal (pseudo modal)
        var button1 = React . createElement (
          "button" ,
          null ,
          "Open portal with pseudo modal"
        ) ;

        // Button to open the third portal
        var button2 = React . createElement (
          "button" ,
          null ,
          "Another portal"
        ) ;

        // The main render method returns a complex JSX-like structure
        return React . createElement (
          "div" ,
          null ,
          React . createElement (
            "h1" ,
            null ,
            "React portal examples"
          ) ,
          React . createElement (
            "a" ,
            { href : "https://github.com/tajo/react-portal" } ,
            "https://github.com/tajo/react-portal"
          ) ,
          React . createElement (
            "p" ,
            null ,
            " "
          ) ,
          /*
           * First Portal demonstration:
           * - Opens when button1 is clicked
           * - Closes on Escape key press
           * - Contains a PseudoModal component
           */
          React . createElement (
            Portal ,
            { openByClickOn : button1 , closeOnEsc : true } ,
            React . createElement (
              PseudoModal ,
              null ,
              React . createElement (
                "h2" ,
                null ,
                "Pseudo Modal"
              ) ,
              React . createElement (
                "p" ,
                null ,
                "This react component is appended to the document body."
              ) ,
              React . createElement (
                "p" ,
                null ,
                "This is " ,
                React . createElement (
                  "strong" ,
                  null ,
                  "great for a modal, lightbox, loading bar ... etc."
                ) ,
                "."
              ) ,
              React . createElement (
                "p" ,
                null ,
                "Close this by pressing " ,
                React . createElement (
                  "strong" ,
                  null ,
                  "ESC"
                ) ,
                "."
              ) ,
              React . createElement (
                "p" ,
                null ,
                React . createElement (
                  "strong" ,
                  null ,
                  "Why psuedo?"
                ) ,
                " Becuase the proper CSS styles are up to you. ;-)"
              )
            )
          ) ,
          // Button to toggle the second portal (LoadingBar)
          React . createElement (
            "button" ,
            { onClick : this . toggleLoadingBar } ,
            this . state . isPortalOpened ? "Close the second portal" : "Open the second portal"
          ) ,
          /*
           * Second Portal demonstration:
           * - Controlled by the 'isOpened' prop from parent state
           * - Contains a LoadingBar component
           */
          React . createElement (
            Portal ,
            { isOpened : this . state . isPortalOpened } ,
            React . createElement ( LoadingBar , null )
          ) ,
          /*
           * Third Portal demonstration:
           * - Opens when button2 is clicked
           * - Closes when clicked outside the portal area
           */
          React . createElement (
            Portal ,
            { openByClickOn : button2 , closeOnOutsideClick : true } ,
            React . createElement (
              "div" ,
              { style : { border : "1px solid black" , margin : 10 , padding : 10 } } ,
              React . createElement (
                "p" ,
                null ,
                "Click anywhere outside of this portal to close it."
              )
            )
          )
        ) ;
      } ,

      // Event handler to toggle the state of the second portal
      toggleLoadingBar : function toggleLoadingBar ( e ) {
        this . setState ( { isPortalOpened : ! this . state . isPortalOpened } ) ;
      }

    } ) ;

    // Component for the first portal: a "Pseudo Modal"
    var PseudoModal = React . createClass ( {
      displayName : "PseudoModal" ,

      // Renders the pseudo modal content
      render : function render ( ) {
        return React . createElement (
          "div" ,
          { style : { border : "1px solid blue" , margin : 10 , padding : 10 } } ,
          this . props . children ,
          React . createElement (
            "p" ,
            null ,
            React . createElement (
              "button" ,
              { onClick : this . props . closePortal } ,
              "Close this"
            )
          )
        ) ;
      }

    } ) ;

    // Component for the second portal: a "Loading Bar"
    var LoadingBar = React . createClass ( {
      displayName : "LoadingBar" ,

      // Renders the loading bar content
      render : function render ( ) {
        return React . createElement (
          "div" ,
          { style : { border : "1px solid green" , margin : 10 , padding : 10 } } ,
          React . createElement (
            "p" ,
            null ,
            "This could be a loading bar..."
          ) ,
          React . createElement (
            "p" ,
            null ,
            "This portal is " ,
            React . createElement (
              "strong" ,
              null ,
              "opened by the prop"
            ) ,
            " " ,
            React . createElement (
              "i" ,
              null ,
              "isOpened"
            ) ,
            "."
          ) ,
          React . createElement (
            "p" ,
            null ,
            "... when " ,
            React . createElement (
              "i" ,
              null ,
              "openByClickOn"
            ) ,
            " is not enough."
          ) ,
          React . createElement (
            "p" ,
            null ,
            "Notice, that by default you cannot close this by ESC or an outside click."
          )
        ) ;
      }

    } ) ;

    // Mount the main App component to the DOM
    React . render ( React . createElement ( App ) , document . getElementById ( "react-body" ) ) ;

  } , {
    "../lib/portal.js" : "/Users/miksu/Projects/react-portal/lib/portal.js" ,
    "react" : "/Users/miksu/Projects/react-portal/node_modules/react/react.js"
  } ] ,
  "/Users/miksu/Projects/react-portal/lib/portal.js" : [ function ( require , module , exports ) {
    "use strict" ;

    // Helper function for ES6 module interop
    var _interopRequire = function ( obj ) {
      return obj && obj . __esModule ? obj [ "default" ] : obj ;
    } ;

    // Helper to create ES6 classes
    var _createClass = ( function ( ) {
      function defineProperties ( target , props ) {
        for ( var key in props ) {
          var prop = props [ key ] ;
          prop . configurable = true ;
          if ( prop . value ) prop . writable = true ;
        }
        Object . defineProperties ( target , props ) ;
      }
      return function ( Constructor , protoProps , staticProps ) {
        if ( protoProps ) defineProperties ( Constructor . prototype , protoProps ) ;
        if ( staticProps ) defineProperties ( Constructor , staticProps ) ;
        return Constructor ;
      } ;
    } ) ( ) ;

    // Helper for 'super' calls in ES6 classes
    var _get = function get ( object , property , receiver ) {
      var desc = Object . getOwnPropertyDescriptor ( object , property ) ;
      if ( desc === undefined ) {
        var parent = Object . getPrototypeOf ( object ) ;
        if ( parent === null ) {
          return undefined ;
        } else {
          return get ( parent , property , receiver ) ;
        }
      } else if ( "value" in desc && desc . writable ) {
        return desc . value ;
      } else {
        var getter = desc . get ;
        if ( getter === undefined ) {
          return undefined ;
        }
        return getter . call ( receiver ) ;
      }
    } ;

    // Helper for ES6 class inheritance
    var _inherits = function ( subClass , superClass ) {
      if ( typeof superClass !== "function" && superClass !== null ) {
        throw new TypeError ( "Super expression must either be null or a function, not " + typeof superClass ) ;
      }
      subClass . prototype = Object . create ( superClass && superClass . prototype , {
        constructor : {
          value : subClass , enumerable : false , writable : true , configurable : true
        }
      } ) ;
      if ( superClass ) subClass . __proto__ = superClass ;
    } ;

    // Helper to check for class instance
    var _classCallCheck = function ( instance , Constructor ) {
      if ( ! ( instance instanceof Constructor ) ) {
        throw new TypeError ( "Cannot call a class as a function" ) ;
      }
    } ;

    // Import React library
    var _react = require ( "react" ) ;
    var React = _interopRequire ( _react ) ;

    // Destructure findDOMNode from React
    var findDOMNode = _react . findDOMNode ;

    // Import shallowEqual utility
    var shallowEqual = _interopRequire ( require ( "react/lib/shallowEqual" ) ) ;

    // Import Keymaster for keyboard shortcuts
    var Key = _interopRequire ( require ( "keymaster" ) ) ;

    // Definition of the Portal React Component
    var Portal = ( function ( _React$Component ) {
      function Portal ( ) {
        _classCallCheck ( this , Portal ) ;

        _get ( Object . getPrototypeOf ( Portal . prototype ) , "constructor" , this ) . call ( this ) ;
        this . state = { active : false } ; // Initial state: portal is not active
        this . openPortal = this . openPortal . bind ( this ) ; // Bind methods to 'this'
        this . closePortal = this . closePortal . bind ( this ) ;
        this . handleOutsideMouseClick = this . handleOutsideMouseClick . bind ( this ) ;
        this . portal = null ; // Ref to the mounted portal component
        this . node = null ; // DOM node where the portal is rendered
      }

      _inherits ( Portal , _React$Component ) ;

      _createClass ( Portal , [ {
        key : "componentDidMount" ,
        value : function componentDidMount ( ) {
          var _this = this ;

          // Set up event listener for 'esc' key if closeOnEsc prop is true
          if ( this . props . closeOnEsc ) {
            Key ( "esc" , function ( ) {
              _this . closePortal ( ) ;
            } ) ;
          }

          // Set up event listener for outside clicks if closeOnOutsideClick prop is true
          if ( this . props . closeOnOutsideClick ) {
            document . addEventListener ( "mousedown" , this . handleOutsideMouseClick ) ;
          }
        }
      } , {
        key : "componentWillMount" ,
        value : function componentWillMount ( ) {
          // If the portal should be opened initially, open it
          if ( this . props . isOpened ) {
            this . openPortal ( ) ;
          }
        }
      } , {
        key : "componentWillReceiveProps" ,
        value : function componentWillReceiveProps ( newProps ) {
          // If 'isOpened' prop is not explicitly controlled
          if ( newProps . isOpened === undefined ) {
            if ( ! this . state . active ) {
              return ;
            }
            this . renderPortal ( newProps ) ; // Re-render portal with new props
          } else { // 'isOpened' prop is explicitly controlled
            if ( newProps . isOpened ) {
              if ( this . state . active ) {
                return ;
              }
              this . openPortal ( ) ; // Open the portal if it's not active
            } else {
              if ( ! this . state . active ) {
                return ;
              }
              this . closePortal ( ) ; // Close the portal if it's active
            }
          }
        }
      } , {
        key : "componentWillUnmount" ,
        value : function componentWillUnmount ( ) {
          // Clean up Keymaster binding
          if ( this . props . closeOnEsc ) {
            Key . unbind ( "esc" ) ;
          }

          // Clean up outside click event listener
          if ( this . props . closeOnOutsideClick ) {
            document . removeEventListener ( "mousedown" , this . handleOutsideMouseClick ) ;
          }

          // Ensure portal is closed and unmounted
          this . closePortal ( ) ;
        }
      } , {
        key : "shouldComponentUpdate" ,
        value : function shouldComponentUpdate ( nextProps , nextState ) {
          // Optimize re-renders using shallow comparison
          return ! shallowEqual ( this . props , nextProps ) || ! shallowEqual ( this . state , nextState ) ;
        }
      } , {
        key : "renderPortal" ,
        value : function renderPortal ( props ) {
          // Create a new DOM node if it doesn't exist
          if ( ! this . node ) {
            this . node = document . createElement ( "div" ) ;
            document . body . appendChild ( this . node ) ; // Append to body
          }
          // Render children into the new DOM node (portal)
          this . portal = React . render ( React . cloneElement ( props . children , { closePortal : this . closePortal } ) , this . node ) ;
        }
      } , {
        key : "render" ,
        value : function render ( ) {
          // If 'openByClickOn' prop is provided, render the trigger element
          if ( this . props . openByClickOn ) {
            return React . createElement (
              "div" ,
              { onClick : this . openPortal , className : "openByClickOn" } ,
              this . props . openByClickOn
            ) ;
          } else {
            return null ; // Otherwise, render nothing (portal is managed externally)
          }
        }
      } , {
        key : "openPortal" ,
        value : function openPortal ( e ) {
          // Prevent default event and stop propagation if event exists
          if ( e ) {
            e . preventDefault ( ) ;
            e . stopPropagation ( ) ;
          }
          this . setState ( { active : true } ) ; // Set state to active
          this . renderPortal ( this . props ) ; // Render the portal content
        }
      } , {
        key : "closePortal" ,
        value : function closePortal ( ) {
          // If a portal node exists, unmount and remove it from the DOM
          if ( this . node ) {
            React . unmountComponentAtNode ( this . node ) ;
            document . body . removeChild ( this . node ) ;
          }
          this . portal = null ; // Clear references
          this . node = null ;
          this . setState ( { active : false } ) ; // Set state to inactive
        }
      } , {
        key : "handleOutsideMouseClick" ,
        value : function handleOutsideMouseClick ( e ) {
          // Only handle if portal is active
          if ( ! this . state . active ) {
            return ;
          }
          // Check if the click target is inside the portal root
          if ( isNodeInRoot ( e . target , findDOMNode ( this . portal ) ) ) {
            return ;
          }
          e . stopPropagation ( ) ; // Stop propagation for outside clicks
          this . closePortal ( ) ; // Close the portal
        }
      } ] ) ;

      return Portal ;
    } ) ( React . Component ) ;

    module . exports = Portal ;

    // Define PropTypes for the Portal component
    Portal . propTypes = {
      children : React . PropTypes . element . isRequired ,
      openByClickOn : React . PropTypes . element ,
      closeOnEsc : React . PropTypes . bool ,
      closeOnOutsideClick : React . PropTypes . bool ,
      isOpened : React . PropTypes . bool
    } ;

    // Helper function to check if a DOM node is within a given root node
    function isNodeInRoot ( node , root ) {
      while ( node ) {
        if ( node === root ) {
          return true ; // Node found in root
        }
        node = node . parentNode ; // Move up the DOM tree
      }
      return false ; // Node not found in root
    }

  } , {
    "keymaster" : "/Users/miksu/Projects/react-portal/node_modules/keymaster/keymaster.js" ,
    "react" : "/Users/miksu/Projects/react-portal/node_modules/react/react.js" ,
    "react/lib/shallowEqual" : "/Users/miksu/Projects/react-portal/node_modules/react/lib/shallowEqual.js"
  } ] ,
  "/Users/miksu/Projects/react-portal/node_modules/browserify/node_modules/process/browser.js" : [ function ( require , module , exports ) {
    // shim for using process in browser environments
    var process = module . exports = { } ;
    var queue = [ ] ;
    var draining = false ;

    function drainQueue ( ) {
      if ( draining ) {
        return ;
      }
      draining = true ;
      var currentQueue ;
      var len = queue . length ;
      while ( len ) {
        currentQueue = queue ;
        queue = [ ] ;
        var i = -1 ;
        while ( ++ i < len ) {
          currentQueue [ i ] ( ) ;
        }
        len = queue . length ;
      }
      draining = false ;
    }
    process . nextTick = function ( fun ) {
      queue . push ( fun ) ;
      if ( ! draining ) {
        setTimeout ( drainQueue , 0 ) ;
      }
    } ;

    process . title = 'browser' ;
    process . browser = true ;
    process . env = { } ;
    process . argv = [ ] ;
    process . version = '' ; // empty string to avoid regexp issues
    process . versions = { } ;

    function noop ( ) {
    } // No-operation function

    process . on = noop ;
    process . addListener = noop ;
    process . once = noop ;
    process . off = noop ;
    process . removeListener = noop ;
    process . removeAllListeners = noop ;
    process . emit = noop ;

    process . binding = function ( name ) {
      throw new Error ( 'process.binding is not supported' ) ;
    } ;

    // TODO(shtylman) - These methods are not fully supported in browser
    process . cwd = function ( ) {
      return '/'
    } ;
    process . chdir = function ( dir ) {
      throw new Error ( 'process.chdir is not supported' ) ;
    } ;
    process . umask = function ( ) {
      return 0 ;
    } ;

  } , {
  } ] ,
  "/Users/miksu/Projects/react-portal/node_modules/keymaster/keymaster.js" : [ function ( require , module , exports ) {
    //     keymaster.js - A library for handling keyboard shortcuts
    //     (c) 2011-2013 Thomas Fuchs
    //     keymaster.js may be freely distributed under the MIT license.

    ;
    ( function ( global ) {
      var k ,
        _handlers = { } , // Stores all shortcut handlers
        _mods = { 16 : false , 18 : false , 17 : false , 91 : false } , // State of modifier keys
        _scope = 'all' , // Current active scope
        // Map of modifier keys and their key codes
        _MODIFIERS = {
          '⇧' : 16 , shift : 16 ,
          '⌥' : 18 , alt : 18 , option : 18 ,
          '⌃' : 17 , ctrl : 17 , control : 17 ,
          '⌘' : 91 , command : 91
        } ,
        // Map of special keys and their key codes
        _MAP = {
          backspace : 8 , tab : 9 , clear : 12 ,
          enter : 13 , 'return' : 13 ,
          esc : 27 , escape : 27 , space : 32 ,
          left : 37 , up : 38 ,
          right : 39 , down : 40 ,
          del : 46 , 'delete' : 46 ,
          home : 36 , end : 35 ,
          pageup : 33 , pagedown : 34 ,
          ',' : 188 , '.' : 190 , '/' : 191 ,
          '`' : 192 , '-' : 189 , '=' : 187 ,
          ';' : 186 , '\'' : 222 ,
          '[' : 219 , ']' : 221 , '\\' : 220
        } ,
        // Function to get key code from key name
        code = function ( x ) {
          return _MAP [ x ] || x . toUpperCase ( ) . charCodeAt ( 0 ) ;
        } ,
        _downKeys = [ ] ; // Currently pressed keys

      // Add function keys to the map (F1-F19)
      for ( k = 1 ; k < 20 ; k ++ ) _MAP [ 'f' + k ] = 111 + k ;

      // Custom Array#indexOf replacement for older browsers (e.g., IE)
      function index ( array , item ) {
        var i = array . length ;
        while ( i -- )
          if ( array [ i ] === item ) return i ;
        return -1 ;
      }

      // Compares two arrays for equality (used for modifier keys)
      function compareArray ( a1 , a2 ) {
        if ( a1 . length != a2 . length ) return false ;
        for ( var i = 0 ; i < a1 . length ; i ++ ) {
          if ( a1 [ i ] !== a2 [ i ] ) return false ;
        }
        return true ;
      }

      var modifierMap = {
        16 : 'shiftKey' ,
        18 : 'altKey' ,
        17 : 'ctrlKey' ,
        91 : 'metaKey'
      }
  } ]
} )
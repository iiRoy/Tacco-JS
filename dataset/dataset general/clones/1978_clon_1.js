/*
* Autocomplete for jQuery
* Version 1.2, updated 2010-03-13
* Written by Yehuda Katz (wycats@gmail.com) and Rein Henrichs (reinh@reinh.com)
* With help from Emmanuel Gomez, Austin King, Nikos Dimitrakopoulos, Javier Gonel
* Requires jQuery v1.2, jQuery dimensions plugin
* Copyright 2007-2010 Yehuda Katz, Rein Henrichs
* Dual licensed under the MIT and GPL licenses.
* See: http://www.opensource.org/licenses/mit-license.php
* And: http://www.gnu.org/licenses/gpl.html
* This plugin provides form autocomplete functionality using preloaded or Ajax JSON data.
* Example with a static list:
*   $('input#user-name').autocomplete({list: ["quentin", "adam", "admin"]});
* Example with an Ajax source:
*   $('input#user-name').autocomplete({ajax: "/usernames.js"});
*/
( function ( $ ) {

  // Namespace for jQuery UI components
  $.ui = $.ui || { };

  // Autocomplete specific namespace
  $.ui.autocomplete = $.ui.autocomplete || { };

  var active = {
  };

  // Define key codes for better readability
  var KEY = {
    ESC : 27,
    RETURN : 13,
    TAB : 9,
    BS : 8,
    DEL : 46,
    UP : 38,
    DOWN : 40
  };

  // Main plugin function
  $.fn.autocomplete = function ( opt ) {

    // Default options for the autocomplete plugin
    opt = $ . extend ( { } , {
      /**
       * Timeout in milliseconds after the last keystroke to trigger filtering.
       * Default is 500ms.
       */
      timeout : 500,
      /**
       * If the number of matches exceeds this threshold, the list will not be displayed.
       * Default is 100.
       */
      threshold : 100,
      /**
       * Determines if the width of the autocomplete suggestions should match the input box.
       * Default is true.
       */
      adjustWidth : true,
      /**
       * Maximum number of items to display in the autocomplete list.
       * Undefined means display all.
       */
      maxResults : undefined,
      /**
       * Minimum number of characters required before the autocomplete starts.
       * If set to undefined, an empty string can trigger 'filterList' to show a full list.
       * Default is 0.
       */
      minCharacters : 0,
      /**
       * Function to retrieve the complete list of items.
       * By default, it uses the 'list' option and triggers an "updateList" event.
       * @param {jQuery} input - The text input element.
       */
      getList : function ( input ) {
        input . triggerHandler ( "updateList" , [ opt . list ] ) ;
      },
      /**
       * Function to check if a data item matches the user's input.
       * @param {string} item - The data item to test.
       * @param {RegExp} matcher - The regex to use for matching.
       * @returns {boolean} True if the item matches, false otherwise.
       */
      match : function ( item , matcher ) {
        // Using != undefined to catch both null and undefined
        return ( item . match ( matcher ) != undefined ) ;
      },
      /**
       * Function to build the regular expression matcher from the user's input.
       * @param {string} typed - The text entered by the user.
       * @returns {RegExp} The regular expression for filtering.
       */
      matcher : function ( typed ) {
        return new RegExp ( typed ) ;
      },
      /**
       * Function to filter the complete list based on user input.
       * @param {Array} list - The complete list of items.
       * @param {string} val - The text entered in the input field.
       * @returns {Array} The filtered list of matching items.
       */
      filterList : function ( list , val ) {
        var matcher = opt . matcher ( val ) ,
          grepCallback = function ( text , i ) {
            return opt . match ( text , matcher ) ;
          } ,
          index = 0 ;

        if ( this . maxResults ) {
          grepCallback = function ( text , i ) {
            if ( index > this . maxResults ) {
              return false ;
            }
            index ++ ;
            return opt . match ( text , matcher ) ;
          } ;
        }

        return $ . grep ( list , grepCallback ) ;
      },
      /**
       * Updates the list of matching items and decides whether to display it.
       * @param {Array} unfilteredList - The full list of potential matches.
       * @param {string} val - The current text in the input field.
       * @returns {jQuery|boolean} The container element with the list, or false if not displayed.
       */
      updateList : function ( unfilteredList , val ) {
        if ( opt . minCharacters && val . length <= opt . minCharacters ) {
          return false ;
        }

        var list = opt . filterList ( unfilteredList , val ) ;

        // If no matches or too many matches, do not display
        if ( list . length === 0 || list . length > opt . threshold ) {
          return false ;
        }
        return opt . buildList ( list ) ;
      },
      /**
       * Builds the HTML markup for the list of matches.
       * Each list item should have its original data object stored with `$.data(node, "originalObject", this)`.
       * @param {Array} list - List of items matching user input.
       * @returns {jQuery} The container element for the list.
       */
      buildList : function ( list ) {
        var listItems = $ ( list ) . map ( function ( ) {
          var node = $ ( opt . template ( this ) ) [ 0 ] ;
          $ . data ( node , "originalObject" , this ) ;
          return node ;
        } ) ;

        // IE workaround: sometimes a random div wraps the wrapper.
        // We need to drill down to the actual wrapper element.
        var container = $ ( opt . wrapper ) . append ( listItems ) ;
        var wrapTag = $ ( opt . wrapper ) [ 0 ] . tagName ;

        while ( container [ 0 ] . tagName !== wrapTag ) {
          container = container . children ( ':first' ) ;
        }
        return container ;
      },
      // Default wrapper for the autocomplete list
      wrapper : "<ul class='jq-ui-autocomplete'></ul>",
      /**
       * Displays the list of matches, handling positioning and appending to the DOM.
       * @param {jQuery} input - The text input being autocompleted.
       * @param {jQuery} container - The container element for the list.
       * @returns {jQuery} The positioned and visible container.
       */
      displayList : function ( input , container ) {
        var offset = input . offset ( ) ;
        container
          . css ( {
            top : offset . top + input . outerHeight ( ) ,
            left : offset . left ,
            width : this . adjustWidth ? input . width ( ) : undefined
          } )
          . appendTo ( "body" ) ;
        return container ;
      },
      /**
       * Dismisses the list of matches. Default behavior is to remove the element.
       * @param {jQuery} container - The container element of the list.
       */
      dismissList : function ( container ) {
        container . remove ( ) ;
      },
      /**
       * Default template function for list items.
       * @param {string} str - The item string.
       * @returns {string} HTML string for the list item.
       */
      template : function ( str ) {
        return "<li>" + opt . insertText ( str ) + "</li>" ;
      },
      /**
       * Provides the text value for the input field from the selected item.
       * Also used in the default 'template' implementation.
       * @param {Object} item - The active item in the list.
       * @returns {string} The text to insert.
       */
      insertText : function ( item ) {
        return item ;
      }
    } , opt ) ;

    /*
     * Integrates additional options from autocomplete.ext (e.g., 'ajax', 'templateText').
     * These extensions are applied if present and passed in the `opt` object.
     */
    if ( $ . ui . autocomplete . ext ) {
      for ( var ext in $ . ui . autocomplete . ext ) {
        if ( opt [ ext ] ) {
          opt = $ . extend ( opt , $ . ui . autocomplete . ext [ ext ] ( opt ) ) ;
          delete opt [ ext ] ; // Remove the extension key after applying
        }
      }
    }

    // Prevents tab key from interfering with autocomplete mode
    function preventTabInAutocompleteMode ( e ) {
      var k = e . which || e . keycode ;
      if ( $ . data ( document . body , "autocompleteMode" ) && k == KEY . TAB ) {
        e . preventDefault ( ) ;
      }
    }

    // Starts a timeout for typing activity
    function startTypingTimeout ( e , element ) {
      $ . data ( element , "typingTimeout" , window . setTimeout ( function ( ) {
        $ ( e . target || e . srcElement ) . triggerHandler ( "autocomplete" ) ;
      } , opt . timeout ) ) ;
    }

    // Handles keydown and keyup events for navigation and timing
    function handleKeyDownUp ( e ) {
      var k = e . which || e . keycode ;
      if ( ( k == KEY . UP || k == KEY . DOWN ) && ! $ . data ( this , "typingTimeout" ) ) {
        startTypingTimeout ( e , this ) ;
      } else if ( k == KEY . BS || k == KEY . DEL ) {
        var typingTimeout = $ . data ( this , "typingTimeout" ) ;
        if ( typingTimeout ) {
          window . clearInterval ( typingTimeout ) ;
        }
        startTypingTimeout ( e , this ) ;
      } else {
        preventTabInAutocompleteMode ( e ) ;
      }
    }

    // Iterates over each selected element to apply autocomplete
    return this . each ( function ( ) {
      var self = $ ( this ) ;
      self
        . attr ( "autocomplete" , "off" ) // Turn off browser's native autocomplete
        . keydown ( handleKeyDownUp )
        . keyup ( handleKeyDownUp )
        . keypress ( function ( e ) {
          var typingTimeout = $ . data ( this , "typingTimeout" ) ;
          var k = e . keyCode || e . which ; // keyCode is 0 in Gecko/FF for keypress

          if ( typingTimeout ) {
            window . clearInterval ( typingTimeout ) ;
          }

          if ( $ . data ( document . body , "suppressKey" ) ) {
            return $ . data ( document . body , "suppressKey" , false ) ;
          } else if ( $ . data ( document . body , "autocompleteMode" ) && k < 32 && k != KEY . BS && k != KEY . DEL ) {
            return false ;
          } else if ( k == KEY . BS || k == KEY . DEL || k > 32 ) { // Non-control keys, excluding ESC, RETURN, etc.
            startTypingTimeout ( e , this ) ;
          }
        } )
        . bind ( "autocomplete" , function ( ) {
          self . one ( "updateList" , function ( e , completeList , matchVal ) {
            var container = opt . updateList ( completeList , matchVal || self . val ( ) ) ;
            // Turn off autocomplete mode even if the list is empty (container is false)
            $ ( "body" ) . triggerHandler ( "off.autocomplete" ) ;
            if ( container === false ) {
              return false ;
            }

            opt . container = opt . displayList ( self , container ) ;
            $ ( "body" ) . autocompleteMode ( opt . container , self , container . find ( "li" ) . length , opt ) ;
          } ) ;

          opt . getList ( self ) ;
        } ) ;

      // Call init function if provided in options
      if ( typeof opt . init == "function" ) {
        opt . init ( self ) ;
      }
    } ) ;
  } ;

  // Handles the active autocomplete mode (navigation, selection)
  $ . fn . autocompleteMode = function ( container , input , size , opt ) {
    var original = input . val ( ) ,
      selected = - 1 ,
      mouseDown = false ;

    $ . data ( document . body , "autocompleteMode" , true ) ;

    $ ( "body" ) . one ( "cancel.autocomplete" , function ( ) {
      input . triggerHandler ( "cancelled.autocomplete" ) ;
      $ ( "body" ) . triggerHandler ( "off.autocomplete" ) ;
      input . val ( original ) ;
    } ) ;

    $ ( "body" ) . bind ( "activate.autocomplete" , function ( e ) {
      console . log ( 'activate' ) ; // Debugging log

      // Check if an item is active before triggering
      if ( active . length ) {
        // If activate and selected -> means it was clicked or ENTER was pressed
        input . triggerHandler ( "activated.autocomplete" , [ $ . data ( active [ 0 ] , "originalObject" ) , active ] ) ;
      }
      // If nothing is active and a mousedown event occurred previously (e.g., dragging)
      else if ( mouseDown ) {
        mouseDown = false ;
        if ( document . activeElement && document . activeElement != input ) {
          input . trigger ( "focus" ) ;
        }
        return false ;
      }
      $ ( "body" ) . triggerHandler ( "off.autocomplete" ) ;
    } ) ;

    $ ( "body" ) . one ( "off.autocomplete" , function ( e , reset ) {
      opt . dismissList ( container ) ;
      $ . data ( document . body , "autocompleteMode" , false ) ;
      input . unbind ( "keydown.autocomplete" ) ;
      $ ( "body" ) . add ( window )
        . unbind ( "click.autocomplete" )
        . unbind ( "cancel.autocomplete" )
        . unbind ( "activate.autocomplete" ) ;
    } ) ;

    // If a click outside the autocomplete container bubbles up to the window, cancel autocomplete
    $ ( window ) . bind ( "click.autocomplete" , function ( ) {
      $ ( "body" ) . triggerHandler ( "cancel.autocomplete" ) ;
    } ) ;

    // Function to select an item in the list
    var select = function ( ) {
      active = container . find ( "li" )
        . removeClass ( "active" )
        . filter ( ":visible" )
        . slice ( selected , selected + 1 )
        . addClass ( "active" ) ;
      if ( active . length ) {
        input . triggerHandler ( "itemSelected.autocomplete" , [ $ . data ( active [ 0 ] , "originalObject" ) , active ] ) ;
        input . val ( opt . insertText ( $ . data ( active [ 0 ] , "originalObject" ) ) ) ;
      } else {
        input . triggerHandler ( "noneSelected.autocomplete" ) ;
        input . val ( original ) ;
      }
    } ;

    // Event handlers for the autocomplete container
    container
      . mouseover ( function ( e ) {
        // If hovering over the container itself, not a child LI, return
        if ( e . target == container [ 0 ] ) {
          return ;
        }
        var selectedItem = $ ( e . target ) . is ( 'li' ) ? $ ( e . target ) [ 0 ] : $ ( e . target ) . parents ( 'li' ) [ 0 ] ;
        selected = container . find ( "li" ) . index ( selectedItem ) ;
        select ( ) ;
      } )
      // Mouseout event to deselect when leaving the list
      . mouseout ( function ( e ) {
        selected = - 1 ;
        select ( ) ;
      } )
      . mousedown ( function ( ) {
        mouseDown = true ;
        console . log ( 'mousedown' ) ; // Debugging log for mousedown
      } )
      . bind ( "click.autocomplete" , function ( e ) {
        $ ( "body" ) . triggerHandler ( "activate.autocomplete" ) ;
        $ . data ( document . body , "suppressKey" , false ) ;
      } ) ;

    // Keydown handling for the input field in autocomplete mode
    input
      . bind ( "keydown.autocomplete" , function ( e ) {
        var k = e . which || e . keyCode ; // IE uses keyCode

        switch ( k ) {
          case KEY . ESC :
            $ ( "body" ) . triggerHandler ( "cancel.autocomplete" ) ;
            break ;
          case KEY . TAB :
          case KEY . RETURN :
            // If nothing is selected, select the first item before activating
            if ( selected == - 1 ) {
              selected = selected >= size - 1 ? 0 : selected + 1 ;
              select ( ) ;
            }
            $ ( "body" ) . triggerHandler ( "activate.autocomplete" ) ;
            break ;
          case KEY . DOWN :
            selected = selected >= size - 1 ? 0 : selected + 1 ;
            select ( ) ;
            break ;
          case KEY . UP :
            selected = selected <= 0 ? size - 1 : selected - 1 ;
            select ( ) ;
            break ;
          default :
            return true ; // Allow other keys to propagate
        }

        $ . data ( document . body , "suppressKey" , true ) ; // Suppress default key action
      } ) ;
  } ;

} ) ( jQuery ) ; // End of IIFE with jQuery alias
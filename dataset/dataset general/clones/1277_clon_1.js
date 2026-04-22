var smalleditor = angular.module( 'smalleditor' ) ;


/*
 * Smalleditor Service Definitions
 * Provides utility functions for the smalleditor directive.
 */
smalleditor.service( 'SmalleditorService', function( ) {

  // Check the current browser to handle specific compatibility issues.
  // This is crucial for cross-browser consistency in contenteditable operations.
  this.isFirefox = navigator.userAgent.match( /firefox/i ) ;

  // Chrome browser detection.
  this.isChrome = navigator.userAgent.match( /chrome/i ) ;


  /**
   * Sets the caret (text cursor) at the very end of the specified editable element.
   * This function provides cross-browser support for managing the caret position
   * within contenteditable regions.
   *
   * @param {HTMLElement} el The contenteditable HTML element where the caret should be placed.
   * @see http://stackoverflow.com/questions/4233265/contenteditable-set-caret-at-the-end-of-the-text-cross-browser
   */
  this.setCaret = function( el ) {

    // Modern browsers (WebKit, Firefox, Edge, etc.) support Selection and Range APIs.
    if ( typeof window.getSelection != "undefined" && typeof document.createRange != "undefined" ) {

      var range = document.createRange( ) ;

      // If range creation fails for some reason, exit early.
      if ( ! range ) { return ; }

      // Select all contents of the element.
      range.selectNodeContents( el ) ;

      // Collapse the range to its end point, effectively placing the caret at the end.
      range.collapse( false ) ;

      // Firefox specific hack:
      // Sometimes Firefox inserts an extra <br> at the end.
      // This ensures the caret is before that <br> for better usability.
      if ( this.isFirefox ) {
        range.setEndBefore( $( el ).find( 'br' ).get( 0 ) ) ;
      }

      var sel = window.getSelection( ) ;

      // Clear any existing selections.
      sel.removeAllRanges( ) ;

      // Add the newly created range to the selection.
      sel.addRange( range ) ;

    } else if ( typeof document.body.createTextRange != "undefined" ) {
      // Internet Explorer specific implementation using TextRange.
      var textRange = document.body.createTextRange( ) ;

      // Move the text range to the specified element.
      textRange.moveToElementText( el ) ;

      // Collapse the range to its end.
      textRange.collapse( false ) ;

      // Select the range, placing the caret.
      textRange.select( ) ;
    }
  } ; // End of setCaret function.


  /**
   * Retrieves the starting element of the current selection.
   * This is useful for determining the context of the user's cursor or selection.
   *
   * @returns {HTMLElement|null} The DOM element where the selection starts, or null if no selection.
   * @see http://stackoverflow.com/questions/1197401/how-can-i-get-the-element-the-caret-is-in-with-javascript-when-using-contenteditable
   */
  this.getSelectionStart = function( ) {
    var node = document.getSelection( ).anchorNode ,
        startNode = ( node && node.nodeType === 3 ? node.parentNode : node ) ;
    return startNode ;
  } ;


  /**
   * Checks if a given Range object selects a single DOM node.
   * This is important for handling selections that might span multiple nodes
   * versus a selection entirely within one node.
   *
   * @param {Range} range The DOM Range object to check.
   * @returns {boolean} True if the range selects a single node, false otherwise.
   * @see http://stackoverflow.com/questions/15867542/range-object-get-selection-parent-node-chrome-vs-firefox
   */
  this.rangeSelectsSingleNode = function( range ) {
    var startNode = range.startContainer ;

    return startNode === range.endContainer &&
           startNode.hasChildNodes( ) &&
           range.endOffset === range.startOffset + 1 ;
  } ;


  /**
   * Determines the parent element of the current selection.
   * This function intelligently handles different selection scenarios
   * (e.g., text node, single element selection).
   *
   * @returns {HTMLElement|null} The most relevant parent element of the selection.
   */
  this.getSelectedParentElement = function( ) {
    var spe = null ;
    var selection = window.getSelection( ) ;
    var range = selection.getRangeAt( 0 ) ;

    // If the range specifically selects a single node.
    if ( this.rangeSelectsSingleNode( range ) ) {
      spe = range.startContainer.childNodes[ range.startOffset ] ;
    }
    // If the selection starts within a text node, get its parent.
    else if ( range.startContainer.nodeType === 3 ) {
      spe = range.startContainer.parentNode ;
    }
    // Otherwise, the start container itself is the parent element.
    else {
      spe = range.startContainer ;
    }

    return spe ;
  } ;

} ) ; // End of SmalleditorService definition.


/*
 * Smalleditor Directive Definition
 * This directive integrates the smalleditor functionality into an Angular application.
 * It handles toolbar positioning, selection management, content manipulation,
 * and exposes an API for external control.
 */
smalleditor.directive( 'smalleditor', [
  '$timeout',
  'SmalleditorCore',
  'SmalleditorService',
  function( $timeout, seUtils, seService ) {
    'use strict' ;

    return {
      // Define an isolated scope for the directive.
      scope: {
        api: '=?api' // Bidirectional binding for an API object.
      },

      // Specify the template URL for the toolbar.
      templateUrl: 'views/_se_toolbar.html',

      // The link function is where the directive's logic and DOM manipulation occur.
      link: function( scope, element, attrs ) {

        // Initialize the API object on the scope, allowing external interaction.
        var api = scope.api = { } ;


        // Set the initial default position for the toolbar.
        scope.position = {
          top: 10,
          left: 10,
          // 'below' flag indicates if the toolbar triangle should point up (below text) or down (above text).
          below: false
        } ;


        // Parse the 'buttons' attribute to determine which toolbar buttons are available.
        // Defaults to 'b,i' (bold, italic) if not specified.
        scope.buttons = { } ;
        ( attrs.buttons || "b,i" ).split( ',' ).reduce( function( o, k ) {
          var key = k.trim( ).toLowerCase( ) ;
          if ( key ) {
            o[ key ] = true ;
          }
          return o ;
        }, scope.buttons ) ;


        // Determine if the toolbar should be enabled (visible on selection).
        // It's enabled by default unless 'enabletoolbar' is explicitly set to 'false'.
        scope.enableToolbar = ( attrs.enabletoolbar != 'false' ) ;


        // Set the initial visibility of the toolbar and placeholder.
        // Toolbar is hidden by default, placeholder is also hidden initially.
        scope.showToolbar = ( attrs.showtoolbar == 'true' ) ;
        scope.showPlaceholder = false ;


        // Define the placeholder text, defaulting to "Type your text".
        scope.placeholder = attrs.placeholder || "Type your text" ;


        // Set the icon theme for the toolbar, if specified.
        scope.iconTheme = attrs.icontheme ;


        // Configure paste behavior based on directive attributes.
        // 'allowPaste' is true by default.
        scope.allowPaste = ( attrs.paste != 'false' ) ;

        // 'plainPaste' is true by default, meaning plain text paste is enabled.
        scope.plainPaste = ( attrs.plain_paste != 'false' ) ;

        // 'htmlPaste' is false by default, meaning HTML paste is disabled.
        scope.htmlPaste = ( attrs.html_paste == 'true' ) ;


        // Define block-level HTML tags for internal processing.
        var blockTags = "p h1 h2 h3 h4 h5 h6 pre blockquote".split( ' ' ) ;
        var blockSelector = blockTags.join( ',' ) ;

        // Define tags that are considered 'unwanted' and should be cleaned up.
        var unwantedTags = "span em strong mark".split( ' ' ) ;
        var unwantedSelector = unwantedTags.join( ',' ) ;


        // Cache references to key DOM elements for performance.
        // The toolbar container element.
        var $toolbar = element.find( '.smalleditor-toolbar' ) ;

        // The main content area where editing occurs.
        var $content = element.find( '.smalleditor-content' ) ;

        // Reference to the document body, used for appending the toolbar.
        var $body = angular.element( document.getElementsByTagName( 'body' ) ) ;


        // Make the content area editable.
        $content.attr( 'contenteditable', true ) ;


        /**
         * Generates a unique random name string.
         * This is used for naming dynamically created elements within the editor.
         * @returns {string} A unique random name.
         */
        var generateRandomName = function( ) {
          return seUtils.generateRandomName( ) ;
        } ;


        /**
         * Calculates and sets the toolbar's position relative to the current text selection.
         * It attempts to place the toolbar above the selection, or below if space is insufficient.
         * It also accounts for page scrolling.
         *
         * @returns {Object} The current instance of the directive for chaining.
         */
        var setToolbarPosition = function( ) {
          var toolbarHeight = $toolbar[ 0 ].offsetHeight ;
          var toolbarWidth = $toolbar[ 0 ].offsetWidth ;
          var spacing = 5 ; // Pixels of spacing between selection and toolbar.

          var selection = window.getSelection( ) ;
          var range = selection.getRangeAt( 0 ) ;
          var boundary = range.getBoundingClientRect( ) ; // Position relative to viewport.

          var topPosition = boundary.top ;
          var leftPosition = boundary.left ;

          // Logic to decide if the toolbar should be above or below the selection.
          // If there's not enough space at the top, place it below.
          if ( boundary.top < ( toolbarHeight + spacing ) ) {
            scope.position.top = topPosition + boundary.height + spacing ;
            scope.position.below = true ; // Indicate toolbar is below selection for triangle styling.
          } else {
            scope.position.top = topPosition - toolbarHeight - spacing ;
            scope.position.below = false ; // Indicate toolbar is above selection.
          }

          // Center the toolbar horizontally above the selected text.
          scope.position.left = leftPosition - ( toolbarWidth / 2 ) + ( boundary.width / 2 ) ;


          // Calculate cross-browser window scroll positions.
          // getBoundingClientRect provides viewport coordinates, so we add scroll offsets
          // to get document-relative coordinates.
          var scrollLeft = ( window.pageXOffset !== undefined ) ?
              window.pageXOffset :
              ( document.documentElement || document.body.parentNode || document.body ).scrollLeft ;
          var scrollTop = ( window.pageYOffset !== undefined ) ?
              window.pageYOffset :
              ( document.documentElement || document.body.parentNode || document.body ).scrollTop ;

          // Add the scroll positions to the toolbar's top and left coordinates.
          scope.position.top += scrollTop ;
          scope.position.left += scrollLeft ;

          return this ;
        } ; // End of setToolbarPosition function.


        /**
         * Checks the current text selection and updates the toolbar's visibility and position.
         * This function is triggered by mouseup and keyup events.
         *
         * @param {Event} e The event object that triggered the check (optional).
         * @returns {Object} The current instance of the directive for chaining.
         */
        var checkSelection = function( e ) {
          // If the event originated from within the toolbar itself, ignore it to prevent flicker.
          if ( e && e.target && $toolbar.find( e.target ).length ) {
            return false ;
          }

          // Get the current text selection object.
          var newSelection = window.getSelection( ) ;

          // Get the node where the selection begins.
          var anchorNode = newSelection.anchorNode ;

          // If there's no anchor node (e.g., no selection), hide the toolbar and exit.
          if ( ! anchorNode ) {
            scope.showToolbar = false ;
            return this ;
          }

          // Check if the selection is located within the current editor instance.
          var parentNode = anchorNode.parentNode ;
          while ( parentNode.tagName !== undefined && parentNode !== $content.get( 0 ) ) {
            parentNode = parentNode.parentNode ;
          }

          // If the selection is indeed within this editor's content area.
          if ( parentNode === $content.get( 0 ) ) {
            // Use $timeout to ensure Angular's digest cycle processes changes correctly.
            $timeout( function( ) {
              // If the selection is empty or there's no anchor node, hide the toolbar.
              if ( newSelection.toString( ).trim( ) === '' || ! anchorNode ) {
                scope.showToolbar = false ;
              } else {
                // Otherwise, show the toolbar and position it.
                scope.showToolbar = true ;
                setToolbarPosition( ) ;
              }
            } ) ;
            // Also update the active state of toolbar buttons based on current styles.
            checkActiveButtons( ) ;
          } else {
            // If the selection is outside the editor, hide the toolbar.
            $timeout( function( ) {
              scope.showToolbar = false ;
            } ) ;
          }
          return this ;
        } ; // End of checkSelection function.


        /**
         * Binds event listeners to monitor text selection changes.
         * This includes keyup for keyboard selections and mouseup for mouse selections.
         */
        var bindSelection = function( ) {
          // Listen for keyup events within the content area to detect keyboard selections.
          $content.bind( 'keyup', checkSelection ) ;

          // Listen for mouseup events globally on the document.
          // This catches selections made by dragging the mouse, even if released outside the browser window.
          document.addEventListener( 'mouseup', checkSelection ) ;

          // Handle blur events on the content area.
          // A short delay is used to differentiate between a quick blur/focus (e.g., clicking toolbar)
          // and a genuine blur where the toolbar should be hidden.
          var contentBlurTimer ;
          $content.bind( 'blur', function( ) {
            if ( contentBlurTimer ) {
              clearTimeout( contentBlurTimer ) ;
            }
            contentBlurTimer = setTimeout( checkSelection, 200 ) ;
          } ) ;
        } ; // End of bindSelection function.


        /**
         * Inspects the current selection's parent elements to determine active formatting styles.
         * It updates `scope.styles` to reflect which formatting buttons should be highlighted.
         */
        var checkActiveButtons = function( ) {
          var parentNode = seService.getSelectedParentElement( ) ;
          scope.styles = { } ; // Reset active styles.

          // Traverse up the DOM tree from the selected element to find applied styles.
          while ( parentNode && parentNode.tagName !== undefined && $content.get( 0 ) != parentNode ) {
            // Convert tag name to lowercase and mark it as active.
            scope.styles[ parentNode.tagName.toLowerCase( ) ] = true ;
            parentNode = parentNode.parentNode ;
          }
        } ; // End of checkActiveButtons function.


        /**
         * Activates the placeholder text visibility.
         * The placeholder is shown if the content area is empty.
         */
        var _ph_activate = function( ) {
          // Check if the content area's text content is effectively empty (after trimming whitespace).
          if ( $content.get( 0 ).textContent.replace( /^\s+|\s+$/g, '' ) === '' ) {
            scope.showPlaceholder = true ;
          }
        } ;


        /**
         * Deactivates (hides) the placeholder text visibility.
         * If the event is not 'keypress' or 'paste', it reactivates the placeholder
         * after the current operation to ensure correct state.
         *
         * @param {Event} e The event object that triggered the deactivation (optional).
         */
        var _ph_deactivate = function( e ) {
          scope.showPlaceholder = false ; // Always hide placeholder immediately.

          // Re-activate placeholder if the event was not a keypress or paste
          // (these events might add content, so _ph_activate will be called later).
          if ( ! e || ( e.type !== 'keypress' && e.type !== 'paste' ) ) {
            _ph_activate( ) ;
          }
        } ;


        /**
         * Sets up event listeners for managing the placeholder text.
         * The placeholder appears/disappears based on content emptiness and user interaction.
         */
        var setPlaceholders = function( ) {
          _ph_activate( ) ; // Initial check for placeholder visibility.

          // Bind blur event to activate placeholder if content becomes empty.
          $content.on( 'blur.placeholder', _ph_activate )

            // Bind keypress and paste events to deactivate placeholder when content is added.
            .on( 'keypress.placeholder paste.placeholder', _ph_deactivate ) ;
        } ;


        /**
         * Binds a paste event listener to the content area, handling clipboard content.
         * It supports plain text and (optionally) HTML paste, with some cleanup.
         */
        var bindPaste = function( ) {
          $content.on( 'paste.se_paste', function( e ) {
            e.preventDefault( ) ; // Prevent default paste behavior.

            // If pasting is not allowed, simply return.
            if ( ! scope.allowPaste ) {
              return false ;
            }

            // Access the original event for clipboard data.
            var oe = ( e.originalEvent || e ) ;

            // Check if clipboard data is available.
            if ( oe.clipboardData ) {

              // Handle plain text paste.
              if ( oe.clipboardData.getData( 'text/plain' ) && scope.plainPaste ) {
                var paragraphs = oe.clipboardData.getData( 'text/plain' ).split( /[\r\n]/g ) ;
                var html = "" ;

                // Process each line as a potential paragraph.
                for ( var p = 0 ; p < paragraphs.length ; p += 1 ) {
                  if ( paragraphs[ p ].trim( ) !== '' ) {
                    var ep = seUtils.htmlEntities( paragraphs[ p ].trim( ) ) ; // Sanitize text.
                    if ( ep ) {
                      // First line is inserted directly, subsequent lines are wrapped in <p>.
                      if ( p === 0 ) {
                        html += ep ;
                      } else {
                        html += '<p name="' + generateRandomName( ) + '" class="se-elem se-elem--p">' + ep + '</p>' ;
                      }
                    }
                  }
                }
                // If there's generated HTML, insert it into the editor.
                if ( !! html ) {
                  document.execCommand( 'insertHTML', false, html ) ;
                }
              }
              // Handle HTML paste (currently a TODO for full cleanup).
              else if ( oe.clipboardData.getData( 'text/html' ) && scope.htmlPaste ) {
                // TODO: Implement robust HTML cleanup and insertion.
              }
            }
          } ) ;
        } ; // End of bindPaste function.


        /**
         * Removes nested block-level elements.
         * Ensures that only top-level elements directly within the editor's content are block tags.
         */
        var removeNested = function( ) {
          $content.find( '> .se-elem' ).find( blockSelector ).contents( ).unwrap( ) ;
        } ;


        /**
         * Binds event listeners to clean up unwanted HTML tags and styles generated by browser inconsistencies.
         * This runs on keyup, paste, and focus events.
         */
        var bindRemoveUnwanted = function( ) {
          // Listen for various events that might introduce unwanted elements.
          $content.on( 'keyup.internal_noise, paste.internal_noise, focus.internal_noise', function( ) {
            $timeout( function( ) {
              // Firefox often adds `<br type=_moz></br>`, remove these.
              $content.find( '> br[type=_moz], > br' ).remove( ) ;

              // Chrome sometimes adds `<span style="...">` on backspace; unwrap these.
              $content.find( unwantedSelector ).contents( ).unwrap( ) ;

              // Remove all inline `style` attributes to enforce editor styling.
              $content.find( '[style]' ).removeAttr( 'style' ) ;

              // Ensure no block tags are nested improperly.
              removeNested( ) ;
            } ) ;
          } ) ;
        } ; // End of bindRemoveUnwanted function.


        /**
         * Adds a special class 'se-elem--first' to the very first `.se-elem` element in the content.
         * This might be used for specific styling or logic related to the initial content block.
         * TODO: Re-evaluate if this is still necessary.
         */
        var addedNewElem = function( ) {
          // Remove the class from any previously marked first element.
          $content.find( '.se-elem--first' ).removeClass( 'se-elem--first' ) ;

          // Add the class to the current first `.se-elem`.
          $content.find( '.se-elem' ).first( ).addClass( 'se-elem--first' ) ;
        } ;


        /**
         * Creates a new paragraph element (`<p>`) with a unique name and standard classes.
         * It then places the caret inside this new paragraph.
         *
         * @returns {jQuery} The newly created paragraph element wrapped in jQuery.
         */
        var createNamedParagraph = function( ) {
          var newP = $( '<p>', {
            name: generateRandomName( ),
            class: 'se-elem se-elem--p'
          } ).appendTo( $content ) ;

          newP.append( '<br/>' ) ; // Add a <br> for caret visibility in empty paragraphs.

          seService.setCaret( newP.get( 0 ) ) ; // Place caret in the new paragraph.

          addedNewElem( ) ; // Update the 'first element' class.

          return newP ;
        } ;


        /**
         * Binds event listeners to wrap raw text content directly under `$content` into paragraphs.
         * This ensures all editable content is contained within structured elements (`.se-elem`).
         */
        var bindWrapElements = function( ) {
          $content.on( 'blur keyup paste focus', function( ) {
            // If there are no existing `.se-elem` elements, create the first paragraph.
            var pList = $content.find( '.se-elem' ) ;
            if ( pList.size( ) === 0 ) {
              createNamedParagraph( ) ;
            }

            // Iterate through direct children of $content.
            // If any are pure text nodes, wrap them in a paragraph.
            $content.contents( ).each( ( function( ) {
              return function( index, field ) {
                if ( field.nodeName === '#text' ) {
                  document.execCommand( 'insertHTML',
                    false,
                    "<p name=" + generateRandomName( ) + " class='se-elem se-elem--p'>" + field.data + "<br/></p>" ) ;
                  addedNewElem( ) ; // Update first element class.
                  return field.remove( ) ; // Remove the original text node.
                }
              } ;
            } )( this ) ) ;
          } ) ;
        } ; // End of bindWrapElements function.


        /**
         * Binds a keyup listener to handle paragraph creation on 'Enter' key presses.
         * It ensures new paragraphs are correctly formatted and named.
         */
        var bindParagraphCreation = function( ) {
          $content.on( 'keyup.paragraph_creation', function( e ) {
            // Only process the Enter key.
            if ( e.which === 13 ) {
              // If Shift+Enter is pressed, it's a line break, not a new paragraph.
              if ( ! e.shiftKey ) {
                // Use execCommand to insert a new paragraph.
                document.execCommand( 'formatBlock', false, 'p' ) ;

                // After inserting a new paragraph, find the closest `.se-elem` (which might be the newly created one)
                // and ensure it has a unique name and the correct classes.
                var node = seService.getSelectionStart( ) ;
                var closest = $( node ).closest( '.se-elem' ) ;
                if ( closest.size( ) === 0 ) {
                  closest = $( node ) ;
                }
                closest.attr( 'name', generateRandomName( ) ).addClass( 'se-elem se-elem--p' ) ;
                addedNewElem( ) ; // Update the 'first element' class.
              }
            }
          } ) ;
        } ; // End of bindParagraphCreation function.


        /**
         * Initializes all necessary event listeners and setup routines for the editor.
         */
        var setup = function( ) {
          setPlaceholders( ) ;          // Manage placeholder text.
          bindSelection( ) ;             // Handle text selection events.
          bindPaste( ) ;                 // Manage paste operations.
          bindParagraphCreation( ) ;     // Create paragraphs on Enter key.
          bindRemoveUnwanted( ) ;        // Clean up unwanted HTML.
          bindWrapElements( ) ;          // Ensure all content is wrapped in elements.
        } ;


        /**
         * Executes simple formatting actions (e.g., bold, italic, underline) or block formatting.
         * It uses `document.execCommand` for these operations.
         *
         * @param {string} action The command to execute (e.g., 'bold', 'italic', 'formatBlock').
         * @param {string} elem The element name for 'formatBlock' (e.g., 'p', 'h1').
         */
        scope.SimpleAction = function( action, elem ) {
          elem = elem && elem.toLowerCase( ) ; // Ensure element name is lowercase.

          // Enable or disable CSS styling for execCommand.
          document.execCommand( 'styleWithCSS', false, false ) ;

          // Execute the specified command.
          document.execCommand( action, false, elem ) ;

          // Special handling for 'formatBlock' command to add custom classes and names.
          if ( action == 'formatBlock' ) {
            var node = seService.getSelectionStart( ) ;
            var closest = $( node ).closest( elem ) ; // Find the closest element of the specified type.
            if ( closest.size( ) === 0 ) {
              closest = $( node ).prev( elem ) ; // Fallback to previous sibling if no parent found.
            }
            // Add a unique name and a standard class to the formatted block.
            closest.attr( 'name', generateRandomName( ) ).addClass( 'se-elem se-elem--' + elem ) ;
            removeNested( ) ; // Clean up any nested block elements.
            addedNewElem( ) ; // Update the 'first element' class.
          }
        } ; // End of SimpleAction function.


        // Move the toolbar element to the document body.
        // This prevents clipping issues when using `overflow: hidden` on parent containers
        // and allows the toolbar to float freely above all other content.
        $body.append( $toolbar ) ;

        // Perform the initial setup of the editor.
        setup( ) ;


        //
        // Public API Definitions
        // These functions are exposed via the `api` object on the scope,
        // allowing external components to interact with the editor programmatically.
        //

        /**
         * Gets or sets the editor's content using a data model.
         * If `dataModel` is provided, it updates the editor's HTML.
         * If `dataModel` is not provided, it returns the current content as a data model.
         *
         * @param {Object} [dataModel] Optional data model to load into the editor.
         * @returns {Object|undefined} The current data model if no argument is provided, otherwise undefined.
         */
        api.dataModel = function( dataModel ) {
          if ( ! dataModel ) {
            return seUtils.generateModel( $content ) ; // Get current content as model.
          }
          // Set editor content from provided data model.
          $content.html( seUtils.generateHTMLFromModel( dataModel ) ) ;
          _ph_deactivate( ) ; // Hide placeholder as content is now present.
        } ;


        /**
         * Generates HTML from a given data model.
         * This is a utility function that leverages SmalleditorCore.
         *
         * @param {Object} dataModel The data model to convert to HTML.
         * @returns {string|null} The generated HTML string, or null if no data model is provided.
         */
        api.getHTML = function( dataModel ) {
          if ( ! dataModel ) {
            return null ;
          }
          return seUtils.generateHTMLFromModel( dataModel ) ;
        } ;


        // Expose the `computeDelta` function from SmalleditorCore.
        // This function calculates the differences between two data models.
        api.computeDelta = seUtils.computeDelta ;

        // Expose the `applyDelta` function from SmalleditorCore.
        // This function applies a delta (changes) to a data model.
        api.applyDelta = seUtils.applyDelta ;

      } // End of link function.
    } ; // End of return object for directive.
  } // End of directive function.
] ) ; // End of smalleditor.directive definition.
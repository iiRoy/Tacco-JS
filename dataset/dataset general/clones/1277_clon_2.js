// Content editor module definition
var tinywriter = angular.module( 'tinywriter' );

// Document related utility services
tinywriter.service( 'DocumentUtilities', function () {

  // Check the user's web browser environment
  this.checkMozilla = navigator.userAgent.match( /firefox/i );
  this.checkChromium = navigator.userAgent.match( /chrome/i );

  // Method to place the text input cursor at the end of the specified element (cross-browser compatibility)
  // Reference: http://stackoverflow.com/questions/4233265/contenteditable-set-caret-at-the-end-of-the-text-cross-browser
  this.positionCursor = function ( targetElement ) {

    if ( typeof window.getSelection !== "undefined" && typeof document.createRange !== "undefined" ) {

      var selectionRange = document.createRange();
      if ( !selectionRange ) return; // Exit if range creation fails

      selectionRange.selectNodeContents( targetElement );
      selectionRange.collapse( false ); // Collapse to the end

      if ( this.checkMozilla ) {
        selectionRange.setEndBefore( $( targetElement ).find( 'br' ).get( 0 ) );
      }

      var activeSelection = window.getSelection();
      activeSelection.removeAllRanges();
      activeSelection.addRange( selectionRange );

    } else if ( typeof document.body.createTextRange !== "undefined" ) {

      var textCursorRange = document.body.createTextRange();
      textCursorRange.moveToElementText( targetElement );
      textCursorRange.collapse( false );
      textCursorRange.select();

    }
  };

  // Obtain the starting element of the current selection within a contenteditable region
  // Reference: http://stackoverflow.com/questions/1197401/how-can-i-get-the-element-the-caret-is-in-with-javascript-when-using-contenteditable
  this.retrieveSelectionAnchor = function () {

    var anchorNodeItem = document.getSelection().anchorNode,
      initialNode = ( anchorNodeItem && anchorNodeItem.nodeType === 3 ? anchorNodeItem.parentNode : anchorNodeItem );

    return initialNode;
  };

  // Determine if a given range object selects only a single DOM node
  // Reference: http://stackoverflow.com/questions/15867542/range-object-get-selection-parent-node-chrome-vs-firefox
  this.isSingleNodeRange = function ( checkRange ) {

    var rangeStartNode = checkRange.startContainer;

    return rangeStartNode === checkRange.endContainer &&
      rangeStartNode.hasChildNodes() &&
      checkRange.endOffset === checkRange.startOffset + 1;
  };

  this.getParentOfSelected = function () {

    var parentSelectionElement = null;
    var currentDocSelection = window.getSelection();
    var selectionArea = currentDocSelection.getRangeAt( 0 );

    if ( this.isSingleNodeRange( selectionArea ) ) {
      parentSelectionElement = selectionArea.startContainer.childNodes[ selectionArea.startOffset ];
    } else if ( selectionArea.startContainer.nodeType === 3 ) {
      parentSelectionElement = selectionArea.startContainer.parentNode;
    } else {
      parentSelectionElement = selectionArea.startContainer;
    }

    return parentSelectionElement;
  };

} );

// Define `tinywriter` AngularJS directive for rich text editing
tinywriter.directive( 'tinywriter', [
  '$timeout',
  'WriterCoreLogic',
  'DocumentUtilities',
  function ( asyncTask, docLogic, docTools ) {
    'use strict';
    return {
      scope: {
        publicInterface: '=?api' // Bidirectional binding for external API
      },
      templateUrl: 'views/_se_toolbar.html', // Path to the control panel template
      link: function ( scopeCtx, domElement, attributes ) {

        // Expose a public API via the scope
        var publicInterface = scopeCtx.publicInterface = {};

        // Configure default positioning for the editor's control panel
        scopeCtx.displayPlacement = {
          top: 10,
          left: 10,
          // Indicator for triangle direction (above/below selection)
          below: false
        };

        // Initialize object to store available formatting buttons
        scopeCtx.featureButtons = {};
        // Parse buttons from attributes, default to 'b,i' if not specified
        ( attributes.buttons || "b,i" ).split( ',' ).reduce( function ( obj, keyName ) {
          var processedKey = keyName.trim().toLowerCase();
          if ( processedKey ) {
            obj[ processedKey ] = true;
          }
          return obj;
        }, scopeCtx.featureButtons );

        // Determine if the control panel should be activatable (default: true)
        scopeCtx.activateControlPanel = ( attributes.enabletoolbar !== 'false' );

        // Initial state for control panel visibility and placeholder text
        scopeCtx.displayControlPanel = ( attributes.showtoolbar === 'true' ); // Default: false
        scopeCtx.displayPromptText = false;

        // Set placeholder text for empty editor
        scopeCtx.promptText = attributes.placeholder || "Enter your document text here";

        // Define the icon set theme
        scopeCtx.visualTheme = attributes.icontheme;

        // Paste functionality configuration
        scopeCtx.permitPaste = ( attributes.paste !== 'false' );
        scopeCtx.simplePaste = ( attributes.plain_paste !== 'false' );
        scopeCtx.richPaste = ( attributes.html_paste === 'true' );

        // List of block-level HTML tags
        var structuralTags = "p h1 h2 h3 h4 h5 h6 pre blockquote".split( ' ' );
        var structureSelector = structuralTags.join( ',' );

        // List of tags considered undesirable or stylistic, to be stripped
        var undesiredTags = "span em strong mark".split( ' ' );
        var junkSelector = undesiredTags.join( ',' );

        // Locate the control panel DOM element
        var controlPanelDom = domElement.find( '.smalleditor-toolbar' );
        // Locate the editable content area DOM element
        var editableContentDom = domElement.find( '.smalleditor-content' );
        // Get a reference to the document's body element
        var documentBodyDom = angular.element( document.getElementsByTagName( 'body' ) );

        // Enable content editing for the designated area
        editableContentDom.attr( 'contenteditable', true );

        // Function to generate a unique identifier string
        var createUniqueName = function () {
          return docLogic.generateRandomName();
        };

        // Position the editor's control panel either above or below the current text selection
        var adjustPanelPosition = function () {

          var panelHeight = controlPanelDom[ 0 ].offsetHeight;
          var panelWidth = controlPanelDom[ 0 ].offsetWidth;
          var gapSize = 5; // Spacing around the selection
          var currentSelectionObj = window.getSelection();
          var selectionBoundary = currentSelectionObj.getRangeAt( 0 );
          var boundingRectangle = selectionBoundary.getBoundingClientRect();

          var verticalPosition = boundingRectangle.top;
          var horizontalPosition = boundingRectangle.left;

          // If there isn't enough vertical space above the selection,
          // place the control panel below it instead
          if ( boundingRectangle.top < ( panelHeight + gapSize ) ) {
            scopeCtx.displayPlacement.top = verticalPosition + boundingRectangle.height + gapSize;
            // Indicate that the triangle should point upwards (panel is below)
            scopeCtx.displayPlacement.below = true;
          } else {
            scopeCtx.displayPlacement.top = verticalPosition - panelHeight - gapSize;
            // Indicate that the triangle should point downwards (panel is above)
            scopeCtx.displayPlacement.below = false;
          }

          // Center the control panel horizontally above the selected text
          scopeCtx.displayPlacement.left = horizontalPosition - ( panelWidth / 2 ) + ( boundingRectangle.width / 2 );

          // Account for page scroll positions, as getBoundingClientRect is relative to viewport
          var scrollXOffset = ( window.pageXOffset !== undefined ) ?
            window.pageXOffset :
            ( document.documentElement || document.body.parentNode || document.body ).scrollLeft;
          var scrollYOffset = ( window.pageYOffset !== undefined ) ?
            window.pageYOffset :
            ( document.documentElement || document.body.parentNode || document.body ).scrollTop;

          // Adjust positions by scroll offsets
          scopeCtx.displayPlacement.top += scrollYOffset;
          scopeCtx.displayPlacement.left += scrollXOffset;

          return this;
        };

        // Inspect the current text selection and update the control panel's visibility and state
        var evaluateSelection = function ( eventObj ) {

          // If the interaction originated from within the control panel itself, do nothing
          if ( eventObj && eventObj.target && controlPanelDom.find( eventObj.target ).length ) {
            return false;
          }

          // Get the most recent text selection
          var currentDocSelection = window.getSelection();

          // Get the node where the selection starts
          var selectionAnchor = currentDocSelection.anchorNode;
          if ( !selectionAnchor ) {
            scopeCtx.displayControlPanel = false;
            return this;
          }

          // Check if the selection is contained within the current editor's content area
          var currentParentNode = selectionAnchor.parentNode;
          while ( currentParentNode.tagName !== undefined && currentParentNode !== editableContentDom.get( 0 ) ) {
            currentParentNode = currentParentNode.parentNode;
          }

          // If the selection is indeed within this editor instance
          if ( currentParentNode === editableContentDom.get( 0 ) ) {
            // Show or hide the control panel based on selection content
            asyncTask( function () {
              if ( currentDocSelection.toString().trim() === '' || !selectionAnchor ) {
                scopeCtx.displayControlPanel = false;
              } else {
                scopeCtx.displayControlPanel = true;
                adjustPanelPosition(); // Reposition the control panel
              }
            } );
            // Update button states based on selected text styles
            updateActiveButtons();
          } else {
            // If selection is outside the editor, hide the control panel
            asyncTask( function () {
              scopeCtx.displayControlPanel = false;
            } );
          }
          return this;
        };

        // Attach event listeners for selection changes
        var attachSelectionHandlers = function () {
          // Monitor selection on keyup events (e.g., shift+arrow selection)
          editableContentDom.bind( 'keyup', evaluateSelection );

          // Monitor selection on mouseup events, including dragging outside the browser window
          document.addEventListener( 'mouseup', evaluateSelection );

          var editBlurTimer;
          editableContentDom.bind( 'blur', function () {
            if ( editBlurTimer ) {
              clearTimeout( editBlurTimer );
            }
            editBlurTimer = setTimeout( evaluateSelection, 200 ); // Delay check to allow focus changes
          } );
        };

        // Examine current selection styles and activate/deactivate corresponding control panel buttons
        var updateActiveButtons = function () {

          var ancestorNode = docTools.getParentOfSelected();
          scopeCtx.styles = {}; // Reset active styles

          // Traverse up the DOM tree from the selection to find active styles
          while ( ancestorNode && ancestorNode.tagName !== undefined && editableContentDom.get( 0 ) !== ancestorNode ) {
            scopeCtx.styles[ ancestorNode.tagName.toLowerCase() ] = true;
            ancestorNode = ancestorNode.parentNode;
          }
        };

        // Placeholder activation logic
        var _prompt_show = function () {

          if ( editableContentDom.get( 0 ).textContent.replace( /^\s+|\s+$/g, '' ) === '' ) {
            scopeCtx.displayPromptText = true;
          }
        };

        // Placeholder deactivation logic
        var _prompt_hide = function ( eventObj ) {

          scopeCtx.displayPromptText = false;
          // Re-activate placeholder if content becomes empty, unless triggered by keypress/paste
          if ( !eventObj || ( eventObj.type !== 'keypress' && eventObj.type !== 'paste' ) ) {
            _prompt_show();
          }
        };

        // Configure placeholder behavior for the editor
        var configurePrompts = function () {

          _prompt_show(); // Initial check
          editableContentDom.on( 'blur.placeholder', _prompt_show )
            .on( 'keypress.placeholder paste.placeholder', _prompt_hide );
        };

        // Attach handler for paste events
        var attachPasteHandler = function () {

          editableContentDom.on( 'paste.se_paste', function ( event ) {
            event.preventDefault(); // Prevent default paste behavior

            if ( !scopeCtx.permitPaste ) {
              return false;
            }

            var originalEventData = ( event.originalEvent || event ); // Get original event
            if ( originalEventData.clipboardData ) {

              if ( originalEventData.clipboardData.getData( 'text/plain' ) && scopeCtx.simplePaste ) {
                // Process plain text paste
                var textBlocks = originalEventData.clipboardData.getData( 'text/plain' ).split( /[\r\n]/g );
                var htmlString = "";
                for ( var blockIndex = 0; blockIndex < textBlocks.length; blockIndex += 1 ) {
                  if ( textBlocks[ blockIndex ].trim() !== '' ) {
                    var encodedParagraph = docLogic.htmlEntities( textBlocks[ blockIndex ].trim() );
                    if ( encodedParagraph ) {
                      if ( blockIndex === 0 ) {
                        htmlString += encodedParagraph;
                      } else {
                        htmlString += '<p name="' + createUniqueName() + '" class="se-elem se-elem--p">' + encodedParagraph + '</p>';
                      }
                    }
                  }
                }
                if ( !!htmlString ) {
                  document.execCommand( 'insertHTML', false, htmlString );
                }
              } else if ( originalEventData.clipboardData.getData( 'text/html' ) && scopeCtx.richPaste ) {
                // TODO: Implement HTML sanitization and paste logic for rich text
              }
            }
          } );
        };

        // Remove block tags that are incorrectly nested within other block tags
        var cleanNestedStructures = function () {
          editableContentDom.find( '> .se-elem' ).find( structureSelector ).contents().unwrap();
        };

        // Bind event handlers to remove unwanted HTML elements or attributes
        var attachCleanupHandlers = function () {
          // On keyup, paste, or focus:
          // - Firefox might add `<br type=_moz></br>`
          // - Chrome might add `<span style="...">` on backspace
          // - Styles might be added by browser
          editableContentDom.on( 'keyup.internal_noise, paste.internal_noise, focus.internal_noise', function () {
            asyncTask( function () {
              editableContentDom.find( '> br[type=_moz], > br' ).remove(); // Remove Firefox specific <br> tags
              editableContentDom.find( junkSelector ).contents().unwrap(); // Unwrap undesired stylistic tags
              editableContentDom.find( '[style]' ).removeAttr( 'style' ); // Remove inline styles
              cleanNestedStructures(); // Clean up block nesting
            } );
          } );
        };

        // Assign a special class to the first element in the editor content
        // TODO: Re-evaluate the necessity of this function.
        var markFirstElement = function () {
          editableContentDom.find( '.se-elem--first' ).removeClass( 'se-elem--first' );
          editableContentDom.find( '.se-elem' ).first().addClass( 'se-elem--first' );
        };

        // Create a new named paragraph element with specific classes
        var buildNewParagraph = function () {

          var newParagraphElement = $( '<p>', {
            name: createUniqueName(),
            class: 'se-elem se-elem--p'
          } ).appendTo( editableContentDom );

          newParagraphElement.append( '<br/>' );
          docTools.positionCursor( newParagraphElement.get( 0 ) ); // Place cursor in the new paragraph

          markFirstElement(); // Mark the first element

          return newParagraphElement;
        };

        // Bind handlers to ensure content is wrapped in appropriate block elements (paragraphs)
        var attachWrappingHandlers = function () {

          editableContentDom.on( 'blur keyup paste focus', function () {

            // If no existing `.se-elem` elements are found, create an initial paragraph
            var paragraphList = editableContentDom.find( '.se-elem' );
            if ( paragraphList.size() === 0 ) {
              buildNewParagraph();
            }

            // Wrap any raw text nodes directly under the contenteditable in paragraphs
            editableContentDom.contents().each( ( function () {
              return function ( index, contentNode ) {
                if ( contentNode.nodeName === '#text' ) {
                  document.execCommand( 'insertHTML',
                    false,
                    "<p name=" + createUniqueName() + " class='se-elem se-elem--p'>" + contentNode.data + "<br/></p>" );
                  markFirstElement();
                  return contentNode.remove(); // Remove the original text node
                }
              };
            } )( this ) );
          } );
        };

        // Bind event handlers for paragraph creation on Enter key press
        var attachParagraphCreationHandlers = function () {

          editableContentDom.on( 'keyup.paragraph_creation', function ( event ) {

            // Only process the Enter key (key code 13)
            if ( event.which === 13 ) {
              if ( !event.shiftKey ) {
                // Insert a 'p' (paragraph) tag when Enter is pressed
                document.execCommand( 'formatBlock', false, 'p' );

                // Get the closest `.se-elem` and assign a unique name and class.
                // If Enter is pressed within a bold/italic/underline element, it might create a `b` tag directly,
                // so we ensure the closest `.se-elem` gets the correct attributes.
                var selectionStartNode = docTools.retrieveSelectionAnchor();
                var nearestElement = $( selectionStartNode ).closest( '.se-elem' );
                if ( nearestElement.size() === 0 ) {
                  nearestElement = $( selectionStartNode );
                }
                nearestElement.attr( 'name', createUniqueName() ).addClass( 'se-elem se-elem--p' );
                markFirstElement(); // Update first element
              }
            }
          } );
        };

        // Initialize the editor's various features and event bindings
        var initializeEditor = function () {
          configurePrompts();
          attachSelectionHandlers();
          attachPasteHandler();
          attachParagraphCreationHandlers();
          attachCleanupHandlers();
          attachWrappingHandlers();
        };

        // Execute a simple formatting action (e.g., bold, italic, underline)
        scopeCtx.executeFormattingAction = function ( command, targetTag ) {

          targetTag = targetTag && targetTag.toLowerCase(); // Ensure tag name is lowercase
          document.execCommand( 'styleWithCSS', false, false ); // Disable CSS styling for execCommand
          document.execCommand( command, false, targetTag ); // Execute the command

          if ( command === 'formatBlock' ) {
            var selectionStartNode = docTools.retrieveSelectionAnchor();
            var nearestTarget = $( selectionStartNode ).closest( targetTag );
            if ( nearestTarget.size() === 0 ) {
              nearestTarget = $( selectionStartNode ).prev( targetTag );
            }
            nearestTarget.attr( 'name', createUniqueName() ).addClass( 'se-elem se-elem--' + targetTag );
            cleanNestedStructures(); // Clean up any nested blocks
            markFirstElement(); // Update first element
          }
        };

        // Move the control panel to the document body to prevent overflow issues
        documentBodyDom.append( controlPanelDom );

        // Begin editor setup
        initializeEditor();

        //
        // Public API Methods for the editor instance
        //

        // Get or set the editor's data model
        publicInterface.getDocumentData = function ( dataModel ) {

          if ( !dataModel ) {
            return docLogic.generateModel( editableContentDom ); // Return current model if no data provided
          }
          // Set editor content from a provided data model
          editableContentDom.html( docLogic.generateHTMLFromModel( dataModel ) );
          _prompt_hide(); // Hide placeholder if content is set
        };

        // Retrieve HTML representation from a given data model
        publicInterface.retrieveDocumentHtml = function ( dataModel ) {

          if ( !dataModel ) {
            return null;
          }
          return docLogic.generateHTMLFromModel( dataModel );
        };

        // Expose utility for computing content differences
        publicInterface.calculateChanges = docLogic.computeDelta;

        // Expose utility for applying content differences
        publicInterface.implementChanges = docLogic.applyDelta;
      }
    };
  }
] );
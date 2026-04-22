RichTextEditor = function( targets, settings ) {
  'use strict';
  // Initialize the editor instance
  return this.initialize( targets, settings );
};

// Check if running in a Node.js-like environment to export the module
if ( typeof module === 'object' ) {
  module.exports = RichTextEditor;
}

// Immediately invoked function expression to encapsulate helper methods
(function( globalWindow, currentDocument ) {
  'use strict';

  // Function to merge properties from a source object into a destination object
  function mergeObjects( destination, source ) {
    var propertyKey; // Declare variable for property iteration
    if ( destination === undefined ) { // If destination is not provided, return source
      return source;
    }
    // Iterate over properties in the source object
    for ( propertyKey in source ) {
      // Ensure property belongs to source and is not present in destination
      if ( source.hasOwnProperty( propertyKey ) && destination.hasOwnProperty( propertyKey ) === false ) {
        destination[ propertyKey ] = source[ propertyKey ]; // Copy property
      }
    }
    return destination; // Return the modified destination object
  }

  // Utility to store the current text selection state
  // Based on a solution from Stack Overflow (by Tim Down)
  function storeRange() {
    var idx,
      count,
      focusRanges,
      activeSel = globalWindow.getSelection(); // Get the current selection object
    if ( activeSel.getRangeAt && activeSel.rangeCount ) {
      focusRanges = []; // Initialize an array to hold the ranges
      // Loop through all selection ranges and store them
      for ( idx = 0, count = activeSel.rangeCount; idx < count; idx += 1 ) {
        focusRanges.push( activeSel.getRangeAt( idx ) );
      }
      return focusRanges; // Return the array of stored ranges
    }
    return null; // No selection ranges found
  }

  // Utility to restore a previously saved text selection
  function applyRange( storedSelection ) {
    var idx,
      count,
      activeSel = globalWindow.getSelection(); // Get the current selection object
    if ( storedSelection ) {
      activeSel.removeAllRanges(); // Clear any existing selections
      // Add each stored range back to the selection
      for ( idx = 0, count = storedSelection.length; idx < count; idx += 1 ) {
        activeSel.addRange( storedSelection[ idx ] );
      }
    }
  }

  // Finds the DOM element where the current selection begins
  // From Stack Overflow (by You)
  function fetchCurrentNode() {
    var activeNode = currentDocument.getSelection().anchorNode, // Get the starting node of the selection
      initialNode = ( activeNode && activeNode.nodeType === 3 ? activeNode.parentNode : activeNode ); // Adjust if it's a text node
    return initialNode; // Return the resolved starting node
  }

  // Retrieves the HTML content of the currently selected text
  // Borrowed from Stack Overflow (by Tim Down)
  function extractSelectedHtml() {
    var idx,
      markup = '',
      activeSel,
      count,
      wrapperElem; // Temporary container for selected content
    if ( globalWindow.getSelection !== undefined ) { // Standard W3C selection model
      activeSel = globalWindow.getSelection();
      if ( activeSel.rangeCount ) {
        wrapperElem = currentDocument.createElement( 'div' ); // Create a temporary div
        for ( idx = 0, count = activeSel.rangeCount; idx < count; idx += 1 ) {
          wrapperElem.appendChild( activeSel.getRangeAt( idx ).cloneContents() ); // Append cloned content
        }
        markup = wrapperElem.innerHTML; // Get the HTML from the temporary div
      }
    } else if ( currentDocument.selection !== undefined ) { // IE-specific selection model
      if ( currentDocument.selection.type === 'Text' ) {
        markup = currentDocument.selection.createRange().htmlText; // Get HTML for text selection
      }
    }
    return markup; // Return the extracted HTML
  }

  // Checks if a given object is a DOM Element node
  // From Underscore.js library
  function isDomElement( potentialElement ) {
    return !!( potentialElement && potentialElement.nodeType === 1 ); // Check for nodeType 1 (ELEMENT_NODE)
  }

  // Prototype methods and properties for the RichTextEditor
  RichTextEditor.prototype = {
    // Default configuration settings for the editor
    standardSettings: {
      allowMultiParagraphSelection: true,
      linkInputPrompt: 'Insert or type a web address',
      linkPreviewFadeDelay: 500,
      actionButtons: [ 'bold', 'italic', 'underline', 'link', 'heading1', 'heading2', 'quote' ],
      buttonDisplayType: false,
      validateLinkFormat: false,
      sanitizePastedHtml: false,
      operationDelay: 0,
      horizontalOffset: 0,
      verticalOffset: -10,
      preventLineBreak: false,
      preventDoubleLineBreak: false,
      hideToolbar: false,
      primaryHeading: 'h3',
      forcePlainText: true,
      editorPlaceholder: 'Start typing your content',
      secondaryHeading: 'h4',
      openLinksInNewTab: false,
      plugins: {}
    },

    // Browser detection for Internet Explorer (including Edge in IE mode)
    // Based on a Stack Overflow answer by rg89
    isInternetExplorer: ( ( navigator.appName === 'Microsoft Internet Explorer' ) || ( ( navigator.appName === 'Netscape' ) && ( new RegExp( 'Trident/.*rv:([0-9]{1,}[.0-9]{0,})' ).exec( navigator.userAgent ) !== null ) ) ),

    // Initializes the editor instance
    initialize: function( targets, settings ) {
      this.defineTargetElements( targets ); // Set the elements to be edited
      if ( this.editableElements.length === 0 ) {
        return; // No elements to initialize
      }
      this.blockElements = [ 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre' ]; // Define block-level elements
      this.instanceId = currentDocument.querySelectorAll( '.medium-editor-toolbar' ).length + 1; // Assign a unique ID
      this.editorConfig = mergeObjects( settings, this.standardSettings ); // Merge user settings with defaults
      return this.setupEditor(); // Proceed with editor setup
    },

    // Sets up the editor by binding events and initializing components
    setupEditor: function() {
      this.isReady = true; // Mark the editor as ready
      this.prepareElements()
        .attachSelectionListeners()
        .attachPasteHandler()
        .applyPlaceholders()
        .attachGlobalActions(); // Chain setup methods
    },

    // Prepares the target elements for editing
    prepareElements: function() {
      this.refreshElementCollection(); // Ensure element list is up-to-date
      var idx,
        enableToolbar = false; // Flag to determine if toolbar should be initialized
      for ( idx = 0; idx < this.editableElements.length; idx += 1 ) {
        this.editableElements[ idx ].setAttribute( 'contentEditable', true ); // Make element editable
        if ( !this.editableElements[ idx ].getAttribute( 'data-placeholder' ) ) {
          this.editableElements[ idx ].setAttribute( 'data-placeholder', this.editorConfig.editorPlaceholder ); // Set placeholder text
        }
        this.editableElements[ idx ].setAttribute( 'data-content-editor-element', true ); // Mark as editor element
        this.handleParagraphCreation( idx ).handleReturnKey( idx ).handleTabKey( idx ); // Bind key handlers
        if ( !this.editorConfig.hideToolbar && !this.editableElements[ idx ].getAttribute( 'data-hide-toolbar' ) ) {
          enableToolbar = true; // Toolbar is needed
        }
      }
      // Initialize the editing toolbar if required
      if ( enableToolbar ) {
        this.initializeToolbar()
          .bindToolbarButtons()
          .bindLinkInputForm()
          .bindLinkPreview(); // Chain toolbar setup methods
      }
      return this; // Allow method chaining
    },

    // Sets the elements that the editor will manage
    defineTargetElements: function( selector ) {
      this.elementSelector = selector; // Store the selector
      this.refreshElementCollection(); // Update the internal list of elements
    },

    // Updates the internal list of editable elements based on the stored selector
    refreshElementCollection: function() {
      this.editableElements = typeof this.elementSelector === 'string' ? currentDocument.querySelectorAll( this.elementSelector ) : this.elementSelector;
      if ( this.editableElements.nodeType === 1 ) {
        this.editableElements = [ this.editableElements ]; // Ensure it's an array for single elements
      }
    },

    // Serializes the content of all editable elements into an object
    exportContent: function() {
      var idx,
        componentId,
        outputData = {}; // Object to store serialized content
      for ( idx = 0; idx < this.editableElements.length; idx += 1 ) {
        componentId = ( this.editableElements[ idx ].id !== '' ) ? this.editableElements[ idx ].id : 'element-' + idx; // Generate ID if not present
        outputData[ componentId ] = {
          value: this.editableElements[ idx ].innerHTML.trim() // Store trimmed HTML content
        };
      }
      return outputData; // Return the serialized content
    },

    /**
     * Helper function to invoke a specific method on all registered plugins.
     * The function verifies the method's existence before calling it.
     * @param {string} methodName The name of the function to execute on plugins
     * @param [methodArgs] Any additional arguments to pass to the plugin method
     */
    triggerPlugins: function( methodName ) {
      if ( arguments.length < 1 ) {
        return; // No method name provided
      }

      var methodArgs = Array.prototype.slice.call( arguments, 1 ), // Extract arguments for the plugin method
        plugin,
        pluginName;

      // Iterate through all registered plugins
      for ( pluginName in this.editorConfig.plugins ) {
        if ( this.editorConfig.plugins.hasOwnProperty( pluginName ) ) {
          plugin = this.editorConfig.plugins[ pluginName ];
          if ( plugin[ methodName ] !== undefined ) { // Check if the method exists on the plugin
            plugin[ methodName ].apply( plugin, methodArgs ); // Call the plugin method
          }
        }
      }
    },

    // Binds event listener for automatic paragraph creation on keyup
    handleParagraphCreation: function( index ) {
      var editorInstance = this; // Store reference to 'this'
      this.editableElements[ index ].addEventListener( 'keyup', function( eventObject ) {
        var activeNode = fetchCurrentNode(), // Get the current caret node
          elementTag; // Tag name of the node
        // If node is an editor element, has no children, and return is not disabled
        if ( activeNode && activeNode.getAttribute( 'data-content-editor-element' ) && activeNode.children.length === 0 && !( editorInstance.editorConfig.preventLineBreak || activeNode.getAttribute( 'data-disable-return' ) ) ) {
          currentDocument.execCommand( 'formatBlock', false, 'p' ); // Format as a paragraph
        }
        if ( eventObject.which === 13 ) { // If Enter key is pressed
          activeNode = fetchCurrentNode(); // Re-fetch node after potential formatBlock
          elementTag = activeNode.tagName.toLowerCase(); // Get lowercase tag name
          // If return is not disabled, not an LI, and not a child of an LI
          if ( !( editorInstance.editorConfig.preventLineBreak || this.getAttribute( 'data-disable-return' ) ) &&
            elementTag !== 'li' && !editorInstance.isChildOfList( activeNode ) ) {
            if ( !eventObject.shiftKey ) { // If Shift key is not held
              currentDocument.execCommand( 'formatBlock', false, 'p' ); // Ensure it's a paragraph
            }
            if ( elementTag === 'a' ) { // If currently in a link
              currentDocument.execCommand( 'unlink', false, null ); // Unlink it
            }
          }
        }
      } );
      return this; // Allow chaining
    },

    // Checks if a given node is a child of a list item (li)
    isChildOfList: function( nodeToCheck ) {
      var ancestorNode = nodeToCheck.parentNode,
        elementTag = ancestorNode.tagName.toLowerCase();
      // Traverse up the DOM tree until a block element or div is found
      while ( this.blockElements.indexOf( elementTag ) === -1 && elementTag !== 'div' ) {
        if ( elementTag === 'li' ) {
          return true; // Found a list item ancestor
        }
        ancestorNode = ancestorNode.parentNode; // Move to the next parent
        if ( ancestorNode && ancestorNode.tagName ) {
          elementTag = ancestorNode.tagName.toLowerCase(); // Update tag name
        } else {
          return false; // Reached document root or invalid parent
        }
      }
      return false; // No list item ancestor found
    },

    // Binds event listener to handle the 'Return' key behavior
    handleReturnKey: function( index ) {
      var editorInstance = this; // Store reference to 'this'
      this.editableElements[ index ].addEventListener( 'keypress', function( eventObject ) {
        if ( eventObject.which === 13 ) { // If Enter key is pressed
          // Prevent default return behavior if configured or data attribute is set
          if ( editorInstance.editorConfig.preventLineBreak || this.getAttribute( 'data-disable-return' ) ) {
            eventObject.preventDefault();
          } else if ( editorInstance.editorConfig.preventDoubleLineBreak || this.getAttribute( 'data-disable-double-return' ) ) {
            var activeNode = fetchCurrentNode(); // Get current node
            if ( activeNode && activeNode.innerText === '\n' ) { // If it's an empty line
              eventObject.preventDefault(); // Prevent double line break
            }
          }
        }
      } );
      return this; // Allow chaining
    },

    // Binds event listener to handle the 'Tab' key behavior
    handleTabKey: function( index ) {
      this.editableElements[ index ].addEventListener( 'keydown', function( eventObject ) {
        if ( eventObject.which === 9 ) { // If Tab key is pressed
          // Override tab behavior specifically for <pre> tags
          var elementTag = fetchCurrentNode().tagName.toLowerCase();
          if ( elementTag === 'pre' ) {
            eventObject.preventDefault(); // Prevent default tab action
            currentDocument.execCommand( 'insertHtml', null, '    ' ); // Insert four spaces
          }
        }
      } );
      return this; // Allow chaining
    },

    // Generates the HTML markup for a specific editor button
    createButtonMarkup: function( buttonKind ) {
      var labelTexts = this.fetchButtonLabels( this.editorConfig.buttonDisplayType ), // Get button labels
        markupTemplates = {
          'bold': '<button class="content-editor-action content-editor-action-bold" data-action="bold" data-element="b">' + labelTexts.bold + '</button>',
          'italic': '<button class="content-editor-action content-editor-action-italic" data-action="italic" data-element="i">' + labelTexts.italic + '</button>',
          'underline': '<button class="content-editor-action content-editor-action-underline" data-action="underline" data-element="u">' + labelTexts.underline + '</button>',
          'strikethrough': '<button class="content-editor-action content-editor-action-strikethrough" data-action="strikethrough" data-element="strike"><strike>A</strike></button>',
          'superscript': '<button class="content-editor-action content-editor-action-superscript" data-action="superscript" data-element="sup">' + labelTexts.superscript + '</button>',
          'subscript': '<button class="content-editor-action content-editor-action-subscript" data-action="subscript" data-element="sub">' + labelTexts.subscript + '</button>',
          'link': '<button class="content-editor-action content-editor-action-link" data-action="link" data-element="a">' + labelTexts.link + '</button>',
          'image': '<button class="content-editor-action content-editor-action-image" data-action="image" data-element="img">' + labelTexts.image + '</button>',
          'heading1': '<button class="content-editor-action content-editor-action-heading1" data-action="append-' + this.editorConfig.primaryHeading + '" data-element="' + this.editorConfig.primaryHeading + '">' + labelTexts.heading1 + '</button>',
          'heading2': '<button class="content-editor-action content-editor-action-heading2" data-action="append-' + this.editorConfig.secondaryHeading + '" data-element="' + this.editorConfig.secondaryHeading + '">' + labelTexts.heading2 + '</button>',
          'quote': '<button class="content-editor-action content-editor-action-quote" data-action="append-blockquote" data-element="blockquote">' + labelTexts.quote + '</button>',
          'orderedlist': '<button class="content-editor-action content-editor-action-orderedlist" data-action="insertorderedlist" data-element="ol">' + labelTexts.orderedlist + '</button>',
          'unorderedlist': '<button class="content-editor-action content-editor-action-unorderedlist" data-action="insertunorderedlist" data-element="ul">' + labelTexts.unorderedlist + '</button>',
          'preformatted': '<button class="content-editor-action content-editor-action-preformatted" data-action="append-pre" data-element="pre">' + labelTexts.preformatted + '</button>',
          'indenttext': '<button class="content-editor-action content-editor-action-indenttext" data-action="indent" data-element="ul">' + labelTexts.indenttext + '</button>',
          'outdenttext': '<button class="content-editor-action content-editor-action-outdenttext" data-action="outdent" data-element="ul">' + labelTexts.outdenttext + '</button>'
        };
      return markupTemplates[ buttonKind ] || false; // Return the button HTML or false
    },

    // Retrieves the appropriate labels for toolbar buttons
    // TODO: Refactor this function for better readability
    fetchButtonLabels: function( labelDisplayType ) {
      var customLabels,
        attributeName,
        labelTexts = {
          'bold': '<b>B</b>',
          'italic': '<b><i>I</i></b>',
          'underline': '<b><u>U</u></b>',
          'superscript': '<b>x<sup>1</sup></b>',
          'subscript': '<b>x<sub>1</sub></b>',
          'link': '<b>#</b>',
          'image': '<b>image</b>',
          'heading1': '<b>H1</b>',
          'heading2': '<b>H2</b>',
          'quote': '<b>&ldquo;</b>',
          'orderedlist': '<b>1.</b>',
          'unorderedlist': '<b>&bull;</b>',
          'preformatted': '<b>0101</b>',
          'indenttext': '<b>&rarr;</b>',
          'outdenttext': '<b>&larr;</b>'
        };
      if ( labelDisplayType === 'fontawesome' ) {
        customLabels = {
          'bold': '<i class="fa fa-bold"></i>',
          'italic': '<i class="fa fa-italic"></i>',
          'underline': '<i class="fa fa-underline"></i>',
          'superscript': '<i class="fa fa-superscript"></i>',
          'subscript': '<i class="fa fa-subscript"></i>',
          'link': '<i class="fa fa-link"></i>',
          'image': '<i class="fa fa-picture-o"></i>',
          'quote': '<i class="fa fa-quote-right"></i>',
          'orderedlist': '<i class="fa fa-list-ol"></i>',
          'unorderedlist': '<i class="fa fa-list-ul"></i>',
          'preformatted': '<i class="fa fa-code fa-lg"></i>',
          'indenttext': '<i class="fa fa-indent"></i>',
          'outdenttext': '<i class="fa fa-outdent"></i>'
        };
      } else if ( typeof labelDisplayType === 'object' ) {
        customLabels = labelDisplayType; // Use provided object as custom labels
      }
      if ( typeof customLabels === 'object' ) {
        for ( attributeName in customLabels ) {
          if ( customLabels.hasOwnProperty( attributeName ) ) {
            labelTexts[ attributeName ] = customLabels[ attributeName ]; // Override with custom labels
          }
        }
      }
      return labelTexts; // Return the final set of button labels
    },

    // Initializes the editor toolbar component
    initializeToolbar: function() {
      if ( this.controlPanel ) {
        return this; // Toolbar already initialized
      }
      this.controlPanel = this.buildControlPanel(); // Create the toolbar DOM element
      this.persistToolbar = false; // Flag to control toolbar visibility
      this.linkEntryForm = this.controlPanel.querySelector( '.medium-editor-toolbar-form-anchor' ); // Get link input form
      this.linkInputField = this.linkEntryForm.querySelector( 'input' ); // Get link input field
      this.actionButtonsContainer = this.controlPanel.querySelector( '.medium-editor-toolbar-actions' ); // Get actions container
      this.linkPreviewDisplay = this.createLinkPreview(); // Create the link preview element

      return this; // Allow chaining
    },

    // Creates the main toolbar DOM element
    buildControlPanel: function() {
      var controlPanel = currentDocument.createElement( 'div' );
      controlPanel.id = 'content-editor-toolbar-' + this.instanceId; // Set unique ID
      controlPanel.className = 'content-editor-toolbar'; // Assign CSS class
      controlPanel.appendChild( this.generateToolbarButtons() ); // Add buttons
      controlPanel.appendChild( this.buildLinkInputForm() ); // Add link form
      currentDocument.body.appendChild( controlPanel ); // Append to document body
      return controlPanel; // Return the created toolbar
    },

    // Generates the list of action buttons for the toolbar
    // TODO: Consider actionTemplate for better modularity
    generateToolbarButtons: function() {
      var buttonsList = this.editorConfig.actionButtons,
        listContainer = currentDocument.createElement( 'ul' ),
        listItem,
        idx,
        actionButton,
        plugin;

      listContainer.id = 'content-editor-toolbar-actions';
      listContainer.className = 'content-editor-toolbar-actions clearfix'; // Clearfix for layout

      for ( idx = 0; idx < buttonsList.length; idx += 1 ) {
        // Check if button is provided by an extension/plugin
        if ( this.editorConfig.plugins.hasOwnProperty( buttonsList[ idx ] ) ) {
          plugin = this.editorConfig.plugins[ buttonsList[ idx ] ];
          actionButton = plugin.getButton !== undefined ? plugin.getButton() : null; // Get button from plugin
        } else {
          actionButton = this.createButtonMarkup( buttonsList[ idx ] ); // Create button from template
        }

        if ( actionButton ) {
          listItem = currentDocument.createElement( 'li' ); // Create list item for the button
          if ( isDomElement( actionButton ) ) {
            listItem.appendChild( actionButton ); // Append if it's a DOM element
          } else {
            listItem.innerHTML = actionButton; // Set innerHTML if it's a string
          }
          listContainer.appendChild( listItem ); // Add list item to the list
        }
      }

      return listContainer; // Return the unordered list of buttons
    },

    // Creates the HTML structure for the link input form
    buildLinkInputForm: function() {
      var linkFormDiv = currentDocument.createElement( 'div' ),
        textInput = currentDocument.createElement( 'input' ),
        closeButton = currentDocument.createElement( 'a' );

      closeButton.setAttribute( 'href', '#' );
      closeButton.innerHTML = '&times'; // 'X' character for closing

      textInput.setAttribute( 'type', 'text' );
      textInput.setAttribute( 'placeholder', this.editorConfig.linkInputPrompt ); // Set placeholder text

      linkFormDiv.className = 'medium-editor-toolbar-form-anchor';
      linkFormDiv.id = 'medium-editor-toolbar-form-anchor';
      linkFormDiv.appendChild( textInput );
      linkFormDiv.appendChild( closeButton );

      return linkFormDiv; // Return the link input form
    },

    // Attaches event listeners for selection changes
    attachSelectionObservers: function() {
      var editorInstance = this,
        selectionDelayTimer = '', // Timer for debouncing selection checks
        idx;

      // Wrapper function to debounce selection checks
      this.selectionWatcher = function( eventObject ) {

        // Do not hide toolbar if clicking into the link input form after blurring editable area
        if ( eventObject && editorInstance.isClickingLinkInput( eventObject ) ) {
          return false;
        }

        clearTimeout( selectionDelayTimer ); // Clear any previous timer
        selectionDelayTimer = setTimeout( function() {
          editorInstance.evaluateSelection(); // Evaluate the current text selection
        }, editorInstance.editorConfig.operationDelay );
      };

      globalWindow.document.documentElement.addEventListener( 'mouseup', this.selectionWatcher ); // Listen for mouse up on document

      // Add listeners to each editable element
      for ( idx = 0; idx < this.editableElements.length; idx += 1 ) {
        this.editableElements[ idx ].addEventListener( 'keyup', this.selectionWatcher );
        this.editableElements[ idx ].addEventListener( 'blur', this.selectionWatcher );
      }
      return this; // Allow chaining
    },

    // Evaluates the current text selection and manages toolbar visibility
    evaluateSelection: function() {
      var currentRange,
        selectedDomElement;

      // If toolbar is not persistent and not disabled
      if ( this.persistToolbar !== true && !this.editorConfig.hideToolbar ) {
        currentRange = globalWindow.getSelection(); // Get current selection
        // If selection is empty or contains multiple paragraphs (and not allowed)
        if ( currentRange.toString().trim() === '' ||
          ( this.editorConfig.allowMultiParagraphSelection === false && this.containsMultipleParagraphs() ) ) {
          this.hideToolbarActions(); // Hide the toolbar
        } else {
          selectedDomElement = this.getSelectedDomElement(); // Get the element containing the selection
          if ( !selectedDomElement || selectedDomElement.getAttribute( 'data-hide-toolbar' ) ) {
            this.hideToolbarActions(); // Hide if element or its data attribute disables toolbar
          } else {
            this.checkSelectedElement( currentRange, selectedDomElement ); // Check and show toolbar
          }
        }
      }
      return this; // Allow chaining
    },

    // Checks if the user is clicking into the link input form after blurring an editable area
    isClickingLinkInput: function( eventObject ) {
      var editorInstance = this;
      if ( eventObject.type && eventObject.type.toLowerCase() === 'blur' && eventObject.relatedTarget && eventObject.relatedTarget === editorInstance.linkInputField ) {
        return true; // Yes, clicking into link input
      }
      return false; // No, not clicking link input
    },

    // Determines if the current selection spans across multiple block-level paragraphs
    containsMultipleParagraphs: function() {
      // Clean HTML from empty tags and check for multiple block-level elements
      var selectedHtmlContent = extractSelectedHtml().replace( /<[\S]+><\/[\S]+>/gim, '' ),
        multipleParagraphMatches = selectedHtmlContent.match( /<(p|h[0-6]|blockquote)>([\s\S]*?)<\/(p|h[0-6]|blockquote)>/g );

      return ( multipleParagraphMatches ? multipleParagraphMatches.length : 0 ); // Return count of matched paragraphs
    },

    // Placeholder for bindPaste method, to be implemented
    attachPasteHandler: function() {
      // Implementation for paste handling goes here
      return this;
    },

    // Placeholder for setPlaceholders method, to be implemented
    applyPlaceholders: function() {
      // Implementation for placeholder management goes here
      return this;
    },

    // Placeholder for bindWindowActions method, to be implemented
    attachGlobalActions: function() {
      // Implementation for global window actions goes here
      return this;
    },

    // Placeholder for bindToolbarButtons method, to be implemented
    bindToolbarButtons: function() {
      // Implementation for binding toolbar button events goes here
      return this;
    },

    // Placeholder for bindAnchorForm method, to be implemented
    bindLinkInputForm: function() {
      // Implementation for binding link form events goes here
      return this;
    },

    // Placeholder for bindAnchorPreview method, to be implemented
    bindLinkPreview: function() {
      // Implementation for binding link preview events goes here
      return this;
    },

    // Placeholder for hideToolbarActions method, to be implemented
    hideToolbarActions: function() {
      // Implementation for hiding toolbar actions goes here
      return this;
    },

    // Placeholder for getSelectionElement method, to be implemented
    getSelectedDomElement: function() {
      // Implementation for getting the selected DOM element goes here
      return currentDocument.body; // Default placeholder for now
    },

    // Placeholder for checkSelectionElement method, to be implemented
    checkSelectedElement: function( currentRange, selectedDomElement ) {
      // Implementation for checking selected element goes here
      return this;
    },

    // Placeholder for createAnchorPreview method, to be implemented
    createLinkPreview: function() {
      // Implementation for creating link preview goes here
      return currentDocument.createElement('div'); // Default placeholder for now
    }

  };

})( window, document );
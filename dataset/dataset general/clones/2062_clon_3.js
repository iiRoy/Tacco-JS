/**
 *  wikipad.composer.js
 *  A jQuery-based module for creating the WikiPad Content Composer.
 *
 *  Usage:
 *  $.WikiPadComposer(); on DOM ready.
 */
(function($) {

  // Global configuration defaults for the composer instance
  const InitialConfig = {
    ContentFormat: 'markdown', // Default content interpretation format
    EditView: 'code',          // Mode of the editor: 'code' or 'visual'
    IsNewDoc: false,           // Flag indicating if a new document is being created
    ShowToolPalette: true,     // Whether to display the toolbar with formatting buttons
    EnableLogging: false,      // Activates console logging for debugging purposes
    DisallowedFormats: []      // List of formats for which definitions should not be loaded
  };

  // Holds the active configuration, merged with user preferences
  let CurrentSettings = {};

  // Flag to manage form submission to prevent infinite loops
  let isFormSubmittingInternally = false;

  /**
   *  $.WikiPadComposer
   *
   *  Initializes the WikiPad content composer. Call this function once the DOM is ready.
   *
   *  @param {object} UserPrefs - Optional object to override default configuration settings.
   */
  $.WikiPadComposer = function( UserPrefs ) {

    // Merge default and user-provided settings, ensuring a deep copy
    CurrentSettings = $.extend(true, {}, InitialConfig, UserPrefs);
    traceLog('WikiPadComposer initialization started.');

    // Proceed only if core composer markup is present
    if ( UiElementPresence.hasCoreComposerElements() ) {

      // Handle document title input activation
      if ( UiElementPresence.isTitleFieldVisible() ) {
        $('#wikipad-doc-title-input').addClass('active-title-input');
        traceLog('Document title field activated.');
      }

      // Initialize commit message field and form submission
      if ( UiElementPresence.hasCommitMessageField() ) {
        const commitMsgInput = $('#wikipad-commit-msg-input');
        if (commitMsgInput.length) {
          InputHintManager.add(commitMsgInput);
        }

        // Attach a submit handler to the main form
        $('#wikipad-composer-root form[name="wikipad-document-form"]').on('submit', function( event ) {
          // Only prevent default if it's not an internal re-submission
          if (!isFormSubmittingInternally) {
            event.preventDefault();
            InputHintManager.clearAll(); // Clear any placeholder text before submission
            traceLog('Form submission intercepted for placeholder clearing.');

            // Set flag and resubmit the form programmatically
            isFormSubmittingInternally = true;
            $(this).submit(); // Re-trigger submission
          }
        });
      }

      // Set up click handlers for collapsible sections
      if ( UiElementPresence.hasCollapsibleSections() ) {
        $('#wikipad-composer-root .collapsed-panel a.toggle-btn, ' +
          '#wikipad-composer-root .expanded-panel a.toggle-btn').on('click', function( evt ) {
          evt.preventDefault();
          const parentPanel = $(this).parent();
          parentPanel.toggleClass('expanded-panel');
          parentPanel.toggleClass('collapsed-panel');
          traceLog('Collapsible panel toggled.');
        });
      }

      // Configure the preview button functionality
      if ( UiElementPresence.hasPreviewActionBtn() ) {
        $('#wikipad-composer-root #wikipad-preview-action-btn').on('click', function( event ) {
          event.preventDefault(); // Prevent default link behavior
          const previewButton = $(this);
          const targetForm = $('#wikipad-composer-root form');

          if (!targetForm.length) {
            traceLog('Error: Composer form not found for preview action.', 'error');
            return false;
          }

          // Store original form attributes
          const originalAction = targetForm.attr('action');
          const originalTarget = targetForm.attr('target');

          // Modify form for preview submission
          targetForm.attr('action', previewButton.attr('href') || '/wiki-preview');
          targetForm.attr('target', '_blank'); // Open preview in a new tab

          // Submit the form
          traceLog('Submitting form for preview.');
          targetForm.submit();

          // Restore original form attributes after a short delay to ensure submission
          setTimeout(() => {
            targetForm.attr('action', originalAction);
            if (originalTarget) {
              targetForm.attr('target', originalTarget);
            } else {
              targetForm.removeAttr('target');
            }
            traceLog('Form attributes restored post-preview.');
          }, 100); // Small delay to ensure browser processes the submission

          return false; // Prevent further default actions
        });
      }

      // Initialize the tool palette if enabled
      if ( UiElementPresence.hasToolPalette() ) {
        const docFormatAttribute = $('#wikipad-content-textarea').attr('data-markup-lang');

        // Override default content format if specified in HTML
        if ( docFormatAttribute && docFormatAttribute.trim() !== '' ) {
          CurrentSettings.ContentFormat = docFormatAttribute;
          traceLog(`Content format overridden by HTML attribute: ${docFormatAttribute}`);
        }

        // Load content format definition
        ContentFormatRegistry.setCurrentFormat( CurrentSettings.ContentFormat );

        // Initialize format switcher if present
        if ( UiElementPresence.hasFormatSelectorDropdown() ) {
          FormatSwitcher.initializeDropdown(
            $('#wikipad-format-switcher select') );
        }

        // Handle inline help panel visibility
        if ( UiElementPresence.hasInlineHelpPanel() ) {
          $('#wikipad-help-dialog').hide().removeClass('initial-jaws-state');
          traceLog('Inline help panel hidden and initial state cleared.');
        }
      }
    } else {
      traceLog('WikiPadComposer: Core composer elements missing, initialization aborted.', 'warn');
    }
  };


  /**
   *  $.WikiPadComposer.registerFormatDefinition
   *  Registers a specific content format definition with the composer.
   *  Used by external definition files (e.g., langs/*.js) to supply format-specific actions.
   *
   *  @param  {string} formatId      The unique identifier for the content format (e.g., 'markdown').
   *  @param  {object} formatDefData An object containing the definition data for the format.
   */
  $.WikiPadComposer.registerFormatDefinition = function( formatId, formatDefData ) {
    if ( typeof formatDefData === 'object' && formatDefData !== null ) {
      ContentFormatRegistry.register( formatId, formatDefData );
      traceLog(`Registered definition for format: ${formatId}`);
    } else {
      traceLog(`WikiPadComposer.registerFormatDefinition: Definition for ${formatId} is not a valid object.`, 'error');
    }
  };


  /**
   *  traceLog
   *  Outputs debug information to the browser console if logging is enabled.
   *
   *  @param  {...any} messages - One or more arguments to dump to console.log.
   *  @return {void}
   */
  const traceLog = function(...messages) {
    if ( CurrentSettings.EnableLogging && typeof console !== 'undefined' && console.log ) {
      console.log( '[WikiPadComposer]', ...messages );
    }
  };



  /**
   *  ContentFormatRegistry
   *  Manages the loading and retrieval of content format definition files.
   *  These files contain specific actions and configurations for different markup types.
   */
  const ContentFormatRegistry = {

    _currentFormatId: '',      // Identifier of the currently active content format
    _loadedFormats: [],        // List of identifiers for formats whose scripts have been loaded
    _formatDefinitions: {},    // Stores the actual definition objects keyed by format ID
    _scriptLoadQueue: {},      // Tracks ongoing script loading requests

    /**
     *  Registers a content format definition.
     *
     *  @param {string} formatName  The name/ID of the content format.
     *  @param {object} definitionObject The definition data object for the format.
     */
    register: function( formatName, definitionObject ) {
      this._currentFormatId = formatName;
      if (!this._loadedFormats.includes(formatName)) {
         this._loadedFormats.push( formatName );
      }

      let finalDefinition = {};
      // Merge with a base Wiki format if available, otherwise use provided definition
      if ( typeof $.WikiPadComposer.BaseWikiFormat === 'object' && $.WikiPadComposer.BaseWikiFormat !== null ) {
        $.extend(true, finalDefinition, $.WikiPadComposer.BaseWikiFormat, definitionObject);
      } else {
        $.extend(true, finalDefinition, definitionObject);
      }
      this._formatDefinitions[formatName] = finalDefinition;
      traceLog(`Format definition for '${formatName}' registered.`);
    },

    /**
     *  Retrieves the identifier of the currently active content format.
     *
     *  @return {string} The ID of the active format.
     */
    getCurrentFormatIdentifier: function() {
      return this._currentFormatId;
    },

    /**
     *  Sets the active content format, loading its definition script if necessary.
     *
     *  @param {string} formatKey The identifier of the format to set as active.
     */
    setCurrentFormat: function( formatKey ) {
      if (!formatKey || typeof formatKey !== 'string') {
        traceLog('Attempted to set an invalid content format key.', 'error');
        return;
      }

      if ( !this.isFormatScriptLoaded(formatKey) ) {
        this._currentFormatId = null; // Clear active while loading
        traceLog(`Attempting to load definition for format: ${formatKey}`);

        this.fetchDefinitionScript( formatKey, (xhr, status) => {
          if ( status !== 'success' ) {
            traceLog(`Failed to load language definition for ${formatKey}. Defaulting to empty definition.`, 'error');
            // If loading fails, register an empty definition to prevent further errors
            this.register( formatKey, {} );
          }
          this._currentFormatId = formatKey; // Set active after (attempted) load

          // Update UI components that depend on the format definition
          if ( UiElementPresence.hasToolPalette() ) {
            ToolPalette.updateDisplay();
          }

          if ( this.isCurrentFormatValid() && UiElementPresence.hasFormatSelectorDropdown() ) {
            FormatSwitcher.syncSelection();
          }
        });
      } else {
        this._currentFormatId = formatKey;
        traceLog(`Format definition for '${formatKey}' already loaded, setting as active.`);
        ToolPalette.updateDisplay(); // Refresh tool palette for the already loaded format
      }
    },


    /**
     *  Retrieves a definition object for a specified attribute within the active format.
     *
     *  @param  {string}  attributeName   The name of the attribute (e.g., 'bold', 'italic').
     *  @param  {string}  [targetFormat]  Optional: The specific format to pull a definition for.
     *                                   If not provided, the active format is used.
     *  @return {object|null} The definition object if it exists, otherwise null.
     */
    getDefinitionData: function( attributeName, targetFormat ) {
      const formatToUse = targetFormat || this._currentFormatId;

      if ( !this.isFormatScriptLoaded(formatToUse) || !this._formatDefinitions[formatToUse] ) {
        traceLog(`No definition found for format '${formatToUse}'.`, 'warn');
        return null;
      }

      const definition = this._formatDefinitions[formatToUse][attributeName];
      if ( definition && typeof definition === 'object' && definition !== null ) {
        return definition;
      }

      traceLog(`No definition data found for attribute '${attributeName}' in format '${formatToUse}'.`, 'info');
      return null;
    },


    /**
     *  Asynchronously loads a definition script file for a given content format.
     *  Definition files are crucial for enabling specific editor functionalities.
     *
     *  @param  {string}   formatNameKey     The identifier of the content format to load.
     *  @param  {function} completionCallback A callback function to execute upon script load completion.
     *  @return {void}
     */
    fetchDefinitionScript: function( formatNameKey, completionCallback ) {
      // Prevent redundant requests for scripts already being loaded
      if (this._scriptLoadQueue[formatNameKey]) {
        traceLog(`Script for '${formatNameKey}' is already in the load queue.`, 'info');
        // Optionally, queue the callback to be executed once the current load finishes
        return;
      }

      // Check against the blacklist of disallowed formats
      if ( CurrentSettings.DisallowedFormats.includes(formatNameKey) ) {
        traceLog(`Definition for '${formatNameKey}' is blacklisted. Aborting load.`, 'warn');
        if ( typeof completionCallback === 'function' ) {
          completionCallback( null, 'error' );
        }
        return;
      }

      const scriptUrl = `/assets/wikipad/formats/${formatNameKey}.js`;
      this._scriptLoadQueue[formatNameKey] = true; // Mark as loading

      $.ajax({
        url: scriptUrl,
        dataType: 'script',
        cache: true, // Allow browser caching of script files
        complete: (xhr, status) => {
          delete this._scriptLoadQueue[formatNameKey]; // Remove from queue after completion
          if ( typeof completionCallback === 'function' ) {
            completionCallback( xhr, status );
          }
          traceLog(`Script for '${formatNameKey}' loaded with status: ${status}.`);
        },
        error: (xhr, status, error) => {
          traceLog(`Error loading script for '${formatNameKey}': ${status}, ${error}`, 'error');
        }
      });
    },


    /**
     *  Checks if a definition script file has been successfully loaded for the specified format.
     *
     *  @param  {string}  formatIdentifier The name of the content format.
     *  @return {boolean} True if loaded, false otherwise.
     */
    isFormatScriptLoaded: function( formatIdentifier ) {
      if ( this._loadedFormats.length === 0 ) {
        return false;
      }
      return this._loadedFormats.includes(formatIdentifier);
    },

    /**
     *  Checks if the currently active content format has a valid definition object.
     *
     *  @return {boolean} True if the active format is valid, false otherwise.
     */
    isCurrentFormatValid: function() {
      return ( this._currentFormatId &&
               typeof this._formatDefinitions[this._currentFormatId] === 'object' &&
               this._formatDefinitions[this._currentFormatId] !== null );
    }
  };


  /**
   *  UiElementPresence
   *  A utility module for checking the existence and state of various UI elements
   *  within the WikiPad Composer interface.
   */
  const UiElementPresence = {

    /**
     *  Checks if the fundamental composer markup (root container and content area) is present.
     *
     *  @return {boolean} True if core elements are found.
     */
    hasCoreComposerElements: function() {
      return ( $('#wikipad-composer-root').length > 0 &&
               $('#wikipad-content-textarea').length > 0 );
    },


    /**
     *  Checks for the presence of collapsible input sections (e.g., sidebars).
     *
     *  @return {boolean} True if collapsible elements exist.
     */
    hasCollapsibleSections: function() {
      return $('#wikipad-composer-root .collapsed-panel, #wikipad-composer-root .expanded-panel').length > 0;
    },


    /**
     *  Determines if the format selection dropdown for switching content types is available.
     *
     *  @return {boolean} True if the format selector is found.
     */
    hasFormatSelectorDropdown: function() {
      return $('#wikipad-format-switcher select').length > 0;
    },


    /**
     *  Verifies if the tool palette (function bar) markup is present and enabled in settings.
     *
     *  @return {boolean} True if the tool palette should be active.
     */
    hasToolPalette: function() {
      return ( CurrentSettings.ShowToolPalette &&
               $('#wikipad-tool-palette').length > 0 );
    },


    /**
     *  Detects if the environment is a legacy Firefox 4.0 Beta (for specific compatibility).
     *
     *  @return {boolean} True if running in Firefox 4.0 Beta.
     */
    isLegacyFirefox: function() {
      const firefox4BetaRegex = /Firefox\/4\.0b/i;
      return firefox4BetaRegex.test( navigator.userAgent );
    },


    /**
     *  Checks if the commit message input field is part of the editor's markup.
     *
     *  @return {boolean} True if a commit message field is present.
     */
    hasCommitMessageField: function() {
      return ( $('input#wikipad-commit-msg-input').length > 0 );
    },


    /**
     *  Checks for the existence of the inline help panel within the composer.
     *
     *  @return {boolean} True if the help panel and its trigger button are found.
     */
    hasInlineHelpPanel: function() {
      return ( $('#wikipad-composer-root #wikipad-help-dialog').length > 0 &&
               $('#wikipad-composer-root #tool-help-button').length > 0 );
    },


    /**
     *  Checks if the document preview button is available in the UI.
     *
     *  @return {boolean} True if the preview button exists.
     */
    hasPreviewActionBtn: function() {
      return ( $('#wikipad-composer-root #wikipad-preview-action-btn').length > 0 );
    },


    /**
     *  Indicates whether the document title input field is currently displayed and active.
     *
     *  @return {boolean} True if the title field is visible (typically for new documents).
     */
    isTitleFieldVisible: function() {
      return ( CurrentSettings.IsNewDoc );
    }

  };


  /**
   *  ToolPalette
   *  Handles the functionality and display of the editor's formatting tool palette.
   */
   const ToolPalette = {

      isPaletteActive: false, // Tracks the active state of the palette

      /**
       *  Activates the tool palette, attaching event handlers to its buttons
       *  and making it visible.
       */
      enablePalette: function() {
        if (this.isPaletteActive) {
          traceLog('Tool palette already active, skipping activation.');
          return;
        }

        traceLog('Activating tool palette buttons.');

        // Iterate through each tool button and enable/disable based on format definition availability
        $('#wikipad-tool-palette a.palette-tool-btn').each(function() {
          const buttonId = $(this).attr('id');
          if ( ContentFormatRegistry.getDefinitionData( buttonId ) ) {
            $(this).on('click', ToolPalette.handleButtonClick);
            $(this).removeClass('disabled-tool');
          } else if ( buttonId !== 'tool-help-button' ) { // Help button is always available
            $(this).addClass('disabled-tool');
            $(this).off('click', ToolPalette.handleButtonClick); // Ensure no handler
          }
        });

        // Visually activate the palette
        $('#wikipad-tool-palette').addClass( 'palette-active' );
        this.isPaletteActive = true;
        traceLog('Tool palette enabled.');
      },

      /**
       *  Deactivates the tool palette, removing event handlers and hiding it.
       */
      disablePalette: function() {
        if (!this.isPaletteActive) {
          traceLog('Tool palette already inactive, skipping deactivation.');
          return;
        }

        $('#wikipad-tool-palette a.palette-tool-btn').off('click', ToolPalette.handleButtonClick);
        $('#wikipad-tool-palette').removeClass( 'palette-active' );
        this.isPaletteActive = false;
        traceLog('Tool palette disabled.');
      },

      /**
       *  Refreshes the display of the tool palette, typically after a format change.
       *  This involves deactivating and then reactivating it to re-evaluate button states.
       */
      updateDisplay: function() {
        this.disablePalette();
        this.enablePalette();
        traceLog('Tool palette display updated.');
      },

      /**
       *  Event handler for tool palette button clicks. Prevents default action
       *  and executes the corresponding language-specific action.
       *
       *  @param {jQuery.Event} event - The jQuery event object.
       */
      handleButtonClick: function(event) {
        event.preventDefault();
        const buttonId = $(this).attr('id');
        const actionDef = ContentFormatRegistry.getDefinitionData( buttonId );

        if ( typeof actionDef === 'object' && actionDef !== null ) {
          ToolPalette.performAction( actionDef, $(this) );
        } else {
          traceLog(`No valid action definition found for button: ${buttonId}`, 'warn');
        }
      },


      /**
       *  Executes a language-specific defined action for a tool palette button.
       *  This function handles text manipulation within the content textarea.
       *
       *  @param {object} actionConfig - The definition object for the action to perform.
       *  @param {jQuery} $buttonElement - The jQuery object for the button that triggered the action.
       */
      performAction: function( actionConfig, $buttonElement ) {
        const contentTextArea = $('#wikipad-content-textarea');
        if (!contentTextArea.length) {
          traceLog('Content textarea not found, cannot perform action.', 'error');
          return;
        }

        const currentContent = contentTextArea.val();
        const selectionRange = TextAreaUtils.getSelectionRange(contentTextArea[0]);
        let selectedText = TextAreaUtils.getSelectedContent(contentTextArea[0]);
        let replacementText = selectedText;
        let cursorPosition = null;

        // If a direct execution function is provided, use it
        if ( typeof actionConfig.exec === 'function' ) {
          traceLog(`Executing custom function for action: ${$buttonElement.attr('id')}`);
          actionConfig.exec( currentContent, selectedText, contentTextArea );
          return; // Custom exec function handles everything
        }

        // Otherwise, proceed with search/replace logic
        let searchPattern = /([^\n]+)/gi; // Default to match non-newline content
        if ( actionConfig.search && typeof actionConfig.search === 'string' ) {
          try {
            searchPattern = new RegExp( actionConfig.search, 'gi' ); // Ensure global and case-insensitive
            traceLog(`Using custom search regex: ${actionConfig.search}`);
          } catch (e) {
            traceLog(`Invalid regex in actionConfig.search for ${$buttonElement.attr('id')}: ${e.message}`, 'error');
            return;
          }
        }

        if ( actionConfig.replace && typeof actionConfig.replace === 'string' ) {
          traceLog(`Applying replacement pattern: ${actionConfig.replace}`);
          replacementText = selectedText.replace( searchPattern, actionConfig.replace );

          // Remove backreferences that might not have been matched (e.g., $1, $2)
          replacementText = replacementText.replace( /\$[\d]/g, '' );

          // Handle special cursor placement if defined
          if ( actionConfig.cursorOffset !== undefined ) {
            // If selected text was empty, the new cursor position is after the inserted text
            cursorPosition = selectionRange.start + replacementText.length + (actionConfig.cursorOffset || 0);
          }
        } else if ( actionConfig.wrap && typeof actionConfig.wrap === 'string' ) {
          // Simple wrapping logic
          replacementText = actionConfig.wrap + selectedText + actionConfig.wrap;
          if (selectedText.length === 0) {
            cursorPosition = selectionRange.start + actionConfig.wrap.length;
          } else {
            cursorPosition = selectionRange.start + replacementText.length;
          }
        } else {
          traceLog(`No valid 'exec', 'replace', or 'wrap' definition for action: ${$buttonElement.attr('id')}`, 'warn');
          return;
        }

        // Update the textarea content with the new text
        const newContent = currentContent.substring(0, selectionRange.start) +
                           replacementText +
                           currentContent.substring(selectionRange.end);
        contentTextArea.val(newContent);

        // Re-select the replaced text or place cursor
        if (cursorPosition !== null) {
          TextAreaUtils.setSelectionRange(contentTextArea[0], cursorPosition, cursorPosition);
        } else if (selectedText.length > 0) {
          TextAreaUtils.setSelectionRange(contentTextArea[0], selectionRange.start, selectionRange.start + replacementText.length);
        } else {
          TextAreaUtils.setSelectionRange(contentTextArea[0], selectionRange.start + replacementText.length, selectionRange.start + replacementText.length);
        }

        // Trigger change event for other listeners (e.g., live preview)
        contentTextArea.trigger('change');
      }
   };

  /**
   *  TextAreaUtils
   *  A collection of utility functions for manipulating text selections and content
   *  within HTML textarea elements.
   *
   *  Note: These functions are adapted from common patterns for cross-browser
   *  textarea selection management.
   */
  const TextAreaUtils = {
    /**
     *  Retrieves the start and end positions of the current text selection in a textarea.
     *
     *  @param   {HTMLTextAreaElement} textarea - The DOM textarea element.
     *  @return  {object} An object with 'start' and 'end' properties indicating selection range.
     */
    getSelectionRange: function(textarea) {
      let start = 0, end = 0;
      if (typeof textarea.selectionStart === 'number' && typeof textarea.selectionEnd === 'number') {
        start = textarea.selectionStart;
        end = textarea.selectionEnd;
      } else if (document.selection && document.selection.createRange) {
        const range = document.selection.createRange();
        const normalizedValue = textarea.value.replace(/\r\n/g, '\n');
        const textInputRange = textarea.createTextRange();
        textInputRange.moveToBookmark(range.getBookmark());

        const endRange = textarea.createTextRange();
        endRange.collapse(false); // Move to end

        if (textInputRange.compareEndPoints('StartToEnd', endRange) > -1) {
          start = end = normalizedValue.length;
        } else {
          start = -textInputRange.moveStart('character', -normalizedValue.length);
          start += normalizedValue.substring(0, start).split('\n').length - 1;

          if (textInputRange.compareEndPoints('EndToEnd', endRange) > -1) {
            end = normalizedValue.length;
          } else {
            end = -textInputRange.moveEnd('character', -normalizedValue.length);
            end += normalizedValue.substring(0, end).split('\n').length - 1;
          }
        }
      }
      return { start: start, end: end };
    },

    /**
     *  Retrieves the currently selected text within a textarea.
     *
     *  @param   {HTMLTextAreaElement} textarea - The DOM textarea element.
     *  @return  {string} The selected text.
     */
    getSelectedContent: function(textarea) {
      if (typeof textarea.selectionStart === 'number') {
        return textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
      } else if (document.selection && document.selection.createRange) {
        return document.selection.createRange().text;
      }
      return '';
    },

    /**
     *  Sets the selection range within a textarea.
     *
     *  @param {HTMLTextAreaElement} textarea - The DOM textarea element.
     *  @param {number} start - The starting index of the selection.
     *  @param {number} end - The ending index of the selection.
     */
    setSelectionRange: function(textarea, start, end) {
      if (typeof textarea.selectionStart === 'number') {
        textarea.selectionStart = start;
        textarea.selectionEnd = end;
      } else if (textarea.createTextRange) {
        const range = textarea.createTextRange();
        range.collapse(true);
        range.moveStart('character', start);
        range.moveEnd('character', end - start);
        range.select();
      }
      textarea.focus(); // Ensure the textarea is focused after setting selection
    }
  };


  /**
   *  InputHintManager
   *  Manages placeholder/hint text for input fields, especially for older browsers
   *  that don't natively support the 'placeholder' attribute.
   */
  const InputHintManager = {
    _activeHints: [], // Stores jQuery objects of inputs with active hints

    /**
     *  Adds placeholder functionality to a jQuery input element.
     *  It uses the 'placeholder' attribute or 'data-placeholder' if available.
     *
     *  @param {jQuery} $inputElement - The jQuery object of the input field.
     */
    add: function($inputElement) {
      // Check for native placeholder support
      if ('placeholder' in document.createElement('input')) {
        traceLog('Native placeholder support detected, skipping custom hint for:', $inputElement.attr('id'));
        return;
      }

      const placeholderText = $inputElement.attr('placeholder') || $inputElement.data('placeholder');
      if (!placeholderText) {
        traceLog('No placeholder text found for input:', $inputElement.attr('id'));
        return;
      }

      if ($inputElement.val() === '') {
        $inputElement.val(placeholderText).addClass('placeholder-active');
        this._activeHints.push($inputElement);
      }

      $inputElement.on('focus.hint', function() {
        if ($(this).val() === placeholderText) {
          $(this).val('').removeClass('placeholder-active');
        }
      }).on('blur.hint', function() {
        if ($(this).val() === '') {
          $(this).val(placeholderText).addClass('placeholder-active');
        }
      });
      traceLog('Custom placeholder added for input:', $inputElement.attr('id'));
    },

    /**
     *  Clears the placeholder text from a specific input field if it's currently displayed.
     *
     *  @param {jQuery} $inputElement - The jQuery object of the input field.
     */
    clear: function($inputElement) {
      if ('placeholder' in document.createElement('input')) {
        return; // Native placeholders don't need clearing
      }

      const placeholderText = $inputElement.attr('placeholder') || $inputElement.data('placeholder');
      if ($inputElement.val() === placeholderText) {
        $inputElement.val('').removeClass('placeholder-active');
      }
      // Remove from active hints list
      this._activeHints = this._activeHints.filter(el => el[0] !== $inputElement[0]);
      $inputElement.off('.hint'); // Remove specific hint event handlers
    },

    /**
     *  Clears placeholder text from all managed input fields.
     */
    clearAll: function() {
      if ('placeholder' in document.createElement('input')) {
        return; // Native placeholders don't need clearing
      }
      traceLog('Clearing all custom placeholders.');
      this._activeHints.forEach($input => this.clear($input));
      this._activeHints = []; // Reset the list
    }
  };

  /**
   *  FormatSwitcher
   *  Manages the content format selection dropdown, allowing users to change
   *  the markup language for the document.
   */
  const FormatSwitcher = {
    _dropdownElement: null, // Stores the jQuery object for the select dropdown

    /**
     *  Initializes the format selection dropdown.
     *
     *  @param {jQuery} $selectElement - The jQuery object of the select dropdown.
     */
    initializeDropdown: function($selectElement) {
      if (!$selectElement || $selectElement.length === 0) {
        traceLog('Format switcher dropdown element not found.', 'error');
        return;
      }
      this._dropdownElement = $selectElement;
      this._dropdownElement.on('change', this.handleFormatChange);
      this.syncSelection(); // Ensure initial selection matches current format
      traceLog('Format switcher dropdown initialized.');
    },

    /**
     *  Event handler for when the format selection dropdown's value changes.
     *
     *  @param {jQuery.Event} event - The jQuery event object.
     */
    handleFormatChange: function(event) {
      const newFormat = $(this).val();
      if (newFormat) {
        traceLog(`Format switcher changed to: ${newFormat}`);
        ContentFormatRegistry.setCurrentFormat(newFormat);
      } else {
        traceLog('Format switcher selected an empty or invalid format.', 'warn');
      }
    },

    /**
     *  Synchronizes the dropdown's selected option with the currently active content format.
     */
    syncSelection: function() {
      if (this._dropdownElement && this._dropdownElement.length) {
        const currentActiveFormat = ContentFormatRegistry.getCurrentFormatIdentifier();
        if (currentActiveFormat && this._dropdownElement.val() !== currentActiveFormat) {
          this._dropdownElement.val(currentActiveFormat);
          traceLog(`Format switcher selection synced to: ${currentActiveFormat}`);
        }
      }
    }
  };

  // Define a base Wiki format object if it doesn't exist, for merging purposes.
  // This can be extended by specific language definitions.
  if (typeof $.WikiPadComposer.BaseWikiFormat === 'undefined') {
    $.WikiPadComposer.BaseWikiFormat = {};
  }


})(jQuery);
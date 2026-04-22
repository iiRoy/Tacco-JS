var Toolkit = {
  PopupBox: function(config) {
    this.contentElement = config.contentElement;
    this._width = config._width || '610px';
    this._height = config._height || 'auto';
    this.boxHTML = $('<table class="utility_popup">\
											<tr>\
												<td colspan="3" class="pb_top_bar"></td>\
											</tr>\
											<tr>\
												<td class="pb_left_column">&nbsp;</td>\
												<td valign="top" style="vertical-align:top; padding:2px;" id="pb_content_area">&nbsp;</td>\
												<td class="pb_right_column">&nbsp;</td>\
											</tr>\
											<tr>\
												<td colspan="3" class="pb_bottom_bar"></td>\
											</tr>\
										</table>');
    this.dismissPopup = function() {
      var boxRef = this.boxHTML;
      this.boxHTML.fadeOut('slow', function() {
        $('#overlay_backdrop').remove();
        boxRef.remove();
      });
      return false;
    };
    this.renderPopup = function() {
      $('#pb_content_area', this.boxHTML).html(this.contentElement);
      var horizPos = ($('body').width() / 2) - (parseInt(this._width) / 2); // Calculate horizontal position
      this.boxHTML.css({
        'width': this._width,
        'height': this._height,
        'position': 'absolute',
        'z-index': 100006,
        'display': 'none',
        'left': horizPos,
        'top': $(document).scrollTop() + 25
      });
      $('body').append(this.boxHTML);
      this.boxHTML.fadeIn('slow');
      return this;
    };
    return this.renderPopup();
  },

  ContentEditor: function(options) {
    /* Initialize editor settings */
    this.settings = options;
    this.widthLimit = options.widthLimit || 600;
    this.showOverlay = options.showOverlay || true;
    this.iconDirectory = options.iconDirectory || "/editor/icons";
    // Assign callback functions
    this.preSaveHook = options.preSave || function(editedContent) {
      return editedContent;
    };
    this.postSaveHook = options.postSave || function() {
      return false;
    };

    // The DOM element currently being edited
    this.targetElement = $(options.element);
    this.originalElement = this.targetElement; // Reference for modal editing

    // Determine editor mode: direct (inline) or dialog (modal)
    this.editMode = options.editMode || ((this.targetElement.width() < this.widthLimit) ? 'dialog' : 'direct');

    /*-------- Editor Core Functionality ---------------*/
    this.createDialogEditor = function() {
      var dialogFrame = $('<div id="dialog_content_editor"></div>');
      var editableArea = $('<div id="editableArea" contenteditable="true"></div>');
      editableArea.html(this.targetElement.html());
      dialogFrame.append(this.toolbar.toolbarHTML);
      dialogFrame.append(editableArea);
      this.popupInstance = new Toolkit.PopupBox({
        _width: 620,
        contentElement: dialogFrame
      });
      this.targetElement = editableArea;
    };

    this.initializeEditor = function() {
      // Create a new toolbar instance and link it to this editor
      this.toolbar = new Toolkit.Toolbar(this);
      if (this.editMode == 'direct') {
        this.attachToolbarToElement();
        this.enableEditing();
      } else {
        this.createDialogEditor();
      }
      if (this.showOverlay) this.displayBackdrop();
      // Store the initial content for potential revert
      this.initialContent = this.targetElement.html();
    };

    this.attachToolbarToElement = function() {
      var elementCoords = this.targetElement.offset();
      this.toolbar.toolbarHTML.attr("id", this.targetElement[0].id + '_content_editor');
      $('body').append(this.toolbar.toolbarHTML);
      // Position the toolbar
      this.toolbar.toolbarHTML.css({
        'position': 'absolute',
        'display': 'none',
        'top': elementCoords.top - 50,
        'left': elementCoords.left,
        'z-index': 1000004,
        'display': 'none',
      });
      this.toolbar.toolbarHTML.fadeIn('slow');
    };

    this.displayBackdrop = function() {
      // If the element's background is transparent, ensure it shows above the overlay.
      var backgroundColor = (this.targetElement.css('background-color') != 'transparent') ? this.targetElement.css('background-color') : '#ffffff';
      $('body').append('<div id="overlay_backdrop"></div>');
      $('#overlay_backdrop').css({
        'background-color': '#000000',
        'height': $(document).height(),
        'left': 0,
        'opacity': 0.75,
        'position': 'absolute',
        'top': 0,
        'width': '100%',
        'z-index': 100003,
        'display': 'none'
      });
      this.targetElement.css({
        'z-index': 1000004,
        'position': 'relative',
        'background': backgroundColor
      });
      $('#overlay_backdrop').fadeIn('slow').click(this.toolbar.discardChanges);
    };

    // Remove click handler and enable content editing
    this.enableEditing = function() {
      this.targetElement.off('click');
      this.targetElement.attr('contenteditable', true);
      return true;
    };

    // Hide toolbar and re-bind original behavior
    this.disableEditing = function() {
      this.toolbar.toolbarHTML.fadeOut('slow');
      $('#overlay_backdrop').fadeOut('slow');
      this.targetElement.attr('contenteditable', false).css('z-index', 100);
      $(this.targetElement).on('click', function() {
        this.currentEditor = new Toolkit.ContentEditor(this.currentEditor.settings);
      });
      return false;
    };
    /*------------------------------------*/

    // Start the editor setup process
    this.initializeEditor();
  },

  Toolbar: function(contentEditor) {
    this.isSourceMode = false;
    // Load all editor actions
    $.extend(this, Toolkit.EditorActions);
    this.targetEditor = contentEditor;
    // This HTML could be passed via configuration options
    this.toolbarHTML = this.targetEditor.settings.toolbarHTML || $('<div class="editor_toolbar" >\
										<a href="#" class="toolbar_button" id="applyBold" alt="Bold Text"><img src="' + this.targetEditor.iconDirectory + '/icn_strong.png" border="0"></a>\
										<a href="#" class="toolbar_button" id="applyItalic" alt="Italic Text"><img src="' + this.targetEditor.iconDirectory + '/icn_italic.png" border="0"></a>\
										<a href="#" class="toolbar_button" id="applyStrikethrough" alt="Strike Through Text"><img src="' + this.targetEditor.iconDirectory + '/icn_strikethrough.png" border="0"></a>\
										<a href="#" class="toolbar_button" id="applyUnderline" alt="Underline Text"><img src="' + this.targetEditor.iconDirectory + '/icn_underline.png" border="0"></a>\
										<a href="#" class="toolbar_button" id="insertParagraph" alt="Insert Paragraph"><img src="' + this.targetEditor.iconDirectory + '/icn_paragraph.png" border="0"></a>\
										<a href="#" class="toolbar_button" id="insertHeading1" alt="Insert H1"><img src="' + this.targetEditor.iconDirectory + '/icn_h1.png" border="0"></a>\
										<a href="#" class="toolbar_button" id="insertHeading2" alt="Insert H2"><img src="' + this.targetEditor.iconDirectory + '/icn_h2.png" border="0"></a>\
										<a href="#" class="toolbar_button" id="insertHeading3" alt="Insert H3"><img src="' + this.targetEditor.iconDirectory + '/icn_h3.png" border="0"></a>\
										<a href="#" class="toolbar_button" id="insertHeading4" alt="Insert H4"><img src="' + this.targetEditor.iconDirectory + '/icn_h4.png" border="0"></a>\
										<a href="#" class="toolbar_button" id="insertPicture" alt="Insert Image"><img src="' + this.targetEditor.iconDirectory + '/icn_image.png" border="0"></a>\
										<a href="#" class="toolbar_button" id="createHyperlink" alt="Insert Link"><img src="' + this.targetEditor.iconDirectory + '/icn_link.png" border="0"></a>\
										<a href="#" class="toolbar_button" id="insertNumberedList" alt="Insert Ordered List"><img src="' + this.targetEditor.iconDirectory + '/icn_list.png" border="0"></a>\
										<a href="#" class="toolbar_button" id="insertBulletedList" alt="Insert Unordered List"><img src="' + this.targetEditor.iconDirectory + '/icn_list.png" border="0"></a>\
										<a href="#" class="toolbar_button" id="toggleSourceMode" alt="Edit HTML Source"><img src="' + this.targetEditor.iconDirectory + '/icn_source.png" border="0"></a>\
										<a href="#" class="toolbar_button" id="saveChanges" alt="Save Content"><img src="' + this.targetEditor.iconDirectory + '/icn_save.png" border="0"></a>\
										<a href="#" class="toolbar_button" id="discardChanges" alt="Cancel Editing"><img src="' + this.targetEditor.iconDirectory + '/icn_cancel.png" border="0"></a>\
									</div>');
    // Bind click events to toolbar buttons
    this.attachHandlers = function() {
      // Assign the current toolbar context
      var menuContext = this;
      $('.toolbar_button', this.toolbarHTML).each(function() {
        $(this).on('click', function() {
          // Methods are bound to DOM elements but executed in the Toolbar's scope
          menuContext[this.id].call(menuContext);
          return false;
        });
      });
    };

    // Finalize editing and trigger callbacks
    this.saveChanges = function() {
      if (this.isSourceModeActive) this.leaveSourceMode();
      // Pre-process content via preSaveHook
      if (contentEditor.editMode == 'direct') {
        contentEditor.targetElement.html(contentEditor.preSaveHook(contentEditor.targetElement.html()));
        contentEditor.disableEditing();
      } else {
        contentEditor.popupInstance.dismissPopup();
        contentEditor.originalElement.html(contentEditor.targetElement.html());
      }
      // Trigger postSaveHook with the final content
      contentEditor.postSaveHook(contentEditor.targetElement.html());
    };

    // Discard changes and revert to original content
    this.discardChanges = function() {
      contentEditor.targetElement.html(contentEditor.initialContent);
      contentEditor.disableEditing();
      if (contentEditor.editMode == 'dialog') contentEditor.popupInstance.dismissPopup();
      return false;
    };

    // Bind the handlers
    this.attachHandlers();
    return this;
  },

  // Core commands for an editable area
  EditorActions: {
    createHyperlink: function() {
      linkUrl = this.promptForInput("Enter URL (e.g., http://example.com):");
      return this.executeCommand('createLink', linkUrl);
    },
    applyBold: function() {
      this.executeCommand('bold', null);
    },
    applyUnderline: function() {
      return this.executeCommand('underline', null);
    },
    applyItalic: function() {
      return this.executeCommand('italic', null);
    },
    applyStrikethrough: function() {
      return this.executeCommand('strikethrough', null);
    },
    applyBlockquote: function() {
      return this.executeCommand('blockquote', null);
    },
    applyTextColor: function(chosenColor) {
      return this.executeCommand('forecolor', chosenColor);
    },
    insertNumberedList: function() {
      return this.executeCommand('insertorderedlist', null);
    },
    insertBulletedList: function() {
      return this.executeCommand('insertunorderedlist', null);
    },
    insertPicture: function() {
      linkUrl = this.promptForInput("Enter image URL (e.g., http://example.com/image.jpg):");
      return this.executeCommand('insertImage', linkUrl);
    },
    insertCustomHTML: function(markupContent) {
      if ($.browser.msie) {
        var selectionRange = this.targetEditor.targetElement._selection.getRange(); // Assuming targetEditor is available
        selectionRange.pasteHTML(markupContent);
        selectionRange.collapse(false);
        selectionRange.select();
      } else {
        var inputMarkup = this.promptForInput('Enter HTML content:');
        return this.executeCommand('insertHTML', inputMarkup);
      }
    },
    insertHeading1: function() {
      return this.executeCommand('FormatBlock', "h1");
    },
    insertHeading2: function() {
      return this.executeCommand('FormatBlock', "h2");
    },
    insertHeading3: function() {
      return this.executeCommand('FormatBlock', "h3");
    },
    insertHeading4: function() {
      return this.executeCommand('FormatBlock', "h4");
    },
    insertParagraph: function() {
      return this.executeCommand('FormatBlock', "p");
    },
    leaveSourceMode: function() {
      this.isSourceModeActive = false;
      var actionContext = this;
      var content = $('#source_code_editor').val().replace(/\n/g, "").replace(/\t/g, "");
      $('#source_code_editor', this.targetEditor.targetElement).replaceWith(content);
      $('#toggleSourceMode', this.toolbarHTML).off('click').on('click', function() {
        actionContext.toggleSourceMode();
        return false;
      });
      return false;
    },
    toggleSourceMode: function() {
      this.isSourceModeActive = true; // Indicate that source mode is active
      var textAreaElement = $('<textarea id="source_code_editor"></textarea>');
      var editableTarget = this.targetEditor.targetElement;
      var currentContent = editableTarget.html();
      var actionScope = this; // Needed for re-binding the button

      /* Wrap the target element's children in the textarea.
         Note: This doesn't automatically move innerHTML, so we set it manually. */
      editableTarget.children().wrapAll(textAreaElement);
      $('#source_code_editor').val(currentContent);
      $('#source_code_editor').css({
        'width': editableTarget.width() - 12,
        'height': editableTarget.height()
      });
      // Bind the exit method to the source mode button
      $('#toggleSourceMode', this.toolbarHTML).off('click').on('click', function() {
        actionScope.leaveSourceMode();
        return false;
      });
    },
    promptForInput: function(messageText) {
      var userResponse = prompt(messageText);
      if (userResponse === "" || userResponse === null) { // Handle empty or cancelled prompt
        return null;
      } else {
        return userResponse;
      }
    },
    executeCommand: function(commandName, commandValue) {
      document.execCommand(commandName, false, commandValue);
      return false;
    }
  }
};
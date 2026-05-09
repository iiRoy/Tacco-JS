(function(jQobj) {

  // Internal helper utilities
  var fetchTextBounds = function(inputControl) {
    if (inputControl.length > 0) {
      let beginOffset = 0,
        endOffset = 0;
      let domElement = inputControl.get(0);

      // Check for modern browser selection APIs
      if (typeof domElement.selectionStart === "number" &&
        typeof domElement.selectionEnd === "number") {
        beginOffset = domElement.selectionStart;
        endOffset = domElement.selectionEnd;
      }
      // Fallback for older IE versions using TextRange
      else {
        let charRange = document.selection.createRange();
        let tempRange = charRange.duplicate();
        tempRange.moveToElementText(domElement);
        tempRange.setEndPoint('EndToEnd', charRange);
        beginOffset = tempRange.text.length - charRange.text.length;
        endOffset = beginOffset + charRange.text.length;

        // Adjust for carriage returns in IE TextRange
        // IE treats '\r\n' as two characters, while JS string length counts it as one '\n'
        let startIdx = beginOffset;
        let newlineCount = 0;
        let loopVar;

        for (loopVar = 0; loopVar < startIdx; loopVar++)
          if (domElement.value.charAt(loopVar) === '\r') ++newlineCount;

        if (newlineCount > 0) {
          beginOffset = beginOffset - newlineCount;
          newlineCount = 0; // Reset for end calculation
        }

        let finishIdx = endOffset;
        for (loopVar = 0; loopVar < finishIdx; loopVar++)
          if (domElement.value.charAt(loopVar) === '\r') ++newlineCount;
        if (newlineCount > 0) endOffset = endOffset - newlineCount;
      }
      return {
        start: beginOffset,
        finish: endOffset
      };
    }
  };

  var retrieveSelection = function(inputControl) {
    let chosenText = '';
    let boundsInfo;

    if (inputControl.length > 0) {
      boundsInfo = fetchTextBounds(inputControl);
      chosenText = inputControl.val().substring(boundsInfo.start, boundsInfo.finish);
      return chosenText;
    }
    return ''; // Return empty string instead of false for consistency with string type
  };

  var substituteTextInField = function(inputControl, newTextSegment, performRehighlight, cursorShiftAmount) {
    let boundsInfo = fetchTextBounds(inputControl);
    let wholeString = inputControl.val();
    let reselectAfterChange = true;
    if (performRehighlight === false) reselectAfterChange = false;

    let verticalScrollPos = null;
    if (inputControl[0].scrollTop) verticalScrollPos = inputControl[0].scrollTop;

    // Update the textarea's value
    inputControl.val(wholeString.substring(0, boundsInfo.start) + newTextSegment + wholeString.substring(boundsInfo.finish));
    inputControl[0].focus();

    if (reselectAfterChange) {
      // Modern browser selection
      if (inputControl[0].setSelectionRange) {
        if (cursorShiftAmount !== undefined && cursorShiftAmount !== null) {
          inputControl[0].setSelectionRange(boundsInfo.start + cursorShiftAmount, boundsInfo.start + cursorShiftAmount);
        } else {
          inputControl[0].setSelectionRange(boundsInfo.start, boundsInfo.start + newTextSegment.length);
        }
      }
      // IE TextRange selection
      else if (inputControl[0].createTextRange) {
        let charRange = inputControl[0].createTextRange();
        charRange.collapse(true); // Collapse to start
        if (cursorShiftAmount !== undefined && cursorShiftAmount !== null) {
          charRange.moveEnd('character', boundsInfo.start + cursorShiftAmount);
          charRange.moveStart('character', boundsInfo.start + cursorShiftAmount);
        } else {
          charRange.moveEnd('character', boundsInfo.start + newTextSegment.length);
          charRange.moveStart('character', boundsInfo.start);
        }
        charRange.select();
      }
    }

    if (verticalScrollPos !== null) {
      // Restore scroll position, sometimes jumps in Firefox
      inputControl[0].scrollTop = verticalScrollPos;
    }
  };

  var highlightFullLine = function(inputControl) {
    let boundsInfo = fetchTextBounds(inputControl);
    let domElement = inputControl.get(0);
    let loopVar;
    // Iterate backwards from selection start to find the beginning of the line
    for (loopVar = boundsInfo.start - 1; loopVar >= 0; loopVar--)
      if (domElement.value.charAt(loopVar) === '\n') break;
    loopVar++; // Move past the newline character
    inputControl[0].setSelectionRange(loopVar, boundsInfo.finish);
  };

  // Public exposed functionality for the editor
  jQobj.mdEditorUtil = {};
  jQobj.mdEditorUtil.runEditAction = function(uiEditor, findRegex, substituteString, applyToWholeLine, postFixString) {
    let textareaElement = uiEditor.find('textarea');
    if (applyToWholeLine) highlightFullLine(textareaElement);
    let editorValue = textareaElement.val(); // Current full text content
    let boundsInfo = fetchTextBounds(textareaElement);
    let chosenText = retrieveSelection(textareaElement);
    let processedText = chosenText;
    let reselectAfterChange = true;
    let caretPosition = null;

    if (findRegex && substituteString) {
      processedText = processedText.replace(findRegex, substituteString);
      // Remove backreferences like $1, $2 etc.
      processedText = processedText.replace(/\$[\d]/g, '');
      if (processedText === '') {
        caretPosition = substituteString.indexOf('$1');

        processedText = substituteString.replace(/\$[\d]/g, '');
        if (caretPosition === -1) caretPosition = Math.floor(substituteString.length / 2); // Default to middle
      }
    }

    if (postFixString) {
      if (processedText === chosenText) reselectAfterChange = false; // Only reselect if text actually changed
      processedText += postFixString;
    }
    if (processedText !== undefined && processedText !== null) substituteTextInField(textareaElement, processedText, reselectAfterChange, caretPosition);
    uiEditor.find(".editor-content-area").keyup(); // Trigger keyup for live preview updates
  };

  var renderToolbar = function(inputControl) {
    inputControl.before('\
      <div class="control-panel">\
        <div class="action-buttons">\
          <a href="#" class="action-strong action-btn">\
            <span>Strong</span></a>\
          <a href="#" class="action-emphasis action-btn">\
            <span>Emphasis</span></a>\
          <a href="#" class="action-code-block action-btn">\
            <span>Code Block</span></a>\
          <span class="action-separator">&nbsp;</span>\
          <a href="#" class="action-unordered-list action-btn">\
            <span>Unordered List</span></a>\
          <a href="#" class="action-ordered-list action-btn">\
            <span>Ordered List</span></a>\
          <a href="#" class="action-quote action-btn">\
            <span>Quote Block</span></a>\
          <a href="#" class="action-horizontal-rule action-btn">\
            <span>Horizontal Separator</span></a>\
          <span class="action-separator">&nbsp;</span>\
          <a href="#" class="action-heading-one action-btn">\
            <span>H1</span></a>\
          <a href="#" class="action-heading-two action-btn">\
            <span>H2</span></a>\
          <a href="#" class="action-heading-three action-btn">\
            <span>H3</span></a>\
          <span class="action-separator">&nbsp;</span>\
          <a href="#" class="action-hyperlink action-btn">\
            <span>Hyperlink</span></a>\
          <a href="#" class="action-picture action-btn">\
            <span>Picture</span></a>\
          <span class="action-separator">&nbsp;</span>\
          <a href="#" class="action-help-info action-btn">\
            <span>Help Info</span></a>\
        </div>\
      </div>');
  };

  var setupInteractions = function(uiEditor) {
    let markdownProcessor = new Showdown.converter(); // Markdown to HTML converter
    uiEditor
      .delegate(".action-btn", "click", function(eventObj) {
        eventObj.preventDefault(); // Prevent default link behavior
      })
      .delegate(".action-strong", "click", function() {
        jQobj.mdEditorUtil.runEditAction(uiEditor, /([^\n]+)([\n\s]*)/g, "**$1**$2");
      })
      .delegate(".action-emphasis", "click", function() {
        jQobj.mdEditorUtil.runEditAction(uiEditor, /([^\n]+)([\n\s]*)/g, "_$1_$2");
      })
      .delegate(".action-code-block", "click", function() {
        jQobj.mdEditorUtil.runEditAction(uiEditor, /([\s\S]*)/, "`$1`");
      })
      .delegate(".action-horizontal-rule", "click", function() {
        jQobj.mdEditorUtil.runEditAction(uiEditor, false, false, false, "\n---\n");
      })
      .delegate(".action-unordered-list", "click", function() {
        jQobj.mdEditorUtil.runEditAction(uiEditor, /(.+)([\n]?)/g, "* $1$2", true);
      })
      .delegate(".action-ordered-list", "click", function() {
        let orderNum = 0;
        jQobj.mdEditorUtil.runEditAction(uiEditor, /(.+)([\n]?)/g, function(str, p1, p2, offset, s) {
          return ++orderNum + ". " + p1 + p2
        }, true);
      })
      .delegate(".action-quote", "click", function() {
        jQobj.mdEditorUtil.runEditAction(uiEditor, /(.+)([\n]?)/g, "> $1$2");
      })
      .delegate(".action-heading-one", "click", function() {
        jQobj.mdEditorUtil.runEditAction(uiEditor, /(.+)([\n]?)/g, "# $1$2", true);
      })
      .delegate(".action-heading-two", "click", function() {
        jQobj.mdEditorUtil.runEditAction(uiEditor, /(.+)([\n]?)/g, "## $1$2", true);
      })
      .delegate(".action-heading-three", "click", function() {
        jQobj.mdEditorUtil.runEditAction(uiEditor, /(.+)([\n]?)/g, "### $1$2", true);
      })
      .delegate(".action-hyperlink", "click", function() {
        console.log("Editor reference:", uiEditor); // Log editor for debugging
        jQobj.facebox('<div id="md-edit-dialog"><h4>Insert Hyperlink</h4><fieldset><div class="field-item"><label for="Link Text">Link Text</label><input type="text" class="text-input" value="' + retrieveSelection(uiEditor.find(".editor-content-area")) + '"></div><div class="field-item"><label for="URL">URL</label><input type="text" class="url-input"></div></fieldset><div class="dialog-actions"><a href="#" title="Cancel" class="cancel-btn mini-btn">Cancel</a><a href="#" title="OK" class="ok-btn mini-btn">OK</a></div></div>');
        jQobj("#md-edit-dialog").data("editorInstance", uiEditor); // Store editor reference
      });

    jQobj("body").delegate(".ok-btn", "click", function() {
      let currentDialog = jQobj(this).closest("#md-edit-dialog");
      let linkUrl = currentDialog.find(".url-input").val();
      let linkText = currentDialog.find(".text-input").val();
      if (linkUrl && linkText)
        jQobj.mdEditorUtil.runEditAction(currentDialog.data("editorInstance"), /([\s\S]*)/, '[' + linkText + '](' + linkUrl + ')');
      jQobj.facebox.close();
    });

    jQobj("body").delegate(".cancel-btn", "click", function() {
      jQobj.facebox.close();
    });

    uiEditor.find('.preview-toggle').on("click", function() {
      jQobj.facebox('<div class="preview-output">' + markdownProcessor.makeHtml(uiEditor.find('.editor-content-area').val()) + '</div>');
    });
    uiEditor.find('.editor-content-area').on('keyup', function() {
      let currentText = uiEditor.find('.editor-content-area').val();
      let generatedHtml = markdownProcessor.makeHtml(currentText);
      uiEditor.find(".live-preview-pane").html(generatedHtml);
    });
  };

  // jQuery plugin definition
  let pluginFunctions = {
    initializePlugin: function(configSettings) {
      let chainableObj = this.each(function() {
        if (configSettings) {
          jQobj.extend(currentSettings, configSettings); // Merge user options
        }
        jQobj(this).addClass('editor-content-area');
        // Add editor class to parent fieldset or form
        if (jQobj(this).closest('fieldset').length > 0) jQobj(this).closest('fieldset').addClass('md-editor-wrapper');
        else jQobj(this).closest('form').addClass('md-editor-wrapper');
        renderToolbar(jQobj(this));
        setupInteractions(jQobj(this).closest(".md-editor-wrapper"));
      });
      return chainableObj;
    },
    attachControls: function() {
      this.each(function() {
        renderToolbar(jQobj(this));
      });
    }
  };

  // Main plugin entry point
  jQobj.fn.richTextEditor = function(operationKey) {
    let currentSettings = {
      'toolbar-layout': 'standard' // Default toolbar layout
    };
    if (pluginFunctions[operationKey]) return pluginFunctions[operationKey].apply(this, Array.prototype.slice.call(arguments, 1));

    else if (typeof operationKey === 'object' || !operationKey)
      return pluginFunctions.initializePlugin.apply(this, arguments);
    else
      jQobj.error('Method ' + operationKey + ' does not exist on jQobj.fn.richTextEditor');
  };

})(jQuery);
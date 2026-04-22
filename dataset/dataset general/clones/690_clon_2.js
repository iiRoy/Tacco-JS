(function(jQ){
  // Determine if the user's browser engine is WebKit-based
  var isAppleEngine = !!~navigator.userAgent.indexOf(' Safari/');

  jQ.fn.shell = function(params){
    /*
     *  Core Definitions
     *  Some are enumerations, others are data structures, and some are for efficiency
     */
    var inputKeyMap = {
      // Move cursor to the left
      37: shiftLeft,
      // Move cursor to the right
      39: shiftRight,
      // Retrieve the previous command from history
      38: prevCommandEntry,
      // Retrieve the next command from history
      40: nextCommandEntry,
      // Delete the character before the caret
      8:  deletePrevChar,
      // Delete the character at the caret
      46: deleteNextChar,
      // Jump caret to the end of the line
      35: jumpToEnd,
      // Jump caret to the start of the line
      36: jumpToStart,
      // Execute the current command
      13: executeInput,
      // Perform no action for this key
      18: performNoOp,
      // Attempt command auto-completion
      9: autoComplete
    };
    var controlKeyMap = {
      // Ctrl-a: Jump to start of line
      65: jumpToStart,
      // Ctrl-e: Jump to end of line
      69: jumpToEnd,
      // Ctrl-d: Delete character at caret
      68: deleteNextChar,
      // Ctrl-n: Next history entry
      78: nextCommandEntry,
      // Ctrl-p: Previous history entry
      80: prevCommandEntry,
      // Ctrl-b: Move caret left
      66: shiftLeft,
      // Ctrl-f: Move caret right
      70: shiftRight,
      // Ctrl-k: Erase from caret to end of line
      75: eraseToEnd
    };
    if(params.ctrlKeyMap) {
      jQ.extend(controlKeyMap, params.ctrlKeyMap);
    }
    var metaKeyMap = {
      // Alt-f: Move to next word
      70: jumpToNextWord,
      // Alt-b: Move to previous word
      66: jumpToPrevWord,
      // Alt-d: Delete next word
      68: removeNextWord
    };
    var shiftKeyMap = {
      // Shift-Enter: Insert a new line
      13: insertNewline,
    };
    var caretSymbol = '<span class="jq-term-caret">&nbsp;</span>';

    /*
     *  Global State Variables
     */
    var mainContainer = jQ(this);
    var internalDisplay = jQ('<div class="jq-term-interior"></div>');
    // Developer note: The input field was changed from a text input to a textarea to correctly handle pasted multi-line content.
    var inputArea = jQ('<textarea autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" class="jq-term-typefield"></textarea>');
    // The current command entry box
    var entryBox;
    var currentInput;
    var subsequentPromptText = params && params.continuedPromptLabel ?
      params.continuedPromptLabel : "> ";
    var caretPosition = 0;
    var currentLineContent = '';
    var savedLineContent = '';
    var multilineContent = '';
    var animateOnClear = params.fadeOnReset !== undefined ? params.fadeOnReset : true;
    // Command history archive
    var commandArchive = [];
    var archiveIndex = 0;
    // For reasons unknown to the celestial beings, Opera will trigger keypress events for control keys.
    // This variable helps to suppress keypress handling if keydown already processed the event.
    var suppressKeyEvent = 0;
    // If false, the shell will not process user input.
    var allowEntry = true;
    // If true, the current command execution has been cancelled.
    var abortOperation = false;

    // Object to expose internal functions to external scripts
    var exposedAPI = {};

    /*
     *  Initialization Procedure
     */
    (function(){
      exposedAPI.entryLabel = params && params.promptLabel ? params.promptLabel : "> ";
      mainContainer.append(internalDisplay);
      internalDisplay.append(inputArea);
      inputArea.css({position:'absolute',top:0,left:'-9999px'});
      if (params.welcomeMessage)
	displayMessage(params.welcomeMessage,'jq-term-greeting');
      createNewEntryBox();
      if (params.autofocus) {
	internalDisplay.addClass('jq-term-focused');
	inputArea.focus();
	setTimeout(function(){
	  internalDisplay.addClass('jq-term-focused');
	  inputArea.focus();
	},100);
      }
      exposedAPI.internalDisplay = internalDisplay;
      exposedAPI.inputArea = inputArea;
      exposedAPI.scrollDisplayDown = scrollDisplayDown;
      exposedAPI.emitReport = function() {}; // Placeholder for report function
    })();

    /*
     *  Clear the terminal display
     */
    exposedAPI.clearTerminal = function(){
      var hasGreeting = (typeof params.welcomeMessage != 'undefined');

      var purgeElements = function() {
	internalDisplay.find('div').each(function(){
	  if (!hasGreeting) {
	    jQ(this).remove();
	  } else {
	    hasGreeting = false;
	  }
	});
      };

      if (animateOnClear) {
	internalDisplay.parent().fadeOut(function() {
	  purgeElements();
	  createNewEntryBox();
	  internalDisplay.parent().fadeIn(setConsoleFocus);
	});
      }
      else {
	purgeElements();
	createNewEntryBox();
	setConsoleFocus();
      }
    };

    var setConsoleFocus = function() {
      internalDisplay.addClass('jq-term-focused');
      inputArea.focus();
    };

    exposedAPI.gainFocus = function(){
      setConsoleFocus();
    }

    /*
     *  Display a temporary notification message
     */
    exposedAPI.showNotification = function(messageContent,notificationStyle){
      var notificationDiv = jQ('<div class="alert-box"></div>').append(jQ('<div></div>').text(messageContent))
	.css({visibility:'hidden'});
      mainContainer.append(notificationDiv);
      var isFocused = true;
      if (notificationStyle=='fadeout')
	setTimeout(function(){
	  notificationDiv.fadeOut(function(){
	    notificationDiv.remove();
	  });
	},4000);
      else if (notificationStyle=='prompt') {
	var actionLink = jQ('<br/><div class="alert-action"><a href="javascript:">OK</a><div class="clear-float"></div></div>');
	notificationDiv.append(actionLink);
	isFocused = false;
	actionLink.click(function(){ notificationDiv.fadeOut(function(){ notificationDiv.remove();internalDisplay.css({opacity:1}) }); });
      }
      var boxHeight = notificationDiv.height();
      notificationDiv.css({height:'0px',visibility:'visible'})
	.animate({height:boxHeight+'px'},function(){
	  if (!isFocused) internalDisplay.css({opacity:0.5});
	});
      notificationDiv.css('cursor','default');
      return notificationDiv;
    };

    /*
     *  Create a fresh input entry box
     */
    function createNewEntryBox() {
      caretPosition = 0;
      currentLineContent = '';
      archiveIndex = 0; // Reset history position
      activateInput();
      entryBox = jQ('<div class="jq-term-entry-container"></div>');
      var entryLabelSpan = jQ('<span class="jq-term-entry-label"></span>');
      var currentLabelText = exposedAPI.isMultilinePrompt ? subsequentPromptText : exposedAPI.entryLabel;
      entryBox.append(entryLabelSpan.text(currentLabelText).show());
      entryLabelSpan.html(entryLabelSpan.html().replace(' ','&nbsp;'));
      currentInput = jQ('<span class="jq-term-current-input"></span>');
      entryBox.append(currentInput);
      internalDisplay.append(entryBox);
      refreshInputDisplay();
    };

    /*
     *  Handle focus events for the main container
     */
    mainContainer.click(function(){
      // Do not interfere with focus if text is actively selected
      if (document.getSelection().toString()) {
	return false;
      }

      internalDisplay.addClass('jq-term-focused');
      internalDisplay.removeClass('jq-term-unfocused');
      if (isAppleEngine) {
	inputArea.focusWithoutOffset();
      } else {
	inputArea.css('position', 'fixed').focus();
      }
      scrollDisplayDown();
      return false;
    });

    /*
     *  Handle loss of focus for the input area
     */
    inputArea.blur(function(){
      internalDisplay.removeClass('jq-term-focused');
      internalDisplay.addClass('jq-term-unfocused');
    });

    /*
     *  Bind to the paste event to capture pasted data
     */
    inputArea.bind('paste', function(keyEvent) {
      // Clear the input area to ensure only pasted content is captured
      inputArea.val("");
      // This timeout is crucial as the 'paste' event fires BEFORE the text is actually inserted.
      setTimeout(function() {
	inputArea.insertContent(inputArea.val());
	inputArea.val("");
      }, 0);
    });

    /*
     *  Process key presses before character translation
     *  Used for special keys like arrow keys, home, end, etc.
     */

    inputArea.keydown(function(keyEvent){
      suppressKeyEvent = 0;
      var eventKeyCode = keyEvent.keyCode;
      // Ctrl-c: Cancel current operation
      if(keyEvent.ctrlKey && eventKeyCode == 67) {
	suppressKeyEvent = eventKeyCode;
	abortCurrentExecution();
	return false;
      }
      if (allowEntry) {
	if (keyEvent.shiftKey && eventKeyCode in shiftKeyMap) {
	  suppressKeyEvent = eventKeyCode;
	  (shiftKeyMap[eventKeyCode])();
	  return false;
	} else if (keyEvent.altKey  && eventKeyCode in metaKeyMap) {
	  suppressKeyEvent = eventKeyCode;
	  (metaKeyMap[eventKeyCode])();
	  return false;
	} else if (keyEvent.ctrlKey && eventKeyCode in controlKeyMap) {
	  suppressKeyEvent = eventKeyCode;
	  (controlKeyMap[eventKeyCode])();
	  return false;
	} else if (eventKeyCode in inputKeyMap) {
	  suppressKeyEvent = eventKeyCode;
	  (inputKeyMap[eventKeyCode])();
	  return false;
	}
      }
    });

    /*
     *  Process character input
     */
    inputArea.keypress(function(keyEvent){
      var eventKeyCode = keyEvent.keyCode || keyEvent.which;
      if (shouldIgnoreKey(keyEvent)) {
	return false;
      }
      // Ctrl-v: Do not insert character on paste event; handled separately
      if ((keyEvent.ctrlKey || keyEvent.metaKey) && String.fromCharCode(eventKeyCode).toLowerCase() == 'v') {
	return true;
      }
      if (allowEntry && suppressKeyEvent != eventKeyCode && eventKeyCode >= 32){
	if (suppressKeyEvent) return false;
	if (
	  typeof params.charInputHook == 'undefined' || (
	    typeof params.charInputHook == 'function' &&
	      params.charInputHook(eventKeyCode,currentLineContent)
	  )
	){
	  inputArea.insertContent(eventKeyCode);
	}
      }
      if (isAppleEngine) return false;
    });

    function shouldIgnoreKey(keyEvent) {
      // Filter out Alt+Tab key combinations, which can occur when switching windows
      return ((keyEvent.keyCode == inputKeyMap.tab || keyEvent.keyCode == 192) && keyEvent.altKey);
    };

    /*
     *  Navigate through the command history buffer
     */
    function cycleCommandArchive(direction){
      if (commandArchive.length == 0) return;
      archiveIndex += direction;
      if (archiveIndex < 0) archiveIndex = commandArchive.length;
      else if (archiveIndex > commandArchive.length) archiveIndex = 0;
      var oldContent = currentLineContent;
      if (archiveIndex == 0) {
	currentLineContent = savedLineContent;
      } else {
	currentLineContent = commandArchive[archiveIndex - 1];
      }
      if (params.keepCaretPosition) {
	if (currentLineContent.length < caretPosition + 1) {
	  caretPosition = currentLineContent.length;
	} else if (caretPosition == 0) {
	  caretPosition = currentLineContent.length;
	}
      } else {
	caretPosition = currentLineContent.length;
      }
      refreshInputDisplay();
    };

    function prevCommandEntry() {
      cycleCommandArchive(-1);
    };

    function nextCommandEntry() {
      cycleCommandArchive(1);
    };

    // Add a command to the history archive
    function addEntryToArchive(inputLine){
      commandArchive.push(inputLine);
      savedLineContent = '';
    };

    // Remove the character at the current caret position
    function removeCharAtIndex(){
      if (caretPosition < currentLineContent.length){
	currentLineContent =
	  currentLineContent.substring(0,caretPosition) +
	  currentLineContent.substring(caretPosition+1);
	savedLineContent = currentLineContent;
	return true;
      } else return false;
    };

    function deletePrevChar() {
      if (shiftCaret(-1)){
	removeCharAtIndex();
	refreshInputDisplay();
      }
    };

    function deleteNextChar() {
      if (removeCharAtIndex()){
	refreshInputDisplay();
      }
    };

    function eraseToEnd() {
      while(removeCharAtIndex()) {
	refreshInputDisplay();
      }
    };

    function removeNextWord() {
      // A word is defined here as a sequence of alphanumeric characters.
      // First, delete non-alphanumeric characters until an alphanumeric one is found.
      while(
	caretPosition < currentLineContent.length &&
	  !isAlphaNumericChar(currentLineContent[caretPosition])
      ) {
	removeCharAtIndex();
	refreshInputDisplay();
      }
      // Then, delete alphanumeric characters until a non-alphanumeric one is encountered.
      while(
	caretPosition < currentLineContent.length &&
	  isAlphaNumericChar(currentLineContent[caretPosition])
      ) {
	removeCharAtIndex();
	refreshInputDisplay();
      }
    };

    function insertNewline() {
      var segments = currentLineContent.split("\n");
      var lastSegment = segments.slice(-1)[0];
      var leadingSpaces = lastSegment.match(/^(\s*)/g)[0];
      var insertedLine = "\n" + leadingSpaces;
      currentLineContent += insertedLine;
      shiftCaret(insertedLine.length);
      refreshInputDisplay();
    };

    /*
     *  Validate and execute the current command
     */
    function executeInput() {
      var inputString = currentLineContent;
      if (typeof params.inputValidator == 'function') {
	var validationResult = params.inputValidator(inputString);
	if (validationResult == true || validationResult == false) {
	  if (validationResult) {
	    processCommand();
	  }
	} else {
	  displayCommandResult(validationResult,"jq-term-msg-error");
	}
      } else {
	processCommand();
      }
    };

    // Scroll the terminal display to the very bottom
    function scrollDisplayDown() {
      var jqVersion = jQuery.fn.jquery.split('.');
      var mainVersion = parseInt(jqVersion[0]);
      var subVersion = parseInt(jqVersion[1]);

      // Check for jQuery versions greater than 1.6
      if ((mainVersion == 1 && subVersion > 6) || mainVersion > 1) {
	internalDisplay.prop({ scrollTop: internalDisplay.prop("scrollHeight") });
      }
      else {
	internalDisplay.attr({ scrollTop: internalDisplay.attr("scrollHeight") });
      }
    };

    function abortCurrentExecution() {
      if(typeof params.cancellationHandler == 'function') {
	params.cancellationHandler();
      }
    }

    /*
     *  Process the command after validation
     */
    function processCommand() {
      if (typeof params.commandProcessor == 'function') {
	deactivateInput();
	addEntryToArchive(currentLineContent);
	var commandText = currentLineContent;
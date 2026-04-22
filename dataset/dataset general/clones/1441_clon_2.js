/*
 * Command Line Interface Widget 1.0.0
 * Release Date: Thursday, March 14, 2024
 *
 * (C) 2024, ACME Corp. All rights reserved.
 *
 * This software is provided under the following terms and conditions:
 *
 *    1. Redistribution of source code must preserve the above
 *       copyright notice, this list of conditions, and the disclaimer below.
 *
 *    2. Redistribution in binary form must reproduce the above
 *       copyright notice, this list of conditions, and the disclaimer below
 *       within accompanying documentation or other materials distributed.
 *
 * THIS SOFTWARE IS FURNISHED "AS IS" AS-IS, WITHOUT ANY EXPRESS OR IMPLIED
 * WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE. IN NO EVENT SHALL
 * THE COPYRIGHT HOLDERS OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
 * WITHOUT LIMITATION, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
 * OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 * EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/*
 * Validated Across These Browsers:
 *   Microsoft Edge 120
 *   Mozilla Firefox 123
 *   Google Chrome 122
 *   Apple Safari 17.3.1
 *   Opera One 107
 */

(function(_lib){
	var _isChromeLike = !!~navigator.userAgent.indexOf(' AppleWebKit/');

	_lib.fn.terminalWidget = function(_opts){
		/******************************************************************
		 * Configuration Elements
		 * These include enumerated values, data types, and performance aids.
		 ******************************************************************/
		var _keyMapInputs = {
			// Move cursor one character left
			37: _shiftLeft,
			// Move cursor one character right
			39: _shiftRight,
			// Retrieve prior command from history
			38: _prevEntry,
			// Retrieve next command from history
			40: _nextEntry,
			// Delete character before cursor
			8:  _deleteBackward,
			// Delete character at cursor
			46: _deleteForward,
			// Move cursor to end of line
			35: _goToEnd,
			// Move cursor to start of line
			36: _goToStart,
			// Submit current command
			13: _executeCommand,
			// No operation for special key
			18: _noop,
			// Attempt command completion
			9: _performCompletion
		};
		var _ctrlMapInputs = {
			// Ctrl-A: Go to line start
			65: _goToStart,
			// Ctrl-E: Go to line end
			69: _goToEnd,
			// Ctrl-D: Delete character at cursor
			68: _deleteForward,
			// Ctrl-N: Next history entry
			78: _nextEntry,
			// Ctrl-P: Previous history entry
			80: _prevEntry,
			// Ctrl-B: Move cursor back
			66: _shiftLeft,
			// Ctrl-F: Move cursor forward
			70: _shiftRight,
			// Ctrl-K: Delete from cursor to end of line
			75: _eraseToEnd
		};
		var _altMapInputs = {
			// Alt-F: Jump to next word
			70: _jumpToNextWord,
			// Alt-B: Jump to previous word
			66: _jumpToPrevWord,
			// Alt-D: Delete next word
			68: _eraseNextWord
		};
		var _caretSpan = '<span class="terminal-caret-indicator">&nbsp;</span>';

		/******************************************************************
		 * Runtime Variables
		 * These variables manage the state of the terminal widget.
		 ******************************************************************/
		var _wrapperElement = _lib(this);
		var _innerContainer = _lib('<div class="terminal-inner-shell"></div>');
		// Note: Switched from text input to textarea to handle multiline paste operations.
		var _inputArea = _lib('<textarea class="terminal-input-field"></textarea>');
		// Current input line display box
		var _currentLineDiv;
		var _currentLineSpan;
		var _defaultPrefix = _opts && _opts.promptLabel ? _opts.promptLabel : ">>> ";
		var _continuationPrefix = _opts && _opts.continuedPromptLabel ?
		_opts.continuedPromptLabel : "... ";
		var _currentPosition = 0;
		var _currentInput = '';
		var _tempInputBuffer = '';
		var _multiLineInput = '';
		// Ring buffer for command history
		var _commandHistory = [];
		var _historyIndex = 0;
		// A flag to prevent duplicate key processing in certain browsers (e.g., Opera).
		// Some browsers fire both keydown and keypress for special keys; this ensures
		// the keypress event is ignored if keydown already handled it.
		var _ignoreNextKey = 0;
		// When this flag is false, user input is ignored.
		var _acceptUserEntry = true;
		// When true, the current command execution has been canceled.
		var _isCommandCancelled = false;

		// Publicly exposed methods and properties
		var _publicAPI = {};

		/******************************************************************
		 * Initialization Block
		 * Executes immediately when the widget is created.
		 ******************************************************************/
		(function(){
			_wrapperElement.append(_innerContainer);
			_innerContainer.append(_inputArea);
			_inputArea._applyStyles({position:'absolute',top:0,left:'-9999px'});
			if (_opts.welcomeMessage)
				_displayOutput(_opts.welcomeMessage,'terminal-welcome-message');
			_createNewPrompt();
			if (_opts.autofocus) {
				_innerContainer._addStyleClass('terminal-focus-state');
				_inputArea._setFocus();
				_delayAction(function(){
					_innerContainer._addStyleClass('terminal-focus-state');
					_inputArea._setFocus();
				},100);
			}
			_publicAPI.inner = _innerContainer;
			_publicAPI.typer = _inputArea;
			_publicAPI.scrollWidgetToBottom = _scrollWidgetToBottom;
		})();

		/******************************************************************
		 * Widget Reset Functionality
		 * Clears the terminal output and resets to an initial state.
		 ******************************************************************/
		_publicAPI.reset = function(){
			var _hasWelcomeMsg = (_checkType(_opts.welcomeMessage) != 'undefined');
			_innerContainer._getParent()._fadeAway(function(){
				_innerContainer._findChildren('div')._forEachItem(function(){
					if (!_hasWelcomeMsg) {
						_lib(this)._deleteElement();
			} else {
			_hasWelcomeMsg = false;
			}
				});
				_createNewPrompt();
				_innerContainer._getParent()._fadeIntoView(function(){
					_innerContainer._addStyleClass('terminal-focus-state');
					_inputArea._setFocus();
				});
			});
		};

		/******************************************************************
		 * Display a Notice Message
		 * Shows a temporary or interactive notification.
		 ******************************************************************/
		_publicAPI.notice = function(_messageContent,_styleType){
			var _notificationDiv = _lib('<div class="notification-area"></div>')._appendContent(_lib('<div></div>')._updateText(_messageContent))
				._applyStyles({visibility:'hidden'});
			_wrapperElement.append(_notificationDiv);
			var _isFocused = true;
			if (_styleType=='fadeout')
				_delayAction(function(){
					_notificationDiv._fadeAway(function(){
						_notificationDiv._deleteElement();
					});
				},4000);
			else if (_styleType=='prompt') {
				var _actionDiv = _lib('<br/><div class="action-buttons"><a href="javascript:">OK</a><div class="clear-float"></div></div>');
				_notificationDiv.append(_actionDiv);
				_isFocused = false;
				_actionDiv._onMouseClick(function(){ _notificationDiv._fadeAway(function(){ _notificationDiv._deleteElement();_innerContainer._applyStyles({opacity:1}) }); });
			}
			var _divHeight = _notificationDiv.height();
			_notificationDiv._applyStyles({height:'0px',visibility:'visible'})
				._animateProperty({height:_divHeight+'px'},function(){
					if (!_isFocused) _innerContainer._applyStyles({opacity:0.5});
				});
			_notificationDiv._applyStyles('cursor','default');
			return _notificationDiv;
		};

		/******************************************************************
		 * Create a New Prompt Line
		 * Resets the input area and prepares for a new command.
		 ******************************************************************/
		function _createNewPrompt() {
			_currentPosition = 0;
			_currentInput = '';
			_historyIndex = 0; // Reset history position
			_unlockInput();
			_currentLineDiv = _lib('<div class="terminal-prompt-entry"></div>');
			var _prefixSpan = _lib('<span class="terminal-prompt-prefix"></span>');
			var _prefixText = _publicAPI.continuedPrompt ? _continuationPrefix : _defaultPrefix;
			_currentLineDiv._appendContent(_prefixSpan._updateText(_prefixText)._makeVisible());
			_prefixSpan._updateHTML(_prefixSpan._updateHTML().replace(' ','&nbsp;'));
			_currentLineSpan = _lib('<span class="terminal-current-input"></span>');
			_currentLineDiv._appendContent(_currentLineSpan);
			_innerContainer._appendContent(_currentLineDiv);
			_refreshPromptView();
		};

		/******************************************************************
		 * Handle Focus Event
		 * When the terminal area is clicked, set focus to the hidden input.
		 ******************************************************************/
		_wrapperElement._onMouseClick(function(){
			_innerContainer._addStyleClass('terminal-focus-state');
			_innerContainer._removeStyleClass('terminal-no-focus');
			if (_isChromeLike) {
				_inputArea.focusWithoutScrolling();
			} else {
				_inputArea._applyStyles('position', 'fixed')._setFocus();
			}
			_scrollWidgetToBottom();
			return false;
		});

		/******************************************************************
		 * Handle Blur Event
		 * When the hidden input loses focus, update terminal styling.
		 ******************************************************************/
		_inputArea._onFocusLost(function(){
			_innerContainer._removeStyleClass('terminal-focus-state');
			_innerContainer._addStyleClass('terminal-no-focus');
		});

		/******************************************************************
		 * Handle Paste Event
		 * Captures pasted data into the input field.
		 ******************************************************************/
		_inputArea._attachEvent('paste', function(_eventData) {
			// Clear the input field just in case
			_inputArea._getValue("");
			// This timeout is essential because the 'paste' event fires
			// *before* the actual text is inserted into the textarea.
			_delayAction(function() {
				_inputArea.insertCharacter(_inputArea._getValue());
				_inputArea._getValue("");
			}, 0);
		});

		/******************************************************************
		 * Keydown Event Handler
		 * Processes keys before character translation, useful for control keys.
		 ******************************************************************/

		_inputArea._onKeyDown(function(_eventData){
			_ignoreNextKey = 0;
			var _pressedCode = _eventData.keyCode;
			// Ctrl-C: Interrupt current operation
			if(_eventData.ctrlKey && _pressedCode == 67) {
				_ignoreNextKey = _pressedCode;
				_abortExecution();
				return false;
			}
			if (_acceptUserEntry) {
				if (_pressedCode in _keyMapInputs) {
					_ignoreNextKey = _pressedCode;
					(_keyMapInputs[_pressedCode])();
					return false;
				} else if (_eventData.ctrlKey && _pressedCode in _ctrlMapInputs) {
					_ignoreNextKey = _pressedCode;
					(_ctrlMapInputs[_pressedCode])();
					return false;
				} else if (_eventData.altKey  && _pressedCode in _altMapInputs) {
					_ignoreNextKey = _pressedCode;
					(_altMapInputs[_pressedCode])();
					return false;
				}
			}
		});

		/******************************************************************
		 * Keypress Event Handler
		 * Processes character input.
		 ******************************************************************/
		_inputArea._onKeyPress(function(_eventData){
			var _pressedCode = _eventData.keyCode || _eventData.which;
			if (_isKeyIgnorable(_eventData)) {
				return false;
			}
			// Ctrl-V: Do not insert character on paste event; handled by 'paste' event.
			if ((_eventData.ctrlKey || _eventData.metaKey) && String.fromCharCode(_pressedCode).toLowerCase() == 'v') {
				return true;
			}
			if (_acceptUserEntry && _ignoreNextKey != _pressedCode && _pressedCode >= 32){
				if (_ignoreNextKey) return false;
				if (
					_checkType(_opts.charInsertTrigger) == 'undefined' || (
						_checkType(_opts.charInsertTrigger) == 'function' &&
						_opts.charInsertTrigger(_pressedCode,_currentInput)
					)
				){
					_inputArea.insertCharacter(_pressedCode);
				}
			}
			if (_isChromeLike) return false;
		});

		function _isKeyIgnorable(_eventObject) {
			// Currently filters Alt+Tab, which some platforms report when switching applications.
			return ((_eventObject.keyCode == _keyMapInputs.tab || _eventObject.keyCode == 192) && _eventObject.altKey);
		};

		/******************************************************************
		 * Navigate Command History
		 * Cycles through previously entered commands.
		 ******************************************************************/
		function _cycleHistory(_direction){
			if (_commandHistory.length == 0) return;
			_historyIndex += _direction;
			if (_historyIndex < 0) _historyIndex = _commandHistory.length;
			else if (_historyIndex > _commandHistory.length) _historyIndex = 0;
			var _oldInput = _currentInput;
			if (_historyIndex == 0) {
				_currentInput = _tempInputBuffer;
			} else {
				_currentInput = _commandHistory[_historyIndex - 1];
			}
			if (_opts.historyPreserveColumn) {
				if (_currentInput.length < _currentPosition + 1) {
					_currentPosition = _currentInput.length;
				} else if (_currentPosition == 0) {
					_currentPosition = _currentInput.length;
				}
			} else {
				_currentPosition = _currentInput.length;
			}
			_refreshPromptView();
		};

		function _prevEntry() {
			_cycleHistory(-1);
		};

		function _nextEntry() {
			_cycleHistory(1);
		};

		// Adds a command to the history buffer
		function _addEntryToHistory(_commandLine){
			_commandHistory.push(_commandLine);
			_tempInputBuffer = '';
		};

		// Removes the character at the current cursor position
		function _removeCharacterAtCursor(){
			if (_currentPosition < _currentInput.length){
				_currentInput =
					_currentInput.substring(0,_currentPosition) +
					_currentInput.substring(_currentPosition+1);
				_tempInputBuffer = _currentInput;
				return true;
			} else return false;
		};

		function _deleteBackward() {
			if (_adjustCursorPosition(-1)){
				_removeCharacterAtCursor();
				_refreshPromptView();
			}
		};

		function _deleteForward() {
			if (_removeCharacterAtCursor()){
				_refreshPromptView();
			}
		};

		function _eraseToEnd() {
			while(_removeCharacterAtCursor()) {
				_refreshPromptView();
			}
		};

		function _eraseNextWord() {
			// A "word" here is defined as a sequence of alphanumeric characters.
			// First, remove any non-alphanumeric characters until a word starts.
			while(
				_currentPosition < _currentInput.length &&
				!_isAlphaNumericChar(_currentInput[_currentPosition])
			) {
				_removeCharacterAtCursor();
				_refreshPromptView();
			}
			// Then, remove alphanumeric characters until the word ends.
			while(
				_currentPosition < _currentInput.length &&
				_isAlphaNumericChar(_currentInput[_currentPosition])
			) {
				_removeCharacterAtCursor();
				_refreshPromptView();
			}
		};

		/******************************************************************
		 * Command Validation and Execution
		 * Checks if a command is valid and then processes it.
		 ******************************************************************/
		function _executeCommand() {
			var _enteredLine = _currentInput;
			if (_checkType(_opts.inputValidator) == 'function') {
				var _validationResult = _opts.inputValidator(_enteredLine);
				if (_validationResult == true || _validationResult == false) {
					if (_validationResult) {
						_processInputLine();
					}
				} else {
					_processCommandResult(_validationResult,"terminal-error-message");
				}
			} else {
				_processInputLine();
			}
		};

		// Scrolls the view to the bottom of the terminal display.
		function _scrollWidgetToBottom() {
			if (jQuery.fn.jquery > "1.6") {
				_innerContainer._getProperty({ scrollTop: _innerContainer._getProperty("scrollHeight") });
			}
			else {
				_innerContainer._getAttribute({ scrollTop: _innerContainer._getAttribute("scrollHeight") });
			}
		};

		function _abortExecution() {
			if(_checkType(_opts.cancelHandle) == 'function') {
			_opts.cancelHandle();
			}
		}

		/******************************************************************
		 * Process a User Command
		 * Handles the execution logic for an entered command.
		 ******************************************************************/
		function _processInputLine() {
			if (_checkType(_opts.commandHandler) == 'function') {
				_lockInput();
				_addEntryToHistory(_currentInput);
				var _finalCommandText = _currentInput;
				if (_publicAPI.continuedPrompt) {
					if (_multiLineInput)
						_multiLineInput += '\n' + _currentInput;
					else _multiLineInput = _currentInput;
				} else _multiLineInput = _notDefined;
				if (_multiLineInput) _finalCommandText = _multiLineInput;
				var _handlerReturn = _opts.commandHandler(_finalCommandText,function(_messages){
					_processCommandResult(_messages);
				});
				if (_publicAPI.continuedPrompt && !_multiLineInput)
					_multiLineInput = _currentInput;
				if (_checkType(_handlerReturn) == 'boolean') {
					if (_handlerReturn) {
						// Command completed successfully without explicit output.
						_processCommandResult();
					} else {
						_processCommandResult(
							'Operation failed.',
							"terminal-error-message"
						);
					}
				} else if (_checkType(_handlerReturn) == "string") {
					_processCommandResult(_handlerReturn,"terminal-success-message");
				} else if (_checkType(_handlerReturn) == 'object' && _handlerReturn.length) {
					_processCommandResult(_handlerReturn);
				} else if (_publicAPI.continuedPrompt) {
					_processCommandResult();
				}
			}
		};

		/******************************************************************
		 * Input Control Functions
		 * Enable or disable user input to the terminal.
		 ******************************************************************/
		function _lockInput() {
			_acceptUserEntry = false;
		};

		// Allow user input
		function _unlockInput() {
			_acceptUserEntry = true;
		}

		/******************************************************************
		 * Display Command Results
		 * Shows the output of a command and resets the prompt.
		 ******************************************************************/
		function _processCommandResult(_outputMessage,_outputClass) {
			_currentPosition = -1;
			_refreshPromptView();
			if (_checkType(_outputMessage) == 'string') {
				_displayOutput(_outputMessage,_outputClass);
			} else if (_lib._isArrayType(_outputMessage)) {
				for (var _idx in _outputMessage) {
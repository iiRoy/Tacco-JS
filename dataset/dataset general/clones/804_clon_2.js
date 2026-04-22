var DEVENV, paint, InputState;


/*
 * Core JavaScript extensions
 * Ensures standard features are available across environments.
 */

if (!console) {
	var debugOutput = {
		log: function(messageString) {"use strict"; }
	};
}


if (typeof Object.create !== 'function') {
	"use strict";
	Object.create = function (protoObject) {
		function TempConstructor() {}
		TempConstructor.prototype = protoObject;
		return new TempConstructor();
	};
}


/*
 * Public API Functions
 * These functions are exposed to the user's running code.
 */

paint = function(renderingContext){ /* No-op by default */ };

InputState = {
	leftArrow: false,
	downArrow: false,
	rightArrow: false,
	upArrow: false
};


function animationRate(framesPerSecond){
	"use strict";
	return DEVENV.animationRate(framesPerSecond);
}


function makeColor(red, green, blue, alpha) {
	"use strict";
	return "rgba(" + red + "," + green + "," + blue + "," + (alpha || 1) + ")";
}


function isDefinedAndNotNull(val) {
	"use strict";
	return (typeof val !== "undefined" && val !== null);
}


/*
 * Development Environment Core Logic
 * This module contains the primary functionality of the interactive editor.
 */

DEVENV = (function(){
	"use strict";
	var codeEditor;
	var linterWorker;
	var syntaxIssues = [];

	var issueLineIndex = -1;
	var issueDescription = "";
	var isNumericValueDragging = false;
	var lastPointerCoords = false;
	var previousCursorRow;
	var modifierKeyActive;

	// Elements related to the visual output/inspection
	var displaySurface, renderContext;
	var inspectionSurface, inspectionContext;
	var inspectedLineIndex;

	var inspectX, inspectY;

	var codeExecutionElement;
	var animationTimer;
	var originalVariableStates = {};
	var frameDelayMs = 17; // Roughly 60 FPS (1000ms / 60 frames)

	var editorIsFocused = false;

	var highlightColorHex = "#e33"; // Color for highlighting canvas sections

	var markCodeLine, getCurrentMarkedLine;
	(function () {
		var currentLine = -1;

		markCodeLine = function(newRowNumber) {
			codeEditor.setLineClass(currentLine - 1, undefined);

			currentLine = newRowNumber;

			if (currentLine !== -1) {
				codeEditor.setLineClass(currentLine - 1, "activeCodeLine");
			}

			if (!animationTimer) {
				executeRenderCycle(true, false);
			}
		};

		getCurrentMarkedLine = function() {
			return currentLine;
		};
	}());


	var toggleInspectionMode, getInspectionStatus;
	(function () {
		var _isInspectionActive = false;
		toggleInspectionMode = function (shouldInspect) {
			_isInspectionActive = shouldInspect;

			if (_isInspectionActive) {
				haltAnimation();
				document.body.className = "pointerInspectMode";
				document.getElementById("inspectionToggleBtn").className = "actionBtn pressed";
			} else {
				beginAnimation();
				markCodeLine(-1);
				document.body.className = undefined;
				document.getElementById("inspectionToggleBtn").className = "actionBtn";
			}
		};

		getInspectionStatus = function () {
			return _isInspectionActive;
		};
	}());

	var persistedDataTypes = {
		number: true,
		boolean: true,
		string: true
	};
	/* persistedDataTypes["function"] = true; // Functions might also be persisted */


	/* Input Event Handlers */

	function handleKeyboardPress(keyboardEvent){

		if (!editorIsFocused) {
			switch(keyboardEvent.keyCode) {
				case 37: // Left arrow
					InputState.leftArrow = true;
					break;
				case 38: // Up arrow
					InputState.upArrow = true;
					break;
				case 39: // Right arrow
					InputState.rightArrow = true;
					break;
				case 40: // Down arrow
					InputState.downArrow = true;
					break;
			}
		}

		if (keyboardEvent.keyCode === 91 || keyboardEvent.keyCode === 18) { // Cmd/Ctrl or Alt
			modifierKeyActive = true;
		}
	}


	function handleKeyboardRelease(keyboardEvent){
		switch(keyboardEvent.keyCode) {
			case 37:
				InputState.leftArrow = false;
				break;
			case 38:
				InputState.upArrow = false;
				break;
			case 39:
				InputState.rightArrow = false;
				break;
			case 40:
				InputState.downArrow = false;
				break;
		}

		if (keyboardEvent.keyCode === 91 || keyboardEvent.keyCode === 18) {
			modifierKeyActive = false;
		}
	}


	function concealIssueNotification(){
		document.getElementById("issueNotificationPanel").className = "hiddenNotification";
	}


	function onLinterAnalysisComplete(workerMessage){
		syntaxIssues = workerMessage.data.errors;

		// Process the reported issues
		if (!workerMessage.data.passed) {
			var issueCounter;
			debugOutput.log("Applying linter issue markers to source.");
			for (issueCounter = 0; issueCounter < syntaxIssues.length; issueCounter += 1) {
				if (syntaxIssues[issueCounter]) {
					codeEditor.setLineClass(syntaxIssues[issueCounter].line, "issueHighlightLine");
					codeEditor.setMarker(syntaxIssues[issueCounter].line, " ", "issueGutterMarker");
				}
			}
		}

		if (issueLineIndex >= 0) {
			codeEditor.setLineClass(issueLineIndex, "issueHighlightLine");
			codeEditor.setMarker(issueLineIndex, " ", "issueGutterMarker");
		}

		// Consider navigating to the initial error if multiple exist
	}


	function onCodeContentModified(editorInstance, changeDetails) {
		var counter, currentCodeContent;

		if (linterWorker) {
			linterWorker.postMessage({cmd: "STOP"});
			linterWorker = undefined;
		}

		currentCodeContent = codeEditor.getValue();
		window.localStorage.code = currentCodeContent; // Persist code to local storage

		if (!isNumericValueDragging){
			issueLineIndex = -1;
			concealIssueNotification();
			syntaxIssues = [];


			// This iteration can be quite slow for large files; optimization needed.
			for (counter = 0; counter < codeEditor.lineCount(); counter++) {
				codeEditor.setLineClass(counter, undefined);
				codeEditor.clearMarker(counter);
			}

			debugOutput.log("Sending code to linter worker...");
			linterWorker = new Worker('workers/codeValidator.js'); // Changed worker path
			linterWorker.addEventListener("message", onLinterAnalysisComplete, false);
			linterWorker.postMessage({cmd: "lint", code: currentCodeContent});
		}

		// TODO: Implement a check to only update live view if the code is syntactically valid?
		refreshCodeExecution(currentCodeContent);
	}


	function displayIssueForLine(row) {
		var issueMessage = "";
		var issueIndex;
		for (issueIndex = 0; issueIndex < syntaxIssues.length; issueIndex++) {
			if (isDefinedAndNotNull(syntaxIssues[issueIndex]) && syntaxIssues[issueIndex].line === row) {
				issueMessage += syntaxIssues[issueIndex].reason + "\n";
				break;
			}
		}

		if(issueLineIndex === row) {
			issueMessage = issueDescription;
		}

		if (issueMessage.length > 1){
			var notificationElement = document.getElementById("issueNotificationPanel");
			notificationElement.innerHTML = issueMessage;
			notificationElement.style.top = codeEditor.charCoords({line: row + 1, ch: 0}).y + 2 + "px";
			notificationElement.className = "";
			notificationElement.addEventListener('mouseout', function(){
				concealIssueNotification();
			}, true);
		}
	}


	/* General Interaction Events */

	function onPointerExit(pointerEvent) {
		markCodeLine(-1);
	}


	function onPointerDown(pointerEvent){
		if (modifierKeyActive) {
			lastPointerCoords = {x: pointerEvent.pageX, y: pointerEvent.pageY};
			var cursorPosition = codeEditor.coordsChar(lastPointerCoords);
			var tokenInfo = codeEditor.getTokenAt(cursorPosition);

			if (!isNaN(tokenInfo.string) && tokenInfo.className === "number" && !codeEditor.somethingSelected()) {
				isNumericValueDragging = tokenInfo;
				isNumericValueDragging.lineNumber = cursorPosition.line;

				// Account for negative numbers
				var tokenPrefix = codeEditor.getTokenAt({line: cursorPosition.line, ch: tokenInfo.start});
				if (tokenPrefix.string === '-') {
					isNumericValueDragging.start -= 1;
					isNumericValueDragging.string = '-' + isNumericValueDragging.string;
				}

				pointerEvent.stopPropagation();
			} else {
				isNumericValueDragging = false;
			}
		}
	}


	function onPointerMove(pointerEvent){
		if (isNumericValueDragging) {
			isNumericValueDragging.dragged = true;

			var updatedValueString = String(parseFloat(isNumericValueDragging.string) + (pointerEvent.pageX - lastPointerCoords.x));

			codeEditor.replaceRange(updatedValueString,
				{line: isNumericValueDragging.lineNumber,
					ch: isNumericValueDragging.start},
				{line: isNumericValueDragging.lineNumber,
					ch: isNumericValueDragging.end});

			isNumericValueDragging.string = updatedValueString;
			isNumericValueDragging.end = isNumericValueDragging.start + isNumericValueDragging.string.length;

			codeEditor.setSelection({line: isNumericValueDragging.lineNumber,
				ch: isNumericValueDragging.start},
				{line: isNumericValueDragging.lineNumber,
					ch: isNumericValueDragging.end});
			pointerEvent.stopPropagation();
		}

		lastPointerCoords = {x: pointerEvent.pageX, y: pointerEvent.pageY};

		if (getInspectionStatus()) {
			if(document.getElementById("PrimaryDisplayCanvas") === pointerEvent.target) {
				var row = getRenderInstructionLineAtScreenCoord(pointerEvent.offsetX, pointerEvent.offsetY);
				markCodeLine(row);
				scrollToLine(row - 1);
			}
		}
	}


	function onPointerUp(pointerEvent) {
		if (isNumericValueDragging) {
			var draggedNumberData = isNumericValueDragging;

			// Move cursor to a different line momentarily to trigger layout updates
			if (isNumericValueDragging.dragged) {
				setTimeout(function (){
					codeEditor.setCursor({line: draggedNumberData.lineNumber + 1, ch: 1});
					codeEditor.setCursor({line: draggedNumberData.lineNumber, ch: draggedNumberData.end});
				}, 1);
			}
		}
		isNumericValueDragging = false;

		if (pointerEvent.target === document.getElementById("inspectionToggleBtn")) {
			toggleInspectionMode(!getInspectionStatus());
		} else {
			toggleInspectionMode(false);
		}
	}


	/* Editor-specific Events */

	function onCursorPositionChange() {
		if (isNumericValueDragging) {
			// codeEditor.setCursor({line: isNumericValueDragging.lineNumber, ch: isNumericValueDragging.end});

			codeEditor.setSelection({line: isNumericValueDragging.lineNumber,
				ch: isNumericValueDragging.start},
				{line: isNumericValueDragging.lineNumber,
					ch: isNumericValueDragging.end});
		} else {
			var activeCursorRow = codeEditor.getCursor().line;
			if(previousCursorRow !== activeCursorRow) {
				displayIssueForLine(activeCursorRow);
			}
			previousCursorRow = activeCursorRow;
		}
	}


	function onGutterAreaClick(editorObj, row, clickEvent) {
		displayIssueForLine(row);
	}


	function refreshCodeExecution(codeString) {
		haltAnimation();


		// Store current global variable states to restore later
		var initialGlobalVars = {};
		var varName;
		for (varName in window) {
			if (window.hasOwnProperty(varName) && persistedDataTypes[typeof window[varName]]) {
				initialGlobalVars[varName] = window[varName];
			}
		}

		// Inject line numbers into the source for error reporting
		var codeLines = codeString.split("\n");
		var lineCounter;

		for (lineCounter = 0; lineCounter < codeLines.length; lineCounter++) {
			codeLines[lineCounter] = "DEVENV.currentOperatingLineNumber=" + (lineCounter + 1) + ";" + codeLines[lineCounter];
		}
		codeString = '"use strict"; ' + codeLines.join("\n");

		// Create and inject a new script element
		var scriptInjectionZone = document.getElementById("scriptInjectionZone");
		var scriptInjector = document.createElement('script');
		scriptInjector.type = 'text/javascript';

		var scriptContentNode = document.createTextNode(codeString);
		scriptInjector.appendChild(scriptContentNode);

		// Clear any previously injected scripts
		if (scriptInjectionZone.hasChildNodes()){
			while (scriptInjectionZone.childNodes.length >= 1 ) {
				scriptInjectionZone.removeChild(scriptInjectionZone.firstChild);
			}
		}

		try {
			scriptInjectionZone.appendChild(scriptInjector);
		} catch(compilationError) {
			debugOutput.log("Compilation Error: " + compilationError);
		}

		// Restore persisted global variables after script execution
		for (varName in window) {
			if (persistedDataTypes[(typeof window[varName]) + ""]) {

				if (!initialGlobalVars[varName]) { // This variable did not exist before script execution
					originalVariableStates[varName] = window[varName];
				} else {
					if (window[varName] !== initialGlobalVars[varName]) { // Variable changed after compilation
						if (window[varName] === originalVariableStates[varName]) {
							// If the variable was reset to its initial value, restore the last known state
							window[varName] = initialGlobalVars[varName];
						} else {
							// Variable was set to a new value, update its tracked initial state
							originalVariableStates[varName] = window[varName];
						}
					}
				}
			}
		}

		// TODO: Implement garbage collection for old/unused global variables/functions
		// Identify and remove variables from the previous version that are not present in the new one.

		executeRenderCycle();
		beginAnimation();
	}


	function getRenderInstructionLineAtScreenCoord(screenX, screenY) {
		var isAnimationRunning = animationTimer;

		inspectX = screenX;
		inspectY = screenY;

		inspectedLineIndex = -1;
		executeRenderCycle(true, true); // Perform a render pass with inspection context

		return inspectedLineIndex;
	}


	function executeRenderCycle(skipVarStatePreservation, useInspectionContext) {
		var initialGlobalVars = {}, varName;

		if (skipVarStatePreservation) {
			for (varName in window) {
				if (window.hasOwnProperty(varName) && persistedDataTypes[typeof window[varName]]) {
					initialGlobalVars[varName] = window[varName];
				}
			}
		}

		paint(useInspectionContext ? inspectionContext : renderContext);


		if (skipVarStatePreservation) {
			for (varName in initialGlobalVars) {
				window[varName] = initialGlobalVars[varName];
			}
		}
	}


	function beginAnimation() {
		if (!animationTimer && frameDelayMs > 0) {
			animationTimer = window.setInterval(executeRenderCycle, frameDelayMs);
		}
	}


	function haltAnimation() {
		if (animationTimer) {
			window.clearInterval(animationTimer);
		}
		animationTimer = undefined;
	}


	function reportRuntimeError (errorMessage, errorRow) {
		debugOutput.log("User script error detected: " + errorMessage);
		if (issueLineIndex >= 0) {
			codeEditor.setLineClass(issueLineIndex, null);
			codeEditor.clearMarker(issueLineIndex);
		}
		issueLineIndex = errorRow - 1; // Adjust for 0-based index
		codeEditor.setLineClass(issueLineIndex, "issueHighlightLine");
		codeEditor.setMarker(issueLineIndex, " ", "issueGutterMarker");
		issueDescription = errorMessage;
	}


	// Public interface for the DEVENV module
	return {
		init: function(editorReference, primaryCanvas, secondaryCanvas) {
			codeEditor = editorReference;
			displaySurface = primaryCanvas;
			renderContext = primaryCanvas.getContext('2d');
			inspectionSurface = secondaryCanvas;
			inspectionContext = secondaryCanvas.getContext('2d');

			// Set up event listeners
			document.addEventListener("keydown", handleKeyboardPress, false);
			document.addEventListener("keyup", handleKeyboardRelease, false);
			document.addEventListener("mousemove", onPointerMove, false);
			document.addEventListener("mouseup", onPointerUp, false);
			document.addEventListener("mousedown", onPointerDown, false);
			document.addEventListener("mouseout", onPointerExit, false);

			codeEditor.on("change", onCodeContentModified);
			codeEditor.on("cursorActivity", onCursorPositionChange);
			codeEditor.on("gutterClick", onGutterAreaClick);
			codeEditor.on("focus", function() { editorIsFocused = true; });
			codeEditor.on("blur", function() { editorIsFocused = false; });
		},
		updateLiveCode: refreshCodeExecution,
		animationRate: function(newFps) {
			if (newFps > 0) {
				frameDelayMs = Math.floor(1000 / newFps);
			} else {
				frameDelayMs = 0;
			}
			haltAnimation();
			beginAnimation();
			return frameDelayMs;
		},
		currentOperatingLineNumber: -1, // Used for injecting line numbers into user code
		reportError: reportRuntimeError,
		getInspectionMode: getInspectionStatus,
		setInspectionState: toggleInspectionMode,
		highlightCurrentLine: markCodeLine,
		getHighlightedLine: getCurrentMarkedLine
	};
}());
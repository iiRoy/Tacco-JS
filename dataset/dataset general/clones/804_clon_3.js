var APP_CORE, paintCanvas, userKeyStates, setupScene;

/*
 * Polyfill section: Ensuring basic browser compatibility
 * These utilities provide standard features for older environments if missing.
 */

// Safeguard for the console object, preventing errors in browsers without it.
if (typeof console === 'undefined' || !console.log) {
    const backupConsole = {
        log: function(message) { /* "use strict"; */ }, // Minimal log function
        warn: function(message) { /* "use strict"; */ }, // Added a warn method
        error: function(message) { /* "use strict"; */ } // Added an error method
    };
    // Assigning to window.console if it doesn't exist to ensure global availability
    if (typeof window !== 'undefined') {
        window.console = backupConsole;
    } else {
        var console = backupConsole; // Fallback for non-browser environments if needed
    }
}

// Polyfill for Object.create, crucial for prototype-based inheritance.
if (typeof Object.create !== 'function') {
    Object.create = function (protoObject) {
        if (typeof protoObject !== 'object' && protoObject !== null) {
            throw new TypeError('Object prototype may only be an Object or null.');
        }
        function TempConstructor() {}
        TempConstructor.prototype = protoObject;
        return new TempConstructor();
    };
}

/*
 * External API Functions
 * These are made available for user scripts executed within the environment.
 */

// Placeholder for the user's main rendering function.
// User code will redefine this, and it will receive a canvas context.
paintCanvas = function(renderingContext) {
    // console.warn("Default paintCanvas placeholder called. User code should define this.");
};

// Placeholder for the user's one-time setup function.
// User code can redefine this for initializations.
setupScene = function() {
    // console.log("Default setupScene placeholder called. User code should define this.");
};

// Tracks the current state of directional keyboard inputs.
userKeyStates = {
    leftArrow: false,
    downArrow: false,
    rightArrow: false,
    upArrow: false
};

/**
 * Sets the desired frame rate for the animation loop.
 * @param {number} desiredFps - Frames per second. Must be a positive number.
 * @returns {boolean} - True if the framerate was set, false otherwise.
 */
function adjustFrameRate(desiredFps) {
    if (typeof desiredFps !== 'number' || desiredFps <= 0 || !Number.isFinite(desiredFps)) {
        console.error("Invalid framerate value provided. Must be a positive, finite number.");
        return false;
    }
    return APP_CORE.setLoopFrequency(desiredFps);
}

/**
 * Generates an RGBA color string.
 * @param {number} r - Red component (0-255).
 * @param {number} g - Green component (0-255).
 * @param {number} b - Blue component (0-255).
 * @param {number} [a=1] - Alpha component (0-1).
 * @returns {string} - The CSS RGBA color string.
 */
function generateRGBAString(r, g, b, a) {
    const clampedR = Math.max(0, Math.min(255, Math.floor(r)));
    const clampedG = Math.max(0, Math.min(255, Math.floor(g)));
    const clampedB = Math.max(0, Math.min(255, Math.floor(b)));
    const finalA = (typeof a === 'number' && a >= 0 && a <= 1) ? a : 1;

    return `rgba(${clampedR},${clampedG},${clampedB},${finalA})`;
}

/**
 * Checks if a given value is neither undefined nor null.
 * @param {*} val - The value to check.
 * @returns {boolean} - True if the value exists and is not null.
 */
function isDefinedAndNotNull(val) {
    return val !== undefined && val !== null;
}

/*
 * Code Maestro Core Module
 * This immediately invoked function expression (IIFE) encapsulates the main application logic,
 * preventing global scope pollution and managing internal state.
 */
APP_CORE = (function() {
    "use strict"; // Apply strict mode to the entire module.

    // Internal state variables for the code editor and linting.
    let codeMirrorInstance; // Reference to the CodeMirror editor object.
    let linterWorkerProcess; // Web Worker for asynchronous code analysis.
    let validationIssues = []; // Array to store linting or runtime errors.

    let highlightedIssueLine = -1; // Line number of the currently displayed error.
    let issueDescription = ""; // Text of the current error message.
    let isNumberSliderActive = false; // Flag for numerical value manipulation by mouse drag.
    let previousPointerCoords = { x: 0, y: 0 }; // Last known mouse position for drag operations.
    let lastVisitedCodeLine; // The last line the cursor was on in the editor.
    let modifierKeyHeld = false; // True if a modifier key (e.g., Cmd/Alt) is pressed.

    // Canvas-related elements for rendering and off-screen probing.
    let mainCanvasElement, mainCanvasContext; // Main display canvas and its 2D rendering context.
    let offscreenCanvas, offscreenContext; // Off-screen canvas for hit testing/inspection.
    let debugHitLine; // Line number of the drawing call identified during inspection.

    let debugXCoord, debugYCoord; // Coordinates for off-screen probing.

    let dynamicScriptTag; // Reference to the dynamically injected <script> element.
    let animationIntervalId; // ID for the setInterval used for the animation loop.
    const persistedGlobalState = {}; // Stores initial values of global user variables.
    let updateCycleDelayMs = 17; // Default delay for ~60 FPS (1000ms / 60fps ≈ 16.67ms).

    let codeEditorIsFocused = false; // Tracks if the CodeMirror editor has input focus.

    // Encapsulated functions for managing line highlighting in the editor.
    let markCodeLine, getCurrentMarkedLine;
    (function() {
        let activeHighlightedLine = -1; // Private variable for the currently highlighted line.

        /**
         * Highlights a specific line in the editor and triggers a re-render if necessary.
         * @param {number} newLineNumber - The 0-indexed line number to highlight.
         */
        markCodeLine = function(newLineNumber) {
            if (!codeMirrorInstance) return; // Guard: ensure editor exists.

            // Clear previous highlight if any
            if (activeHighlightedLine !== -1) {
                codeMirrorInstance.removeLineClass(activeHighlightedLine, "background", "highlightLine");
            }

            activeHighlightedLine = newLineNumber;

            // Apply new highlight
            if (activeHighlightedLine !== -1) {
                codeMirrorInstance.addLineClass(activeHighlightedLine, "background", "highlightLine");
            }

            // Trigger a re-render if the animation loop is not active
            if (!animationIntervalId) {
                executeRenderCycle(true, false);
            }
        };

        /**
         * Returns the currently highlighted line number.
         * @returns {number} - The 0-indexed line number, or -1 if none is highlighted.
         */
        getCurrentMarkedLine = function() {
            return activeHighlightedLine;
        };
    }());


    // Encapsulated functions for managing the inspection mode.
    let toggleInspectionMode, isInspectionActive;
    (function() {
        let _internalInspectionFlag = false; // Private flag for inspection mode state.

        /**
         * Toggles the code inspection mode on or off.
         * @param {boolean} shouldInspect - True to activate inspection, false to deactivate.
         */
        toggleInspectionMode = function(shouldInspect) {
            _internalInspectionFlag = shouldInspect;

            const inspectionButton = document.getElementById("inspectButton");
            if (!inspectionButton) {
                console.warn("Inspection button element not found.");
                return;
            }

            if (_internalInspectionFlag) {
                pauseAnimationLoop(); // Stop the animation to allow static inspection.
                document.body.classList.add("inspectCursor"); // Change cursor style.
                inspectionButton.classList.add("buttonPressed"); // Visually indicate active state.
                inspectionButton.setAttribute("aria-pressed", "true");
            } else {
                beginAnimationLoop(); // Resume animation.
                markCodeLine(-1); // Clear any line highlights.
                document.body.classList.remove("inspectCursor"); // Restore default cursor.
                inspectionButton.classList.remove("buttonPressed");
                inspectionButton.setAttribute("aria-pressed", "false");
            }
        };

        /**
         * Checks if the inspection mode is currently active.
         * @returns {boolean} - True if inspection mode is on, false otherwise.
         */
        isInspectionActive = function() {
            return _internalInspectionFlag;
        };
    }());

    // Defines which global variable types should be preserved across code updates.
    const allowedGlobalTypesForPersistence = {
        number: true,
        boolean: true,
        string: true
        // Functions are generally recreated or should be explicitly managed.
    };

    /* --- Event Handlers for User Interactions --- */

    /**
     * Handles keyboard key down events, updating userKeyStates and modifierKeyHeld.
     * @param {KeyboardEvent} event - The keyboard event object.
     */
    function handleKeyDownEvent(event) {
        // Prevent default browser behavior for arrow keys if editor is not focused.
        if (!codeEditorIsFocused) {
            switch (event.key) { // Using event.key for modern browsers
                case "ArrowLeft":
                    userKeyStates.leftArrow = true;
                    event.preventDefault();
                    break;
                case "ArrowUp":
                    userKeyStates.upArrow = true;
                    event.preventDefault();
                    break;
                case "ArrowRight":
                    userKeyStates.rightArrow = true;
                    event.preventDefault();
                    break;
                case "ArrowDown":
                    userKeyStates.downArrow = true;
                    event.preventDefault();
                    break;
            }
        }

        // Check for common modifier keys (Cmd/Meta or Alt/Option)
        if (event.metaKey || event.altKey) {
            modifierKeyHeld = true;
        }
    }

    /**
     * Handles keyboard key up events, resetting userKeyStates and modifierKeyHeld.
     * @param {KeyboardEvent} event - The keyboard event object.
     */
    function handleKeyUpEvent(event) {
        switch (event.key) {
            case "ArrowLeft":
                userKeyStates.leftArrow = false;
                break;
            case "ArrowUp":
                userKeyStates.upArrow = false;
                break;
            case "ArrowRight":
                userKeyStates.rightArrow = false;
                break;
            case "ArrowDown":
                userKeyStates.downArrow = false;
                break;
        }

        // Reset modifier key flag if relevant key is released
        if (!event.metaKey && !event.altKey) { // Check if *no* modifier is currently held
            modifierKeyHeld = false;
        }
    }

    /**
     * Hides the error popover element from view.
     */
    function concealIssueDisplay() {
        const errorReportElement = document.getElementById("errorReport");
        if (errorReportElement) {
            errorReportElement.classList.add("hideReport");
            errorReportElement.textContent = ""; // Clear content as well
        }
    }

    /**
     * Callback function executed when the linter worker finishes its analysis.
     * Updates editor with error markers.
     * @param {MessageEvent} event - The message event from the worker.
     */
    function onLinterAnalysisComplete(event) {
        validationIssues = event.data.errors;
        const analysisPassed = event.data.passed;

        // Clear all previous error markers and classes first
        if (codeMirrorInstance) {
            codeMirrorInstance.eachLine(lineHandle => {
                codeMirrorInstance.removeLineClass(lineHandle, "background", "errorLine");
                codeMirrorInstance.clearGutter("error-gutter-marker"); // Clear specific gutter markers
            });
        }

        if (!analysisPassed) {
            console.log("Linter detected issues. Marking relevant lines.");
            validationIssues.forEach(issue => {
                if (issue && codeMirrorInstance) {
                    // CodeMirror lines are 0-indexed, JSLint lines are 1-indexed.
                    const lineIndex = issue.line - 1;
                    codeMirrorInstance.addLineClass(lineIndex, "background", "errorLine");
                    codeMirrorInstance.setGutterMarker(lineIndex, "error-gutter-marker", createErrorMarkerElement());
                }
            });
        } else {
            console.log("Linter analysis completed: No issues found.");
        }

        // If there's a previously highlighted runtime error, ensure it's still marked.
        if (highlightedIssueLine >= 0 && codeMirrorInstance) {
            codeMirrorInstance.addLineClass(highlightedIssueLine, "background", "errorLine");
            codeMirrorInstance.setGutterMarker(highlightedIssueLine, "error-gutter-marker", createErrorMarkerElement());
        }
    }

    /**
     * Helper to create an error marker DOM element.
     * @returns {HTMLElement} - A span element for the error marker.
     */
    function createErrorMarkerElement() {
        const marker = document.createElement("span");
        marker.textContent = "●"; // A simple dot marker
        marker.className = "errorMarker";
        marker.setAttribute("title", "Linter issue");
        return marker;
    }

    /**
     * Handles changes in the editor's text content.
     * Triggers linting and code execution updates.
     * @param {CodeMirror.Editor} editorInstance - The CodeMirror editor instance.
     * @param {CodeMirror.EditorChangeLinkedList} changeInfo - Details about the change.
     */
    function onCodeContentModified(editorInstance, changeInfo) {
        // Debounce linting and code update to prevent excessive operations.
        if (APP_CORE.debounceTimer) {
            clearTimeout(APP_CORE.debounceTimer);
        }

        APP_CORE.debounceTimer = setTimeout(() => {
            if (linterWorkerProcess) {
                linterWorkerProcess.terminate(); // Stop previous worker
                linterWorkerProcess = undefined;
            }

            const currentCodeContent = editorInstance.getValue();
            // Persist the code to local storage immediately.
            try {
                window.localStorage.setItem("code", currentCodeContent);
            } catch (e) {
                console.error("Failed to save code to local storage:", e);
            }

            if (!isNumberSliderActive) {
                highlightedIssueLine = -1;
                concealIssueDisplay();
                validationIssues = [];

                // Clear all line classes and markers before re-linting
                editorInstance.eachLine(lineHandle => {
                    editorInstance.removeLineClass(lineHandle, "background", "errorLine");
                    editorInstance.clearGutter("error-gutter-marker"); // Clear specific gutter markers
                });

                console.log("Initiating linter worker for analysis...");
                try {
                    linterWorkerProcess = new Worker('scripts/jsLintWorker.js');
                    linterWorkerProcess.addEventListener("message", onLinterAnalysisComplete, false);
                    linterWorkerProcess.postMessage({ cmd: "lint", code: currentCodeContent });
                } catch (e) {
                    console.error("Failed to start linter worker:", e);
                    // Fallback: if worker fails, still try to update code
                    refreshExecutableCode(currentCodeContent);
                    return;
                }
            }

            // Always attempt to update and run the code, regardless of linting status.
            refreshExecutableCode(currentCodeContent);
        }, 300); // 300ms debounce delay
    }

    /**
     * Displays an error popover with details for a specific line number.
     * @param {number} lineIndex - The 0-indexed line number to show errors for.
     */
    function displayIssueDetailsForLine(lineIndex) {
        let issueMessage = "";
        // Check for linting errors first
        const lintIssue = validationIssues.find(issue => isDefinedAndNotNull(issue) && (issue.line - 1) === lineIndex);
        if (lintIssue) {
            issueMessage += `Lint Error (Line ${lineIndex + 1}): ${lintIssue.reason}\n`;
        }

        // If there's a runtime error on this line, append its message.
        if (highlightedIssueLine === lineIndex) {
            if (issueMessage) issueMessage += "\n"; // Add separator if lint message exists
            issueMessage += `Runtime Error (Line ${lineIndex + 1}): ${issueDescription}`;
        }

        if (issueMessage.length > 0) {
            const errorReportElement = document.getElementById("errorReport");
            if (errorReportElement) {
                errorReportElement.textContent = issueMessage;
                // Position the popover near the line in the editor.
                const lineCoords = codeMirrorInstance.charCoords({ line: lineIndex + 1, ch: 0 }, "local");
                errorReportElement.style.top = `${lineCoords.top + 2}px`;
                errorReportElement.style.left = `${lineCoords.left}px`; // Align with the start of the line
                errorReportElement.classList.remove("hideReport");

                // Automatically hide the popover after a short delay or on mouseout.
                errorReportElement.addEventListener('mouseout', concealIssueDisplay, { once: true });
                errorReportElement.addEventListener('click', concealIssueDisplay, { once: true }); // Also hide on click
            }
        } else {
            concealIssueDisplay(); // Hide if no errors for this line
        }
    }

    /* --- Editor & Canvas Interaction Events --- */

    /**
     * Handles mouse moving out of the canvas area.
     * Clears any inspection highlight.
     * @param {MouseEvent} event - The mouse event object.
     */
    function handleCanvasMouseExit(event) {
        // Only clear if we are in inspection mode
        if (isInspectionActive()) {
            markCodeLine(-1);
        }
    }

    /**
     * Handles mouse button down events, initiating number sliding if applicable.
     * @param {MouseEvent} event - The mouse event object.
     */
    function handlePointerDown(event) {
        // Only proceed if a modifier key is held and it's a left click.
        if (modifierKeyHeld && event.button === 0) {
            previousPointerCoords = { x: event.pageX, y: event.pageY };
            const charPosition = codeMirrorInstance.coordsChar({ left: event.pageX, top: event.pageY });
            const token = codeMirrorInstance.getTokenAt(charPosition);

            // Check if the token is a number and not part of a selection.
            if (token && !isNaN(Number(token.string)) && token.type === "number" && !codeMirrorInstance.somethingSelected()) {
                isNumberSliderActive = {
                    originalToken: token,
                    lineNumber: charPosition.line,
                    startCh: token.start,
                    endCh: token.end,
                    currentValue: parseFloat(token.string),
                    hasDragged: false // Track if actual dragging occurred
                };

                // Adjust for negative numbers (e.g., `-123`) where '-' is a separate token.
                const tokenBefore = codeMirrorInstance.getTokenAt({ line: charPosition.line, ch: token.start - 1 });
                if (tokenBefore && tokenBefore.string === '-' && tokenBefore.end === token.start) {
                    isNumberSliderActive.startCh = tokenBefore.start;
                    isNumberSliderActive.currentValue = parseFloat(tokenBefore.string + token.string); // Include the minus sign
                }

                event.preventDefault(); // Prevent text selection
                event.stopPropagation();
            } else {
                isNumberSliderActive = false;
            }
        }
    }

    /**
     * Handles mouse movement events, updating number values if number sliding is active.
     * @param {MouseEvent} event - The mouse event object.
     */
    function handlePointerMove(event) {
        // Handle number sliding functionality.
        if (isNumberSliderActive) {
            isNumberSliderActive.hasDragged = true;
            const deltaX = event.pageX - previousPointerCoords.x;
            const newValue = isNumberSliderActive.currentValue + deltaX;

            // Apply the new value to the editor. Use a fixed number of decimals for consistency.
            const newStringValue = newValue.toFixed(2); // Type III: Use toFixed for more control.

            codeMirrorInstance.replaceRange(newStringValue,
                { line: isNumberSliderActive.lineNumber, ch: isNumberSliderActive.startCh },
                { line: isNumberSliderActive.lineNumber, ch: isNumberSliderActive.endCh }
            );

            // Update the state for the next move.
            isNumberSliderActive.currentValue = newValue;
            isNumberSliderActive.endCh = isNumberSliderActive.startCh + newStringValue.length;

            // Keep the new value selected.
            codeMirrorInstance.setSelection(
                { line: isNumberSliderActive.lineNumber, ch: isNumberSliderActive.startCh },
                { line: isNumberSliderActive.lineNumber, ch: isNumberSliderActive.endCh }
            );
            event.preventDefault();
            event.stopPropagation();
        }

        previousPointerCoords = { x: event.pageX, y: event.pageY };

        // Handle inspection mode highlighting.
        if (isInspectionActive()) {
            const mainCanvas = document.getElementById("TouchCodeMainCanvas");
            if (mainCanvas && event.target === mainCanvas) {
                const rect = mainCanvas.getBoundingClientRect();
                const mouseX = event.clientX - rect.left;
                const mouseY = event.clientY - rect.top;

                const detectedLine = determineRenderCallLineAtCoords(mouseX, mouseY);
                markCodeLine(detectedLine > 0 ? detectedLine - 1 : -1); // Convert to 0-indexed for CM
                // Type III: Add an optional scroll to the line if it's not visible
                if (detectedLine > 0) {
                    const scrollInfo = codeMirrorInstance.getScrollInfo();
                    const lineTop = codeMirrorInstance.charCoords({ line: detectedLine - 1, ch: 0 }, "local").top;
                    if (lineTop < scrollInfo.top || lineTop > scrollInfo.top + scrollInfo.clientHeight) {
                        codeMirrorInstance.scrollIntoView({ line: detectedLine - 1, ch: 0 }, 50); // Scroll with padding
                    }
                }
            }
        }
    }

    /**
     * Handles mouse button up events, finalizing number sliding or toggling inspection.
     * @param {MouseEvent} event - The mouse event object.
     */
    function handlePointerUp(event) {
        if (isNumberSliderActive) {
            const tempSliderState = isNumberSliderActive; // Capture state before reset
            isNumberSliderActive = false; // Reset slider state

            // If a drag occurred, ensure the cursor is properly positioned after the update.
            if (tempSliderState.hasDragged) {
                // Delay cursor placement slightly to allow editor to re-layout.
                setTimeout(() => {
                    codeMirrorInstance.setCursor({ line: tempSliderState.lineNumber, ch: tempSliderState.endCh });
                }, 10); // Short delay
            }
        }

        // Toggle inspection mode if the button was clicked and not dragging a number.
        const inspectionButton = document.getElementById("inspectButton");
        if (inspectionButton && event.target === inspectionButton && !isNumberSliderActive) {
            toggleInspectionMode(!isInspectionActive());
        } else if (isInspectionActive()) {
            // If inspection was active and we clicked elsewhere (not the button), deactivate it.
            toggleInspectionMode(false);
        }
    }

    /**
     * Handles cursor activity within the CodeMirror editor.
     * Updates selection for number sliding or displays error popovers.
     */
    function onEditorCursorChange() {
        if (isNumberSliderActive) {
            // Re-select the sliding number if still active (e.g., after an external change)
            codeMirrorInstance.setSelection(
                { line: isNumberSliderActive.lineNumber, ch: isNumberSliderActive.startCh },
                { line: isNumberSliderActive.lineNumber, ch: isNumberSliderActive.endCh }
            );
        } else {
            const currentCursorLine = codeMirrorInstance.getCursor().line;
            if (lastVisitedCodeLine !== currentCursorLine) {
                displayIssueDetailsForLine(currentCursorLine);
            }
            lastVisitedCodeLine = currentCursorLine;
        }
    }

    /**
     * Handles clicks on the editor's gutter area.
     * Typically used to display error details for the clicked line.
     * @param {CodeMirror.Editor} editorInstance - The CodeMirror editor instance.
     * @param {number} clickedLineIndex - The 0-indexed line number that was clicked.
     * @param {MouseEvent} event - The mouse event object.
     */
    function onEditorGutterClick(editorInstance, clickedLineIndex, event) {
        displayIssueDetailsForLine(clickedLineIndex);
    }

    /* --- Core Code Execution & Rendering Logic --- */

    /**
     * Injects line numbers into the user's code for debugging and then executes it.
     * Manages global variable persistence and calls user's setup function.
     * @param {string} rawCodeString - The user's JavaScript code.
     */
    function refreshExecutableCode(rawCodeString) {
        pauseAnimationLoop(); // Stop current animation before updating code.

        // Capture current global state for comparison later.
        const currentGlobalStateSnapshot = {};
        for (const propName in window) {
            if (window.hasOwnProperty(propName) && allowedGlobalTypesForPersistence[typeof window[propName]]) {
                currentGlobalStateSnapshot[propName] = window[propName];
            }
        }

        // Prepare the code for execution, injecting line number tracking.
        const codeLines = rawCodeString.split("\n");
        const instrumentedLines = codeLines.map((line, index) =>
            // Inject a statement to update the current operating line number.
            `window.APP_CORE.currentOperatingLineNumber=${index + 1};${line}`
        );
        const finalScriptContent = `"use strict";\n${instrumentedLines.join("\n")}`;

        // Get the container for dynamic scripts.
        const scriptContainer = document.getElementById("scriptInjectionPoint");
        if (!scriptContainer) {
            console.error("Script injection point 'scriptInjectionPoint' not found. Please ensure your HTML has <div id='scriptInjectionPoint'></div>.");
            return;
        }

        // Clear previous script(s) from the container.
        scriptContainer.innerHTML = '';

        // Create and inject the new script element.
        dynamicScriptTag = document.createElement('script');
        dynamicScriptTag.type = 'text/javascript';
        dynamicScriptTag.textContent = finalScriptContent; // Using textContent is safer than textNode + appendChild

        try {
            scriptContainer.appendChild(dynamicScriptTag);
            console.log("User script successfully injected and executed.");

            // After injection, call user's setup function if defined.
            if (typeof window.setupScene === 'function') {
                window.setupScene();
            }

        } catch (e) {
            console.error("Error during user script injection:", e);
            reportRuntimeError(`Script injection failed: ${e.message}`, 0); // Report at line 0 if injection fails
            beginAnimationLoop(); // Try to resume even if injection failed, to allow user to fix.
            return;
        }

        // After script execution, reconcile global variables.
        for (const propName in window) {
            if (window.hasOwnProperty(propName) && allowedGlobalTypesForPersistence[typeof window[propName]]) {
                if (!currentGlobalStateSnapshot[propName] && window[propName] !== undefined) {
                    // New variable introduced by the user script. Store its initial value.
                    persistedGlobalState[propName] = window[propName];
                } else if (currentGlobalStateSnapshot[propName] !== undefined) {
                    // Existing variable. Check if its value changed.
                    if (window[propName] !== currentGlobalStateSnapshot[propName]) {
                        // If the variable was reset to its 'initial' value by the script, restore the previous value.
                        if (window[propName] === persistedGlobalState[propName]) {
                            window[propName] = currentGlobalStateSnapshot[propName];
                        } else {
                            // Otherwise, the script set a new value, update the persisted initial value.
                            persistedGlobalState[propName] = window[propName];
                        }
                    }
                }
            }
        }

        // Clean up any global variables that were defined in the previous script but are no longer present.
        for (const propName in persistedGlobalState) {
            if (!Object.prototype.hasOwnProperty.call(window, propName) || window[propName] === undefined) {
                // If a previously persisted global variable no longer exists or is undefined, remove it from our tracking.
                delete persistedGlobalState[propName];
            }
        }

        executeRenderCycle(); // Perform an immediate render.
        beginAnimationLoop(); // Restart the animation loop.
    }

    /**
     * Determines the line number of a `paintCanvas` call at a specific screen coordinate.
     * Uses an off-screen canvas for hit testing.
     * @param {number} screenX - X coordinate relative to the canvas.
     * @param {number} screenY - Y coordinate relative to the canvas.
     * @returns {number} - The 1-indexed line number of the drawing call, or -1 if none found.
     */
    function determineRenderCallLineAtCoords(screenX, screenY) {
        // Store current animation state to restore it later.
        const wasAnimating = animationIntervalId !== undefined;

        debugXCoord = screenX;
        debugYCoord = screenY;
        debugHitLine = -1; // Reset probe line.

        // Perform a render cycle using the off-screen context.
        executeRenderCycle(true, true);

        // If animation was running, restart it.
        if (wasAnimating) {
            beginAnimationLoop();
        }

        return debugHitLine;
    }

    /**
     * Executes a single rendering cycle.
     * @param {boolean} preserveGlobals - If true, global variables are snapshotted and restored.
     * @param {boolean} useOffscreenContext - If true, renders to the off-screen canvas for probing.
     */
    function executeRenderCycle(preserveGlobals, useOffscreenContext) {
        let globalStateBackup;

        // If preserving globals, create a snapshot.
        if (preserveGlobals) {
            globalStateBackup = {};
            for (const propName in window) {
                if (window.hasOwnProperty(propName) && allowedGlobalTypesForPersistence[typeof window[propName]]) {
                    globalStateBackup[propName] = window[propName];
                }
            }
        }

        const targetContext = useOffscreenContext ? offscreenContext : mainCanvasContext;

        if (!targetContext) {
            console.error("No valid canvas context available for rendering.");
            return;
        }

        // Clear the canvas before drawing.
        targetContext.clearRect(0, 0, targetContext.canvas.width, targetContext.canvas.height);

        // --- Probing wrapper for drawing calls (Type III addition) ---
        let originalFillRect, originalStrokeRect, originalFillText, originalStrokeText;
        if (useOffscreenContext) {
            // Save original methods
            originalFillRect = targetContext.fillRect;
            originalStrokeRect = targetContext.strokeRect;
            originalFillText = targetContext.fillText;
            originalStrokeText = targetContext.strokeText;

            // Wrap methods to detect hits
            targetContext.fillRect = function(x, y, w, h) {
                originalFillRect.apply(targetContext, arguments);
                if (APP_CORE.currentOperatingLineNumber > 0 &&
                    debugXCoord >= x && debugXCoord < x + w &&
                    debugYCoord >= y && debugYCoord < y + h) {
                    // Check if the pixel is actually drawn (not fully transparent)
                    const pixel = targetContext.getImageData(debugXCoord, debugYCoord, 1, 1).data;
                    if (pixel[3] > 0) { // Check alpha channel
                        debugHitLine = APP_CORE.currentOperatingLineNumber;
                    }
                }
            };

            targetContext.strokeRect = function(x, y, w, h) {
                originalStrokeRect.apply(targetContext, arguments);
                // Simple bounding box check for strokes, more advanced would involve path tracing.
                if (APP_CORE.currentOperatingLineNumber > 0 &&
                    debugXCoord >= x && debugXCoord < x + w &&
                    debugYCoord >= y && debugYCoord < y + h) {
                    const pixel = targetContext.getImageData(debugXCoord, debugYCoord, 1, 1).data;
                    if (pixel[3] > 0) {
                        debugHitLine = APP_CORE.currentOperatingLineNumber;
                    }
                }
            };

            // Basic text hit detection
            targetContext.fillText = function(text, x, y, maxWidth) {
                originalFillText.apply(targetContext, arguments);
                // Approximate hit detection for text based on current font metrics
                if (APP_CORE.currentOperatingLineNumber > 0) {
                    const metrics = targetContext.measureText(text);
                    const textWidth = metrics.width;
                    const textHeight = parseFloat(targetContext.font); // Rough estimate
                    if (debugXCoord >= x && debugXCoord < x + textWidth &&
                        debugYCoord >= y - textHeight && debugYCoord < y) { // Adjust for baseline
                        const pixel = targetContext.getImageData(debugXCoord, debugYCoord, 1, 1).data;
                        if (pixel[3] > 0) {
                            debugHitLine = APP_CORE.currentOperatingLineNumber;
                        }
                    }
                }
            };
            // Similar for strokeText
        }
        // --- End Probing wrapper ---

        // Execute the user's drawing function.
        // This calls the global `paintCanvas` function, which the user's script defines.
        try {
            if (typeof window.paintCanvas === 'function') {
                window.paintCanvas(targetContext);
            } else {
                console.warn("`paintCanvas` function is not defined by user script.");
            }
        } catch (e) {
            reportRuntimeError(e.message, APP_CORE.currentOperatingLineNumber);
            pauseAnimationLoop(); // Stop loop on runtime error.
            return;
        } finally {
            // Restore original drawing methods if they were wrapped for probing.
            if (useOffscreenContext) {
                targetContext.fillRect = originalFillRect;
                targetContext.strokeRect = originalStrokeRect;
                targetContext.fillText = originalFillText;
                targetContext.strokeText = originalStrokeText;
            }
        }


        // Restore global variables if they were preserved.
        if (preserveGlobals && globalStateBackup) {
            for (const propName in globalStateBackup) {
                window[propName] = globalStateBackup[propName];
            }
        }
    }

    /**
     * Starts the animation loop, calling executeRenderCycle at a set interval.
     */
    function beginAnimationLoop() {
        if (animationIntervalId) {
            clearInterval(animationIntervalId); // Clear any existing interval first
        }
        if (updateCycleDelayMs > 0 && Number.isFinite(updateCycleDelayMs)) {
            animationIntervalId = window.setInterval(executeRenderCycle, updateCycleDelayMs);
            console.log(`Animation loop started with a delay of ${updateCycleDelayMs}ms.`);
        } else {
            console.warn("Animation loop not started: updateCycleDelayMs is zero or negative or infinite.");
        }
    }

    /**
     * Pauses the animation loop.
     */
    function pauseAnimationLoop() {
        if (animationIntervalId) {
            window.clearInterval(animationIntervalId);
            animationIntervalId = undefined;
            console.log("Animation loop paused.");
        }
    }

    /**
     * Reports a runtime error, highlighting the line in the editor and displaying a message.
     * @param {string} message - The error message.
     * @param {number} lineNumber - The 1-indexed line number where the error occurred.
     */
    function reportRuntimeError(message, lineNumber) {
        console.error(`Runtime Error (Line ${lineNumber}): ${message}`);
        if (highlightedIssueLine >= 0) {
            codeMirrorInstance.removeLineClass(highlightedIssueLine, "background", "errorLine");
            codeMirrorInstance.clearGutter("error-gutter-marker");
        }

        // CodeMirror is 0-indexed, so convert 1-indexed line number.
        highlightedIssueLine = lineNumber - 1;
        issueDescription = message;

        if (codeMirrorInstance) {
            codeMirrorInstance.addLineClass(highlightedIssueLine, "background", "errorLine");
            codeMirrorInstance.setGutterMarker(highlightedIssueLine, "error-gutter-marker", createErrorMarkerElement());
            displayIssueDetailsForLine(highlightedIssueLine); // Show popover immediately.
            codeMirrorInstance.scrollIntoView({ line: highlightedIssueLine, ch: 0 }, 50); // Scroll to error.
        }
    }

    /**
     * Initializes the CodeMirror editor and event listeners.
     * This function should be called once the DOM is ready.
     * @param {HTMLElement} editorTextArea - The <textarea> DOM element for the CodeMirror editor.
     * @param {HTMLCanvasElement} canvasDisplayElement - The main canvas DOM element.
     * @param {HTMLCanvasElement} offscreenCanvasDebugElement - The offscreen canvas DOM element.
     */
    function initializeApplication(editorTextArea, canvasDisplayElement, offscreenCanvasDebugElement) {
        if (!editorTextArea || !canvasDisplayElement || !offscreenCanvasDebugElement) {
            console.error("Missing required DOM elements for initialization.");
            return;
        }

        codeMirrorInstance = CodeMirror.fromTextArea(editorTextArea, {
            lineNumbers: true,
            mode: "javascript",
            theme: "default", // Or a custom theme
            gutters: ["CodeMirror-linenumbers", "error-gutter-marker"],
            extraKeys: {
                "Ctrl-Space": "autocomplete", // Example extra key binding
                "Cmd-Space": "autocomplete"
            }
        });

        // Load code from local storage if available.
        const storedCode = window.localStorage.getItem("code");
        if (storedCode) {
            codeMirrorInstance.setValue(storedCode);
        } else {
            // Default code for new users
            codeMirrorInstance.setValue(`// Welcome to Code Maestro!
// Define 'setupScene' for one-time initialization, and 'paintCanvas' for drawing each frame.
// 'ctx' (CanvasRenderingContext2D) is passed to paintCanvas.

let xPos = 50;
let yPos = 50;
let xSpeed = 2;
let ySpeed = 1;
let boxSize = 20;

setupScene = function() {
    console.log("Scene setup complete!");
    // You can set initial values here.
    // xPos = ctx.canvas.width / 2;
};

paintCanvas = function(ctx) {
    // Clear canvas with a light background.
    ctx.fillStyle = generateRGBAString(240, 240, 240, 1);
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Update position for animation.
    xPos += xSpeed;
    yPos += ySpeed;

    // Bounce off walls.
    if (xPos + boxSize > ctx.canvas.width || xPos < 0) {
        xSpeed *= -1;
    }
    if (yPos + boxSize > ctx.canvas.height || yPos < 0) {
        ySpeed *= -1;
    }

    // Draw the moving box.
    ctx.fillStyle = generateRGBAString(100, 150, 200, 0.8);
    ctx.fillRect(xPos, yPos, boxSize, boxSize);

    // Respond to arrow key inputs.
    if (userKeyStates.leftArrow) xPos -= 5;
    if (userKeyStates.rightArrow) xPos += 5;
    if (userKeyStates.upArrow) yPos -= 5;
    if (userKeyStates.downArrow) yPos += 5;

    // Hint: Hold Alt/Cmd and drag numbers in the code to change them interactively!
    // Try dragging 'xPos', 'yPos', 'boxSize', or '5'.
};`);
        }


        // Set up canvas contexts.
        mainCanvasElement = canvasDisplayElement;
        mainCanvasContext = mainCanvasElement.getContext("2d");

        offscreenCanvas = offscreenCanvasDebugElement;
        offscreenContext = offscreenCanvas.getContext("2d", { willReadFrequently: true }); // Important for performance when reading pixels.

        // Ensure canvases have the same dimensions.
        offscreenCanvas.width = mainCanvasElement.width;
        offscreenCanvas.height = mainCanvasElement.height;


        // Register editor event listeners.
        codeMirrorInstance.on("change", onCodeContentModified);
        codeMirrorInstance.on("cursorActivity", onEditorCursorChange);
        codeMirrorInstance.on("gutterClick", onEditorGutterClick);
        codeMirrorInstance.on("focus", () => { codeEditorIsFocused = true; });
        codeMirrorInstance.on("blur", () => { codeEditorIsFocused = false; });

        // Register global document/canvas event listeners.
        document.addEventListener("keydown", handleKeyDownEvent);
        document.addEventListener("keyup", handleKeyUpEvent);
        document.addEventListener("mousedown", handlePointerDown);
        document.addEventListener("mousemove", handlePointerMove);
        document.addEventListener("mouseup", handlePointerUp);
        mainCanvasElement.addEventListener("mouseout", handleCanvasMouseExit);

        // Initial code load and run.
        refreshExecutableCode(codeMirrorInstance.getValue());
    }

    // Public API of the APP_CORE module.
    return {
        // Expose the initialization function.
        init: initializeApplication,
        // Expose framerate adjustment.
        setLoopFrequency: function(fps) {
            if (typeof fps !== 'number' || fps <= 0 || !Number.isFinite(fps)) {
                console.error("Invalid FPS value for setLoopFrequency. Must be a positive, finite number.");
                return false;
            }
            updateCycleDelayMs = 1000 / fps;
            if (animationIntervalId) { // If currently animating, restart with new frequency
                beginAnimationLoop();
            }
            return true;
        },
        // Property used by injected code to track current line.
        currentOperatingLineNumber: 0, // This will be set by the injected code.
        // Expose for debugging/external access
        getEditorContent: () => codeMirrorInstance ? codeMirrorInstance.getValue() : "",
        getValidationIssues: () => validationIssues,
        // Methods for the probing mechanism to interact with internal state.
        getProbeX: function() { return debugXCoord; },
        getProbeY: function() { return debugYCoord; },
        setProbeLine: function(line) { debugHitLine = line; }
    };

}());
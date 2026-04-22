if (!console) {
    var console = { log: function (msg) { "use strict"; } };
}

if (typeof Object.create !== 'function') {
    "use strict";
    Object.create = function (proto) {
        function Constructor() { }
        Constructor.prototype = proto;
        return new Constructor();
    };
}

var appCoreInstance;
var userDrawingFunction;
var KeyboardState = { isLeftPressed: false, isDownPressed: false, isRightPressed: false, isUpPressed: false };

userDrawingFunction = function (ctx) { };

function setDrawingRate(framesPerSecond) {
    "use strict";
    return appCoreInstance.setAnimationDelay(framesPerSecond);
}

function makeRGBAString(red, green, blue, alpha) {
    "use strict";
    return `rgba(${red},${green},${blue},${alpha === undefined ? 1 : alpha})`;
}

function isDefinedAndNotNull(val) {
    "use strict";
    return (typeof val !== "undefined" && val !== null);
}

class ApplicationCore {
    constructor() {
        "use strict";
        this.textEditorInstance = null;
        this.codeAnalyzerAgent = null;
        this.syntaxIssueLog = [];

        this.activeIssueLine = -1;
        this.activeIssueDetail = "";
        this.numericalSliderActive = null;
        this.lastPointerCoords = null;
        this.previousCursorRow = -1;
        this.modifierKeyActive = false;

        this.mainDisplaySurface = null;
        this.mainDrawingContext = null;
        this.inspectionSurface = null;
        this.inspectionContext = null;
        this.inspectionRow = -1;

        this.inspectionX = 0;
        this.inspectionY = 0;

        this.currentScriptElement = null;
        this.animationHandle = null;
        this.initialGlobalState = new Map();
        this.frameDelayMilliseconds = 17;

        this.editorIsFocused = false;
        this.highlightColorHex = "#e33";

        this.lineMarker = (() => {
            let markedLine = -1;
            const markLine = (newRowNumber) => {
                if (this.textEditorInstance) {
                    this.textEditorInstance.setLineClass(markedLine - 1, undefined);
                    markedLine = newRowNumber;
                    if (markedLine !== -1) {
                        this.textEditorInstance.setLineClass(markedLine - 1, "highlightLine");
                    }
                    if (!this.animationHandle) {
                        this.performDrawingCycle(true, false);
                    }
                }
            };
            const getCurrentMarkedLine = () => markedLine;
            return { markLine, getCurrentMarkedLine };
        })();

        this.inspectionControl = (() => {
            let inspectionModeActive = false;
            const activateInspection = (shouldActivate) => {
                inspectionModeActive = shouldActivate;
                const inspectionButton = document.getElementById("inspectionToggle");
                if (inspectionModeActive) {
                    this.terminateAnimation();
                    document.body.className = "inspectCursor";
                    if (inspectionButton) inspectionButton.className = "button buttonPressed";
                } else {
                    this.initiateAnimation();
                    this.lineMarker.markLine(-1);
                    document.body.className = undefined;
                    if (inspectionButton) inspectionButton.className = "button";
                }
            };
            const isInspectionActive = () => inspectionModeActive;
            return { activateInspection, isInspectionActive };
        })();

        this.globalPropertyFilter = {
            number: true,
            boolean: true,
            string: true
        };

        window.activeExecutionLine = -1;
    }

    handleKeyPressDown(event) {
        if (!this.editorIsFocused) {
            switch (event.keyCode) {
                case 37: KeyboardState.isLeftPressed = true; break;
                case 38: KeyboardState.isUpPressed = true; break;
                case 39: KeyboardState.isRightPressed = true; break;
                case 40: KeyboardState.isDownPressed = true; break;
            }
        }
        if (event.keyCode === 91 || event.keyCode === 18) {
            this.modifierKeyActive = true;
        }
    }

    handleKeyPressUp(event) {
        switch (event.keyCode) {
            case 37: KeyboardState.isLeftPressed = false; break;
            case 38: KeyboardState.isUpPressed = false; break;
            case 39: KeyboardState.isRightPressed = false; break;
            case 40: KeyboardState.isDownPressed = false; break;
        }
        if (event.keyCode === 91 || event.keyCode === 18) {
            this.modifierKeyActive = false;
        }
    }

    concealIssueDisplay() {
        const displayElement = document.getElementById("issueReportDisplay");
        if (displayElement) displayElement.className = "hideReport";
    }

    analyzeCodeCompletion(event) {
        this.syntaxIssueLog = event.data.issues;

        if (!event.data.passed) {
            for (let i = 0; i < this.syntaxIssueLog.length; i += 1) {
                const issue = this.syntaxIssueLog[i];
                if (issue && this.textEditorInstance) {
                    this.textEditorInstance.setLineClass(issue.line, "errorLine");
                    this.textEditorInstance.setMarker(issue.line, " ", "errorMarker");
                }
            }
        }

        if (this.activeIssueLine >= 0 && this.textEditorInstance) {
            this.textEditorInstance.setLineClass(this.activeIssueLine, "errorLine");
            this.textEditorInstance.setMarker(this.activeIssueLine, " ", "errorMarker");
        }
    }

    sourceCodeModified(editorArg, changeInfo) {
        if (this.codeAnalyzerAgent) {
            this.codeAnalyzerAgent.postMessage({ command: "HALT" });
            this.codeAnalyzerAgent = null;
        }

        const currentSource = editorArg.getValue();
        window.localStorage.code = currentSource;

        if (!this.numericalSliderActive) {
            this.activeIssueLine = -1;
            this.concealIssueDisplay();
            this.syntaxIssueLog = [];

            if (this.textEditorInstance) {
                for (let i = 0; i < this.textEditorInstance.lineCount(); i++) {
                    this.textEditorInstance.setLineClass(i, undefined);
                    this.textEditorInstance.clearMarker(i);
                }
            }

            console.log("Messaging analysis agent");
            this.codeAnalyzerAgent = new Worker('scripts/codeAnalysisWorker.js');
            this.codeAnalyzerAgent.addEventListener("message", this.analyzeCodeCompletion.bind(this), false);
            this.codeAnalyzerAgent.postMessage({ command: "ANALYZE_SOURCE", source: currentSource });
        }

        this.refreshExecutableCode(currentSource);
    }

    presentIssueForLine(row) {
        let issueDisplayString = "";
        for (let i = 0; i < this.syntaxIssueLog.length; i++) {
            const issue = this.syntaxIssueLog[i];
            if (isDefinedAndNotNull(issue) && issue.line === row) {
                issueDisplayString += issue.reason + "\n";
                break;
            }
        }

        if (this.activeIssueLine === row) {
            issueDisplayString = this.activeIssueDetail;
        }

        if (issueDisplayString.length > 1) {
            const displayElement = document.getElementById("issueReportDisplay");
            if (displayElement && this.textEditorInstance) {
                displayElement.innerHTML = issueDisplayString;
                displayElement.style.top = this.textEditorInstance.charCoords({ line: row + 1, ch: 0 }).y + 2 + "px";
                displayElement.className = "";
                displayElement.addEventListener('mouseout', this.concealIssueDisplay.bind(this), true);
            }
        }
    }

    pointerExitHandler(event) {
        this.lineMarker.markLine(-1);
    }

    pointerDownHandler(event) {
        if (this.modifierKeyActive && this.textEditorInstance) {
            this.lastPointerCoords = { x: event.pageX, y: event.pageY };
            const editorPosition = this.textEditorInstance.coordsChar(this.lastPointerCoords);
            const tokenContent = this.textEditorInstance.getTokenAt(editorPosition);

            if (!isNaN(tokenContent.string) && tokenContent.className === "number" && !this.textEditorInstance.somethingSelected()) {
                this.numericalSliderActive = tokenContent;
                this.numericalSliderActive.lineNumber = editorPosition.line;

                const prefixToken = this.textEditorInstance.getTokenAt({ line: editorPosition.line, ch: tokenContent.start });
                if (prefixToken && prefixToken.string === '-') {
                    this.numericalSliderActive.start -= 1;
                    this.numericalSliderActive.string = '-' + this.numericalSliderActive.string;
                }

                event.stopPropagation();
            } else {
                this.numericalSliderActive = null;
            }
        }
    }

    pointerMoveHandler(event) {
        if (this.numericalSliderActive && this.textEditorInstance) {
            this.numericalSliderActive.dragged = true;

            const newNumericString = String(parseFloat(this.numericalSliderActive.string) + (event.pageX - this.lastPointerCoords.x));

            this.textEditorInstance.replaceRange(newNumericString,
                { line: this.numericalSliderActive.lineNumber, ch: this.numericalSliderActive.start },
                { line: this.numericalSliderActive.lineNumber, ch: this.numericalSliderActive.end });

            this.numericalSliderActive.string = newNumericString;
            this.numericalSliderActive.end = this.numericalSliderActive.start + this.numericalSliderActive.string.length;

            this.textEditorInstance.setSelection({ line: this.numericalSliderActive.lineNumber, ch: this.numericalSliderActive.start },
                { line: this.numericalSliderActive.lineNumber, ch: this.numericalSliderActive.end });
            event.stopPropagation();
        }

        this.lastPointerCoords = { x: event.pageX, y: event.pageY };

        if (this.inspectionControl.isInspectionActive()) {
            const mainCanvas = document.getElementById("MainDrawingSurface");
            if (mainCanvas && mainCanvas === event.target) {
                const detectedLine = this.determineRenderLineAtCoordinates(event.offsetX, event.offsetY);
                this.lineMarker.markLine(detectedLine);
                if (typeof scrollToLine === 'function') scrollToLine(detectedLine - 1);
                else if (this.textEditorInstance && this.textEditorInstance.scrollIntoView) this.textEditorInstance.scrollIntoView({ line: detectedLine - 1, ch: 0 }, 100);
            }
        }
    }

    pointerUpHandler(event) {
        if (this.numericalSliderActive && this.textEditorInstance) {
            const tempSlider = this.numericalSliderActive;

            if (this.numericalSliderActive.dragged) {
                setTimeout(() => {
                    this.textEditorInstance.setCursor({ line: tempSlider.lineNumber + 1, ch: 1 });
                    this.textEditorInstance.setCursor({ line: tempSlider.lineNumber, ch: tempSlider.end });
                }, 1);
            }
        }
        this.numericalSliderActive = null;

        const inspectionButton = document.getElementById("inspectionToggle");
        if (inspectionButton && event.target === inspectionButton) {
            this.inspectionControl.activateInspection(!this.inspectionControl.isInspectionActive());
        } else {
            this.inspectionControl.activateInspection(false);
        }
    }

    cursorPositionChanged() {
        if (this.numericalSliderActive && this.textEditorInstance) {
            this.textEditorInstance.setSelection(
                { line: this.numericalSliderActive.lineNumber, ch: this.numericalSliderActive.start },
                { line: this.numericalSliderActive.lineNumber, ch: this.numericalSliderActive.end }
            );
        } else if (this.textEditorInstance) {
            const currentCursorRow = this.textEditorInstance.getCursor().line;
            if (this.previousCursorRow !== currentCursorRow) {
                this.presentIssueForLine(currentCursorRow);
            }
            this.previousCursorRow = currentCursorRow;
        }
    }

    editorGutterClicked(editorInstance, rowNumber, event) {
        this.presentIssueForLine(rowNumber);
    }

    refreshExecutableCode(sourceCode) {
        this.terminateAnimation();

        const priorGlobals = new Map();
        for (const propName in window) {
            if (window.hasOwnProperty(propName) && this.globalPropertyFilter[typeof window[propName]]) {
                priorGlobals.set(propName, window[propName]);
            }
        }

        const sourceLines = sourceCode.split("\n");
        const augmentedLines = sourceLines.map((line, index) =>
            `window.activeExecutionLine=${index + 1};${line}`
        );
        const fullAugmentedSource = '"use strict"; ' + augmentedLines.join("\n");

        const scriptInjectionArea = document.getElementById("scriptInjectionArea");
        const newCodeScript = document.createElement('script');
        newCodeScript.type = 'text/javascript';

        const scriptContentNode = document.createTextNode(fullAugmentedSource);
        newCodeScript.appendChild(scriptContentNode);

        if (scriptInjectionArea) {
            while (scriptInjectionArea.firstChild) {
                scriptInjectionArea.removeChild(scriptInjectionArea.firstChild);
            }
            try {
                scriptInjectionArea.appendChild(newCodeScript);
            } catch (e) {
                console.log("Compilation Error: " + e);
            }
        }

        for (const propName in window) {
            if (this.globalPropertyFilter[(typeof window[propName]) + ""]) {
                if (!priorGlobals.has(propName)) {
                    this.initialGlobalState.set(propName, window[propName]);
                } else {
                    if (window[propName] !== priorGlobals.get(propName)) {
                        if (window[propName] === this.initialGlobalState.get(propName)) {
                            window[propName] = priorGlobals.get(propName);
                        } else {
                            this.initialGlobalState.set(propName, window[propName]);
                        }
                    }
                }
            }
        }

        this.performDrawingCycle();
        this.initiateAnimation();
    }

    determineRenderLineAtCoordinates(xCoord, yCoord) {
        const wasAnimating = this.animationHandle;

        this.inspectionX = xCoord;
        this.inspectionY = yCoord;

        this.inspectionRow = -1;
        this.performDrawingCycle(true, true);

        return this.inspectionRow;
    }

    performDrawingCycle(preventVariableUpdate = false, useInspectionContext = false) {
        let priorGlobalValues = null;

        if (preventVariableUpdate) {
            priorGlobalValues = new Map();
            for (const propName in window) {
                if (window.hasOwnProperty(propName) && this.globalPropertyFilter[typeof window[propName]]) {
                    priorGlobalValues.set(propName, window[propName]);
                }
            }
        }

        if (userDrawingFunction) {
            userDrawingFunction(useInspectionContext ? this.inspectionContext : this.mainDrawingContext);
        }

        if (preventVariableUpdate && priorGlobalValues) {
            for (const [propName, value] of priorGlobalValues) {
                window[propName] = value;
            }
        }
    }

    initiateAnimation() {
        if (!this.animationHandle && this.frameDelayMilliseconds > 0) {
            this.animationHandle = window.setInterval(this.performDrawingCycle.bind(this), this.frameDelayMilliseconds);
        }
    }

    terminateAnimation() {
        if (this.animationHandle) {
            window.clearInterval(this.animationHandle);
        }
        this.animationHandle = null;
    }

    reportRuntimeIssue(message, lineNumber) {
        console.log("User script runtime error: " + message);
        if (this.activeIssueLine >= 0 && this.textEditorInstance) {
            this.textEditorInstance.setLineClass(this.activeIssueLine, null);
            this.textEditorInstance.clearMarker(this.activeIssueLine);
        }
        this.activeIssueLine = lineNumber - 1;
        if (this.textEditorInstance) {
            this.textEditorInstance.setLineClass(this.activeIssueLine, "errorLine");
            this.textEditorInstance.setMarker(this.activeIssueLine, " ", "errorMarker");
        }
        this.activeIssueDetail = message;
    }

    setAnimationDelay(framesPerSecond) {
        this.frameDelayMilliseconds = Math.floor(1000 / framesPerSecond);
        if (this.animationHandle) {
            this.terminateAnimation();
            this.initiateAnimation();
        }
        return this.frameDelayMilliseconds;
    }

    initialize(editor, mainCanvas, inspectionCanvas) {
        this.textEditorInstance = editor;
        this.mainDisplaySurface = mainCanvas;
        this.mainDrawingContext = mainCanvas ? mainCanvas.getContext('2d') : null;
        this.inspectionSurface = inspectionCanvas;
        this.inspectionContext = inspectionCanvas ? inspectionCanvas.getContext('2d') : null;

        document.addEventListener('keydown', this.handleKeyPressDown.bind(this), false);
        document.addEventListener('keyup', this.handleKeyPressUp.bind(this), false);
        document.addEventListener('mousedown', this.pointerDownHandler.bind(this), false);
        document.addEventListener('mousemove', this.pointerMoveHandler.bind(this), false);
        document.addEventListener('mouseup', this.pointerUpHandler.bind(this), false);

        if (this.textEditorInstance) {
            this.textEditorInstance.on("change", this.sourceCodeModified.bind(this));
            this.textEditorInstance.on("cursorActivity", this.cursorPositionChanged.bind(this));
            this.textEditorInstance.on("gutterClick", this.editorGutterClicked.bind(this));
            this.textEditorInstance.on("focus", () => this.editorIsFocused = true);
            this.textEditorInstance.on("blur", () => this.editorIsFocused = false);
        }
    }
}

appCoreInstance = new ApplicationCore();
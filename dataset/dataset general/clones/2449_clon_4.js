(function() {
    const styleSheetElement = document.createElement('style');
    styleSheetElement.textContent = `
        .code-area-no-height-limit { height: auto !important; }
        .code-area-temporarily-visible { display: block !important; visibility: visible !important; }
    `;
    document.head.appendChild(styleSheetElement);
})();

const CodeLabInstances = (() => {
    const editorMap = new Map();

    return {
        editorMap,
        retrieveEditor: (key) => editorMap.get(key)
    };
})();

class InteractiveCodeEditor {
    #uniqueKey;
    #isSteppingEnabled = false;
    #lastContentLength = -1;
    #initialCodeSnippet = "";
    #activeLineNumber = 1;

    #sourceElement;
    #resultElement;
    #codeMirrorArea;
    #singleLineHeight;

    #originalGlobalHandlers = {};

    constructor(sourceHostElement, resultDisplayElement, configuration = {}) {
        this.#sourceElement = sourceHostElement instanceof $ ? sourceHostElement[0] : sourceHostElement;
        this.#resultElement = resultDisplayElement instanceof $ ? resultDisplayElement[0] : resultDisplayElement;

        this.#uniqueKey = configuration.identifier || `editor_instance_${Math.floor(Math.random() * 1000000000000)}`;

        const existingId = this.#sourceElement.getAttribute("cloneditorid");
        if (existingId && CodeLabInstances.retrieveEditor(existingId)) {
            return CodeLabInstances.retrieveEditor(existingId);
        } else {
            this.#sourceElement.setAttribute("cloneditorid", this.#uniqueKey);
        }

        this.#initializeDOM();
        this.#setupEventListeners();
        this.#calculateLineHeight();

        CodeLabInstances.editorMap.set(this.#uniqueKey, this);
        return this;
    }

    #initializeDOM() {
        this.#codeMirrorArea = document.createElement("textarea");
        this.#codeMirrorArea.style.cssText = 'outline: none; z-index:10; position: relative; width: 100%; height: 95%; background: rgba(255,255,255,0); border: none; text-decoration: none; overflow-y: hidden; overflow-x: auto;';
        this.#codeMirrorArea.setAttribute("wrap", "off");

        this.#initialCodeSnippet = this.#sourceElement.innerHTML;
        this.#codeMirrorArea.value = this.#initialCodeSnippet;
        this.#sourceElement.innerHTML = '';
        this.#sourceElement.appendChild(this.#codeMirrorArea);
    }

    #setupEventListeners() {
        this.#sourceElement.addEventListener("keydown", (evt) => {
            this.#lastContentLength = this.#codeMirrorArea.value.length;
            if ((evt.key === "r" && evt.ctrlKey) || evt.key === "F9") {
                evt.preventDefault();
                evt.stopPropagation();
                this.executeCodeSnippet();
            }
        });

        const handleInputActivity = () => {
            this.#adjustTextareaToContent();
            this.eraseExecutionOutput(true);
        };

        this.#sourceElement.addEventListener("keyup", handleInputActivity);
        this.#sourceElement.addEventListener("focusin", handleInputActivity);
        this.#sourceElement.addEventListener("focusout", handleInputActivity);
    }

    #adjustTextareaToContent() {
        if (this.#lastContentLength !== this.#codeMirrorArea.value.length) {
            const initialHeight = this.#codeMirrorArea.clientHeight;
            this.#codeMirrorArea.style.height = 'auto';
            this.#codeMirrorArea.style.height = `${this.#codeMirrorArea.scrollHeight}px`;

            if (this.#codeMirrorArea.clientHeight > initialHeight) {
                this.#codeMirrorArea.parentElement.scrollTo({
                    top: this.#codeMirrorArea.scrollHeight,
                    behavior: 'auto'
                });
            }
        }
    }

    #calculateLineHeight() {
        const measureElement = this.#codeMirrorArea;
        const tempText = "line 1\nline 2\nline 3\nline 4\nline 5\nline 6\nline 7\nline 8\nline 9\nline 10";
        const originalText = measureElement.value;

        measureElement.classList.add("code-area-no-height-limit");
        measureElement.value = tempText;

        this.#singleLineHeight = measureElement.scrollHeight / 10;

        if (!this.#singleLineHeight) {
            let parentChain = [];
            let currentParent = measureElement.parentElement;
            while (currentParent && currentParent !== document.body) {
                parentChain.push(currentParent);
                currentParent = currentParent.parentElement;
            }
            parentChain.forEach(p => p.classList.add("code-area-temporarily-visible"));

            this.#singleLineHeight = measureElement.scrollHeight / 10;
            measureElement.value = originalText;
            this.#adjustTextareaToContent();
            parentChain.forEach(p => p.classList.remove("code-area-temporarily-visible"));
        } else {
            measureElement.value = originalText;
        }
        measureElement.classList.remove("code-area-no-height-limit");
        this.#codeMirrorArea.style.height = `${this.#codeMirrorArea.scrollHeight}px`;
    }

    #revertGlobalState() {
        for (const prop in this.#originalGlobalHandlers) {
            if (Object.prototype.hasOwnProperty.call(this.#originalGlobalHandlers, prop)) {
                if (prop === "console.log" && typeof console !== 'undefined') {
                    console.log = this.#originalGlobalHandlers[prop];
                } else if (prop === "window.alert") {
                    window.alert = this.#originalGlobalHandlers[prop];
                } else if (prop === "window.onerror") {
                    window.onerror = this.#originalGlobalHandlers[prop];
                }
            }
        }
        this.#originalGlobalHandlers = {};
    }

    #arrangeOutputMarkers() {
        const outputLines = this.#resultElement.querySelectorAll(".code-feedback-line");
        outputLines.forEach(currentLineEl => {
            const currentLineNum = parseInt(currentLineEl.getAttribute("data-line"));
            let lowestNextLineNum = -1;

            outputLines.forEach(otherLineEl => {
                const otherLineNum = parseInt(otherLineEl.getAttribute("data-line"));
                if (otherLineNum > currentLineNum && (lowestNextLineNum === -1 || lowestNextLineNum > otherLineNum)) {
                    lowestNextLineNum = otherLineNum;
                }
            });

            currentLineEl.style.height = "auto";
            if (lowestNextLineNum !== -1) {
                const availableSpace = lowestNextLineNum - currentLineNum;
                if (currentLineEl.clientHeight > (availableSpace * this.#singleLineHeight)) {
                    currentLineEl.style.height = `${availableSpace * this.#singleLineHeight}px`;
                }
            }
        });
    }

    #renderStepIndicator() {
        let inputIndicator = this.#sourceElement.querySelector(".code-step-indicator");
        let outputIndicator = this.#resultElement.querySelector(".code-step-indicator");

        const topPosition = (this.#singleLineHeight * (this.#activeLineNumber - 1));
        const indicatorStyle = `background: #ffa; position:absolute; left: 0px; top:${topPosition}px; height: ${this.#singleLineHeight}px; display: block; width: 100%; z-index: 2; overflow: hidden;`;
        const indicatorContent = "&nbsp;";

        if (!inputIndicator) {
            inputIndicator = document.createElement("div");
            inputIndicator.className = "code-step-indicator";
            inputIndicator.style.cssText = indicatorStyle;
            inputIndicator.innerHTML = indicatorContent;
            this.#sourceElement.prepend(inputIndicator);
        } else {
            inputIndicator.setAttribute("data-line", this.#activeLineNumber);
            inputIndicator.style.top = `${topPosition}px`;
        }

        if (!outputIndicator) {
            outputIndicator = document.createElement("div");
            outputIndicator.className = "code-step-indicator";
            outputIndicator.style.cssText = indicatorStyle;
            outputIndicator.innerHTML = indicatorContent;
            this.#resultElement.appendChild(outputIndicator);
        } else {
            outputIndicator.setAttribute("data-line", this.#activeLineNumber);
            outputIndicator.style.top = `${topPosition}px`;
        }
    }

    #clearStepIndicator() {
        this.#sourceElement.querySelectorAll(".code-step-indicator").forEach(el => el.remove());
        this.#resultElement.querySelectorAll(".code-step-indicator").forEach(el => el.remove());
    }

    beginSteppedExecution() {
        this.#isSteppingEnabled = true;
        this.executeCodeSnippet();
        this.#isSteppingEnabled = false;
        this.#clearStepIndicator();
    }

    executeCodeSnippet() {
        this.#activeLineNumber = 1;

        const currentInstance = this;
        this.#originalGlobalHandlers["window.alert"] = window.alert;
        window.alert = (msg) => currentInstance.displayMessage(msg);

        if (typeof console !== "undefined" && typeof console.log !== "undefined") {
            this.#originalGlobalHandlers["console.log"] = console.log;
            console.log = window.alert;
        }

        this.#originalGlobalHandlers["window.onerror"] = window.onerror;
        window.onerror = (message, url, lineNo) => {
            let processedMessage = message;
            let errorType = "Runtime Error";
            let detectedLineNo = lineNo;

            const lineIndex = message.indexOf("Line");
            if (lineIndex > -1) {
                const until = message.indexOf(":", lineIndex);
                detectedLineNo = parseInt(message.slice(lineIndex + 4, until), 10);
                processedMessage = message.slice(until + 2);
                errorType = "Syntax Error";
            } else if (message.indexOf("Uncaught") === 0) {
                processedMessage = message.slice(message.indexOf(":", 8) + 2);
            }

            if (errorType === "Runtime Error") {
                currentInstance.displayMessage(processedMessage, "Runtime Error");
                currentInstance.#revertGlobalState();
                currentInstance.#arrangeOutputMarkers();
            } else {
                currentInstance.displayMessage(processedMessage, "Syntax Error");
            }
            return true;
        };

        this.eraseExecutionOutput();

        let inputCode = this.#codeMirrorArea.value;

        let parsedAnalysis;
        try {
            parsedAnalysis = esprima.parse(inputCode, { range: true, loc: true });
        } catch (e) {
            this.displayMessage(`Parsing error: ${e.message}`, "Error");
            this.#revertGlobalState();
            return;
        }
        
        const insertionPoints = [];

        const stack = [{ node: parsedAnalysis, parents: [] }];
        while (stack.length > 0) {
            const { node, parents } = stack.pop();

            if (node.type === "ForStatement" || node.type === "VariableDeclaration" || node.type === "ExpressionStatement") {
                let shouldInsert = true;
                if (node.type === "VariableDeclaration" && parents.length > 0 && parents[0].type === "ForStatement") {
                    shouldInsert = false;
                }
                if (shouldInsert) {
                    insertionPoints.push({ range: node.range, location: node.loc });
                }
            }

            for (const key in node) {
                if (Object.prototype.hasOwnProperty.call(node, key)) {
                    const child = node[key];
                    if (typeof child === 'object' && child !== null) {
                        if (Array.isArray(child)) {
                            for (let i = child.length - 1; i >= 0; i--) {
                                if (typeof child[i] === 'object' && child[i] !== null) {
                                    stack.push({ node: child[i], parents: [node, ...parents] });
                                }
                            }
                        } else {
                            stack.push({ node: child, parents: [node, ...parents] });
                        }
                    }
                }
            }
        }

        insertionPoints.sort((a, b) => b.range[0] - a.range[0]);

        let transformedCode = inputCode;
        for (const point of insertionPoints) {
            const insertionFunc = `CodeLabInstances.retrieveEditor('${this.#uniqueKey}').advanceStep(${point.location.start.line});`;
            transformedCode = transformedCode.slice(0, point.range[0]) + insertionFunc + transformedCode.slice(point.range[0]);
        }
        
        try {
            eval(transformedCode);
        } catch (e) {
            this.displayMessage(`Execution error: ${e.message}`, "Error");
        } finally {
            this.#revertGlobalState();
            this.#arrangeOutputMarkers();
        }
    }

    resetToInitialCode() {
        this.clearAllContent();
        this.#codeMirrorArea.value = this.#initialCodeSnippet;
        setTimeout(() => this.#adjustTextareaToContent(), 1);
    }

    updateCodeContent(newCode) {
        this.clearAllContent();
        this.#codeMirrorArea.value = newCode;
        setTimeout(() => this.#adjustTextareaToContent(), 1);
    }

    clearAllContent() {
        this.#codeMirrorArea.value = "";
        this.eraseExecutionOutput();
    }

    eraseExecutionOutput(withAnimation = false) {
        const inputMarkers = this.#sourceElement.querySelectorAll(".code-feedback-line");
        const outputContent = this.#resultElement.innerHTML;

        if (withAnimation) {
            inputMarkers.forEach(el => {
                el.style.transition = 'opacity 0.3s ease-out';
                el.style.opacity = '0';
                el.addEventListener('transitionend', () => el.remove(), { once: true });
            });

            if (outputContent.trim() !== "") {
                this.#resultElement.style.transition = 'opacity 0.3s ease-out';
                this.#resultElement.style.opacity = '0';
                this.#resultElement.addEventListener('transitionend', () => {
                    this.#resultElement.innerHTML = "";
                    this.#resultElement.style.opacity = '1';
                    this.#resultElement.style.transition = '';
                }, { once: true });
            } else {
                this.#resultElement.innerHTML = "";
            }
        } else {
            inputMarkers.forEach(el => el.remove());
            this.#resultElement.innerHTML = "";
        }
    }

    displayMessage(payload, kind = typeof payload) {
        kind = kind.charAt(0).toUpperCase() + kind.slice(1);
        let extraStyle = "";
        if (kind.toLowerCase().includes("error")) {
            extraStyle = "background: #CC1919; color: #fff;";
        }
        const currentLine = this.#activeLineNumber;

        const createMarkerDiv = (zIndex) => {
            const div = document.createElement("div");
            div.className = "code-feedback-line";
            div.setAttribute("data-line", currentLine);
            div.style.cssText = `background: #eef; position:absolute; left: 0px; top:${(this.#singleLineHeight * (currentLine - 1))}px; height: ${this.#singleLineHeight}px; display: block; width: 100%; z-index: ${zIndex}; overflow: hidden;`;
            
            div.addEventListener('mouseover', (e) => {
                e.target.setAttribute("data-backup-zindex", e.target.style.zIndex);
                e.target.setAttribute("data-backup-height", e.target.style.height);
                e.target.style.height = "auto";
                e.target.style.zIndex = "100";
            });
            div.addEventListener('mouseout', (e) => {
                e.target.style.height = e.target.getAttribute("data-backup-height");
                e.target.style.zIndex = e.target.getAttribute("data-backup-zindex");
            });
            return div;
        };

        const outputTypeLabel = `<div style='width: 130px; background: #dde; ${extraStyle} display: inline-block; z-index: 3;'>${kind}</div> `;
        let messageContent;

        if (typeof payload === 'function') {
            let funcString = payload.toString();
            funcString = funcString.replace(/CodeLabInstances\.retrieveEditor\('[^']+'\)\.advanceStep\([0-9]+\);/ig, "");
            messageContent = funcString;
        } else {
            messageContent = JSON.stringify(payload, null, 4);
        }

        const outputDiv = createMarkerDiv(3);
        outputDiv.innerHTML = outputTypeLabel + messageContent;
        this.#resultElement.appendChild(outputDiv);

        const inputDiv = createMarkerDiv(1);
        inputDiv.innerHTML = "&nbsp;";
        this.#sourceElement.prepend(inputDiv);
    }

    getIdentifier() {
        return this.#uniqueKey;
    }

    setIdentifier(newIdentifier) {
        CodeLabInstances.editorMap.delete(this.#uniqueKey);
        this.#uniqueKey = newIdentifier;
        CodeLabInstances.editorMap.set(this.#uniqueKey, this);
        this.#sourceElement.setAttribute("cloneditorid", this.#uniqueKey);
    }

    advanceStep(lineNumber) {
        this.#activeLineNumber = lineNumber;
        if (this.#isSteppingEnabled) {
            this.#renderStepIndicator();
            const dialogResult = window.showModalDialog("js/debug.html", null, "dialogleft:0;dialogtop:0;dialogheight:20;dialogwidth:200");
            if (dialogResult === "exitDebug") {
                this.#isSteppingEnabled = false;
                this.#clearStepIndicator();
            }
        }
    }

    proceedToNextStep() {
        // This method relies on the blocking nature of showModalDialog.
        // It's a no-op as the browser thread is blocked until the dialog closes.
    }
}
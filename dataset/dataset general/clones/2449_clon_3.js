let _mirrorCssInjected = false;

// Global initialization for styling
(($) => {
    $(() => {
        if (!_mirrorCssInjected) {
            const editorStyles = `
                .editor-no-fixed-height { height: auto !important; }
                .editor-visible-force { display: block !important; visibility: visible !important; }
                .line-execution-marker { background: #ffc; position: absolute; left: 0; top: 0; height: 1em; width: 100%; z-index: 2; overflow: hidden; }
                .output-line-marker { background: #eef; position: absolute; left: 0; top: 0; height: 1em; width: 100%; z-index: 3; overflow: hidden; }
                .output-log-type { width: 130px; background: #dde; display: inline-block; z-index: 3; padding: 2px 5px; }
                .output-log-error { background: #CC1919; color: #fff; }
                .output-log-wrapper { border-bottom: 1px solid #eee; margin-bottom: 2px; padding: 2px 0; }
            `;
            $("head").append(`<style type="text/css">${editorStyles}</style>`);
            _mirrorCssInjected = true;
        }
    });
})(jQuery); // Pass jQuery explicitly

/**
 * Manages all CodeMirrorInstance objects.
 * Provides a central registry for instances by their unique identifier.
 */
const CodeMirrorInstances = {
    registry: {}, // Stores active instances
    /**
     * Retrieves a CodeMirrorInstance by its unique ID.
     * @param {string} instanceId - The unique identifier of the instance.
     * @returns {CodeMirrorInstance|undefined} The found instance or undefined.
     */
    retrieveInstance: function(instanceId) {
        return this.registry[instanceId];
    },
    /**
     * Registers a CodeMirrorInstance.
     * @param {string} instanceId - The unique identifier for the instance.
     * @param {CodeMirrorInstance} instanceObject - The instance to register.
     */
    registerInstance: function(instanceId, instanceObject) {
        this.registry[instanceId] = instanceObject;
    },
    /**
     * Removes a CodeMirrorInstance from the registry.
     * @param {string} instanceId - The unique identifier of the instance to remove.
     */
    removeInstance: function(instanceId) {
        delete this.registry[instanceId];
    }
};

/**
 * Represents a single CodeMirror-like instance for live code editing and execution.
 * @param {jQuery|string} sourceContainerEl - The DOM element or selector for the input code container.
 * @param {jQuery|string} resultContainerEl - The DOM element or selector for the output display container.
 * @param {object} [configSettings={}] - Configuration options for the instance.
 */
const CodeMirrorInstance = function(sourceContainerEl, resultContainerEl, configSettings = {}) {

    // Ensure jQuery objects
    const $sourceContainer = $(sourceContainerEl);
    const $resultContainer = $(resultContainerEl);

    // Default configuration
    const defaultConfig = {
        uniqueId: `instance_${Math.floor(Math.random() * 100000000000)}`,
        enableDebugging: false,
        debounceDelay: 250 // Milliseconds for debouncing keyup/focus events
    };

    // Merge provided settings with defaults
    const currentConfig = { ...defaultConfig, ...configSettings };

    let uniqueId = currentConfig.uniqueId;
    let isDebuggingActive = currentConfig.enableDebugging;
    let lastContentLength = -1;
    let initialSourceCode = "";
    let executionLinePointer = 0; // Tracks the current line during execution

    // Check for existing instance to return it
    const existingInstanceId = $sourceContainer.data("mirrorId");
    if (existingInstanceId && CodeMirrorInstances.retrieveInstance(existingInstanceId)) {
        return CodeMirrorInstances.retrieveInstance(existingInstanceId);
    } else {
        $sourceContainer.data("mirrorId", uniqueId);
    }

    // Create the internal textarea for code input
    const $sourceCodeEditor = $("<textarea>", {
        css: {
            outline: "none",
            zIndex: 10,
            position: "relative",
            width: "100%",
            height: "95%",
            background: "rgba(255,255,255,0)",
            border: "none",
            textDecoration: "none",
            overflowY: "hidden",
            overflowX: "auto"
        },
        wrap: "off" // Prevents auto-wrapping, crucial for line-based logic
    });

    // Save original content and inject the textarea
    initialSourceCode = $sourceContainer.html();
    $sourceCodeEditor.html(initialSourceCode);
    $sourceContainer.empty().append($sourceCodeEditor);

    // Event listener for running code (Ctrl+R or F9)
    $sourceContainer.on("keydown", (event) => {
        lastContentLength = $sourceCodeEditor.val().length;
        // Using event.key for modern browsers, fallback to event.which
        if ((event.key === "r" && event.ctrlKey) || event.which === 120) { // F9 key
            event.preventDefault();
            event.stopPropagation();
            apiInterface.executeCode();
        }
    });

    let resizeDebounceTimer;
    /**
     * Adjusts the height of the textarea to fit its scrollable content.
     */
    const adjustEditorHeight = () => {
        const currentContentLength = $sourceCodeEditor.val().length;
        // Only run if content has actually changed to optimize performance
        if (lastContentLength !== currentContentLength) {
            const initialHeight = $sourceCodeEditor.height();
            // Reset height to auto to correctly measure scrollHeight
            $sourceCodeEditor.css("height", "auto");
            const newScrollHeight = $sourceCodeEditor[0].scrollHeight;
            $sourceCodeEditor.css("height", `${newScrollHeight}px`);

            // If textarea was expanded, scroll to bottom of parent element
            if ($sourceCodeEditor.height() > initialHeight) {
                $sourceContainer.parent().animate({
                    scrollTop: $sourceCodeEditor.height()
                }, 0);
            }
            lastContentLength = currentContentLength; // Update last content length
        }
    };

    // Debounced event listener for content changes and output clearing
    $sourceContainer.on("keyup focusin focusout", (event) => {
        clearTimeout(resizeDebounceTimer);
        resizeDebounceTimer = setTimeout(() => {
            adjustEditorHeight();
            apiInterface.clearResultDisplay(true); // Clear output with fade
        }, currentConfig.debounceDelay);
    });

    let originalFunctionHooks = {}; // Stores backups of global functions (alert, console.log, onerror)

    // Measure approximate line height for positioning messages
    const $heightMeasurementEl = $sourceContainer.find("textarea");
    const tempEditorContent = $heightMeasurementEl.html();
    $heightMeasurementEl.addClass("editor-no-fixed-height");
    // Temporarily add multiple lines to accurately measure line height
    $heightMeasurementEl.html("L1\nL2\nL3\nL4\nL5\nL6\nL7\nL8\nL9\nL10");
    let lineRenderHeight = $heightMeasurementEl[0].scrollHeight / 10;

    // Handle cases where the element might be hidden and scrollHeight is 0
    if (!lineRenderHeight) {
        // Temporarily make parents visible to measure height
        $heightMeasurementEl.parents().addClass("editor-visible-force");
        lineRenderHeight = $heightMeasurementEl[0].scrollHeight / 10;
        $heightMeasurementEl.parents().removeClass("editor-visible-force");
    }
    // Restore original content and adjust height
    $heightMeasurementEl.html(tempEditorContent);
    $heightMeasurementEl.removeClass("editor-no-fixed-height");
    adjustEditorHeight();

    /**
     * Traverses an Abstract Syntax Tree (AST) node and applies a visitor function.
     * @param {object} astNode - The current AST node to visit.
     * @param {function} [nodeVisitorCallback=false] - A callback function (node, ancestors) to execute for each node.
     * @param {Array<object>} [ancestorNodes=[]] - An array of parent nodes leading to the current node.
     */
    const traverseAST = (astNode, nodeVisitorCallback = false, ancestorNodes = []) => {
        if (nodeVisitorCallback && nodeVisitorCallback(astNode, ancestorNodes) === false) {
            return; // Stop traversal if callback returns false
        }
        for (const propKey in astNode) {
            if (Object.prototype.hasOwnProperty.call(astNode, propKey)) {
                const childNode = astNode[propKey];
                if (typeof childNode === 'object' && childNode !== null) {
                    // Avoid circular references and re-traverse if it's the same node
                    if (childNode !== astNode) {
                        traverseAST(childNode, nodeVisitorCallback, [astNode, ...ancestorNodes]);
                    }
                }
            }
        }
    };

    /**
     * Restores global functions (alert, console.log, onerror) to their original state.
     */
    const revertGlobalFunctions = () => {
        for (const hookIdentifier in originalFunctionHooks) {
            if (Object.prototype.hasOwnProperty.call(originalFunctionHooks, hookIdentifier)) {
                if (hookIdentifier === "alert") {
                    window.alert = originalFunctionHooks[hookIdentifier];
                } else if (hookIdentifier === "console.log" && typeof console !== "undefined") {
                    console.log = originalFunctionHooks[hookIdentifier];
                } else if (hookIdentifier === "onerror") {
                    window.onerror = originalFunctionHooks[hookIdentifier];
                }
            }
        }
        originalFunctionHooks = {}; // Clear backups after restoration
    };

    /**
     * Arranges output messages in the result display area, preventing overlaps.
     */
    const arrangeOutputMessages = () => {
        $resultContainer.find(".output-line-marker").each(function() {
            const $currentMsg = $(this);
            const currentMsgLine = parseInt($currentMsg.attr("data-line"), 10);
            let nextLowestLine = -1;

            // Find the next message on a lower line number
            $currentMsg.siblings(".output-line-marker").each(function() {
                const siblingLine = parseInt($(this).attr("data-line"), 10);
                if (siblingLine > currentMsgLine && (nextLowestLine === -1 || nextLowestLine > siblingLine)) {
                    nextLowestLine = siblingLine;
                }
            });

            if (nextLowestLine !== -1) {
                const availableSpace = nextLowestLine - currentMsgLine;
                $currentMsg.css("height", "auto"); // Measure natural height
                // Restrict height if it exceeds available space
                if ($currentMsg.height() > (availableSpace * lineRenderHeight)) {
                    $currentMsg.css("height", `${availableSpace * lineRenderHeight}px`);
                }
            } else {
                $currentMsg.css("height", "auto"); // Unlimited space if no subsequent messages
            }
        });
    };

    /**
     * Draws a debug marker bar on the current execution line.
     */
    const renderDebugMarker = () => {
        let $inputDebugMarker = $sourceContainer.find(".line-execution-marker").first();
        let $outputDebugMarker = $resultContainer.find(".line-execution-marker").first();
        const markerLine = executionLinePointer;

        if ($inputDebugMarker.length === 0) {
            // Create new markers if none exist
            const markerHtml = `<div class='line-execution-marker' data-line='${markerLine}' style='top: ${lineRenderHeight * (markerLine - 1)}px;'>&nbsp;</div>`;
            $resultContainer.append(markerHtml);
            $sourceContainer.prepend(markerHtml);
        } else {
            // Update existing markers
            $inputDebugMarker.add($outputDebugMarker).attr("data-line", markerLine);
            $inputDebugMarker.add($outputDebugMarker).css("top", `${lineRenderHeight * (markerLine - 1)}px`);
        }
    };

    /**
     * Removes all debug marker bars.
     */
    const clearDebugMarkers = () => {
        $resultContainer.find(".line-execution-marker").remove();
        $sourceContainer.find(".line-execution-marker").remove();
    };

    /**
     * The public interface (facade) for interacting with the CodeMirrorInstance.
     */
    const apiInterface = {
        /**
         * Enables debug mode and executes the code.
         * In this clone, debug mode primarily means verbose logging of execution steps.
         */
        debugCode: function() {
            isDebuggingActive = true;
            this.executeCode();
            isDebuggingActive = false;
            clearDebugMarkers();
        },
        /**
         * Executes the code currently in the editor.
         * Sets up error handling and function redirection before evaluation.
         */
        executeCode: function() {
            executionLinePointer = 1; // Reset line pointer

            const selfRef = this; // Reference to the apiInterface

            // Backup and redirect global functions
            originalFunctionHooks.alert = window.alert;
            window.alert = (logOutput) => {
                selfRef.logOutput(logOutput);
            };
            if (typeof console !== "undefined" && typeof console.log !== "undefined") {
                originalFunctionHooks["console.log"] = console.log;
                console.log = window.alert; // Redirect console.log to our custom log
            }

            // Backup and redirect global error handler
            originalFunctionHooks.onerror = window.onerror;
            window.onerror = (errorMessage, errorUrl, errorLineNumber) => {
                let parsedMessage = errorMessage;
                let errorType = "Runtime error";

                // Attempt to parse line number from message for syntax errors (browser specific)
                const lineMarkerIndex = errorMessage.indexOf("Line");
                if (lineMarkerIndex > -1) {
                    const colonSeparator = errorMessage.indexOf(":", lineMarkerIndex);
                    executionLinePointer = parseInt(errorMessage.slice(lineMarkerIndex + 4, colonSeparator), 10);
                    parsedMessage = errorMessage.slice(colonSeparator + 2);
                    errorType = "Syntax error";
                } else if (errorMessage.startsWith("Uncaught")) {
                    parsedMessage = errorMessage.slice(errorMessage.indexOf(":", 8) + 2);
                }

                selfRef.logOutput(parsedMessage, errorType);
                revertGlobalFunctions(); // Restore functions immediately on error
                arrangeOutputMessages(); // Position any logged error messages
                return true; // Indicate that the error was handled
            };

            this.clearResultDisplay(); // Clear previous output

            let codeToEvaluate = $sourceCodeEditor.val();
            let totalCharsInjected = 0;
            const injectionPoints = [];

            try {
                // Parse the code to find suitable injection points for line tracking
                const parsedAst = esprima.parse(codeToEvaluate, { range: true, loc: true });

                traverseAST(parsedAst, (astNode, ancestorNodes) => {
                    // Inject step tracking for variable declarations, expression statements, and if statements
                    if (["VariableDeclaration", "ExpressionStatement", "IfStatement"].includes(astNode.type)) {
                        // Avoid injecting into specific contexts that would break code (e.g., for loop declarations)
                        const isInsideForLoopDeclaration = ancestorNodes.some(
                            (parent) => parent.type === "ForStatement" && parent.init === astNode
                        );
                        if (!isInsideForLoopDeclaration) {
                            injectionPoints.push({
                                nodeRange: astNode.range,
                                nodeLocation: astNode.loc
                            });
                        }
                    }
                });

                // Insert the line tracking function calls into the code
                for (const pointIndex in injectionPoints) {
                    if (Object.prototype.hasOwnProperty.call(injectionPoints, pointIndex)) {
                        const { nodeRange, nodeLocation } = injectionPoints[pointIndex];
                        const injectionCode = `CodeMirrorInstances.retrieveInstance('${uniqueId}').advanceExecutionStep(${nodeLocation.start.line});`;
                        const codeLength = injectionCode.length;

                        const codePrefix = codeToEvaluate.slice(0, nodeRange[0] + totalCharsInjected);
                        const codeSuffix = codeToEvaluate.slice(nodeRange[0] + totalCharsInjected);
                        codeToEvaluate = codePrefix + injectionCode + codeSuffix;
                        totalCharsInjected += codeLength;
                    }
                }

                // Execute the modified code
                eval(codeToEvaluate);

            } catch (e) {
                // Catch any errors during parsing or eval that window.onerror might miss
                console.error("Code execution failed:", e);
                this.logOutput(e.message, "Execution Error");
            } finally {
                // Ensure functions are restored and messages are arranged after execution
                revertGlobalFunctions();
                arrangeOutputMessages();
            }
        },
        /**
         * Restores the editor's content to its initial state.
         */
        resetEditorContent: function() {
            this.resetAll();
            $sourceCodeEditor.val(initialSourceCode);
            setTimeout(adjustEditorHeight, 10); // Ensure height is adjusted after content change
        },
        /**
         * Sets new code content in the editor.
         * @param {string} newSourceCode - The new code to set.
         */
        setSourceCode: function(newSourceCode) {
            this.resetAll();
            $sourceCodeEditor.val(newSourceCode);
            setTimeout(adjustEditorHeight, 10);
        },
        /**
         * Clears the editor content and the output display.
         */
        resetAll: function() {
            $sourceCodeEditor.val("");
            this.clearResultDisplay();
        },
        /**
         * Clears the output display.
         * @param {boolean} [useFadeEffect=false] - Whether to use a fade-out effect.
         */
        clearResultDisplay: function(useFadeEffect = false) {
            if (useFadeEffect) {
                $sourceContainer.find(".output-line-marker").fadeOut(() => {
                    $sourceContainer.find(".output-line-marker").remove();
                });
                $resultContainer.find("*").fadeOut(() => {
                    $resultContainer.html("");
                });
                if ($resultContainer.find("*").length === 0) { // If no children, clear immediately
                    $resultContainer.html("");
                }
            } else {
                $sourceContainer.find(".output-line-marker").remove();
                $resultContainer.html("");
            }
        },
        /**
         * Logs a message to the output display.
         * @param {*} loggedItem - The item to log.
         * @param {string} [logCategory=typeof loggedItem] - The category of the log message (e.g., "String", "Error").
         */
        logOutput: function(loggedItem, logCategory) {
            let category = logCategory || (typeof loggedItem);
            category = category.charAt(0).toUpperCase() + category.slice(1); // Capitalize first character

            let additionalStyle = "";
            if (category.toLowerCase().includes("error")) {
                additionalStyle = "output-log-error";
            }

            const currentLine = executionLinePointer;
            const createLineDiv = (zIndex) => `
                <div class='output-line-marker' data-line='${currentLine}'
                     style='top: ${lineRenderHeight * (currentLine - 1)}px; z-index: ${zIndex};'
                     onMouseOver='$(this).attr("data-backup-z", $(this).css("z-index")); $(this).attr("data-backup-h", $(this).css("height")); $(this).css({"height":"auto", "z-index":"100"})'
                     onMouseOut='$(this).css({"height":$(this).attr("data-backup-h"), "z-index":$(this).attr("data-backup-z")})'>
            `;

            let formattedOutput = `<div class='output-log-type ${additionalStyle}'>${category}</div> `;
            if (typeof loggedItem === "function") {
                let functionBody = loggedItem.toString();
                // Remove injected step tracking calls for cleaner display
                functionBody = functionBody.replace(/CodeMirrorInstances\.retrieveInstance\('[^']+'\)\.advanceExecutionStep\([0-9]+\);/ig, "");
                formattedOutput += `<pre>${functionBody}</pre>`;
            } else if (typeof loggedItem === "object" && loggedItem !== null) {
                formattedOutput += `<pre>${JSON.stringify(loggedItem, null, 2)}</pre>`; // Use 2-space indentation
            } else {
                formattedOutput += `<span>${String(loggedItem)}</span>`;
            }

            const closeLineDiv = "</div>";
            $resultContainer.append(`${createLineDiv(3)}<div class='output-log-wrapper'>${formattedOutput}</div>${closeLineDiv}`);
            $sourceContainer.prepend(`${createLineDiv(1)}&nbsp;${closeLineDiv}`); // Invisible marker in source
        },
        /**
         * Retrieves the unique identifier of this instance.
         * @returns {string} The instance's unique ID.
         */
        getUniqueId: function() {
            return uniqueId;
        },
        /**
         * Sets a new unique identifier for this instance.
         * @param {string} proposedId - The new unique ID.
         */
        setUniqueId: function(proposedId) {
            if (proposedId && proposedId !== uniqueId) {
                CodeMirrorInstances.removeInstance(uniqueId);
                uniqueId = proposedId;
                $sourceContainer.data("mirrorId", uniqueId);
                CodeMirrorInstances.registerInstance(uniqueId, this);
            }
        },
        /**
         * Advances the execution line pointer. Called by injected code.
         * If debugging is active, it will render a marker.
         * @param {number} stepLineNumber - The current line number of execution.
         */
        advanceExecutionStep: function(stepLineNumber) {
            executionLinePointer = stepLineNumber;
            if (isDebuggingActive) {
                renderDebugMarker();
                // In this Type III clone, the blocking debug modal is removed.
                // Debugging now means merely visualizing the execution line and logging steps.
                // For a true step-by-step pause, a more complex architecture (e.g., generators or server-side execution)
                // would be required, which goes beyond a simple client-side JS clone.
                // console.log(`[DEBUG] Executing line: ${stepLineNumber}`);
            }
        },
        /**
         * Destroys the instance, removing its elements and unregistering it.
         */
        destroy: function() {
            // Remove event listeners
            $sourceContainer.off("keydown keyup focusin focusout");
            // Remove editor and any debug/output markers
            $sourceContainer.empty();
            $resultContainer.empty();
            // Clear data attribute
            $sourceContainer.removeData("mirrorId");
            // Unregister from global manager
            CodeMirrorInstances.removeInstance(uniqueId);
            console.log(`CodeMirrorInstance ${uniqueId} destroyed.`);
        }
    };

    CodeMirrorInstances.registerInstance(uniqueId, apiInterface);
    return apiInterface;
};
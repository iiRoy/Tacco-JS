$(function() {
    // Inject custom styles for the editor and output panels
    $("body").append("<style> .demoAutoHeight { height: auto !important; } .demoVisibility { display: block !important; visibility: visible !important; } </style>");
});

ImprovedDemos = {
    activeDemos : {}, // Stores references to all active demo instances
    fetchInstance : function(uniqueKey) {
        return this.activeDemos[uniqueKey];
    }
};

ImprovedDemo = function(sourcePanel, resultPanel, configuration) {

    var configuration = configuration || {}; // Initialize configuration if not provided

    var demoKey =  configuration.id || "demo_" + Math.floor(Math.random()*100000000000); // Generate a unique ID for this demo
    var debugModeActive = false;
    var debugSleep = false; // Flag to indicate if debugger is paused
    var editorContentLength = -1;
    var initialTextValue = ""; // Stores the original content of the textarea
    
    var linePointer; // Tracks the currently executing line number

    var sourcePanel = $(sourcePanel);
    // Return existing instance if identified by attribute
    if (sourcePanel.attr("demoInstanceAttr") && ImprovedDemos.fetchInstance(sourcePanel.attr("demoInstanceAttr"))) {
        return ImprovedDemos.fetchInstance(sourcePanel.attr("demoInstanceAttr"));
    } else {
        sourcePanel.attr("demoInstanceAttr", demoKey); // Assign the generated key to the source element
    }
    var resultPanel = $(resultPanel);
    // Use wrap='off' for consistent behavior across browsers, especially IE
    var codeEditorArea = $("<textarea style='outline: none; z-index:10; position: relative; width: 100%; height: 95%; background: rgba(255,255,255,0); border: none; text-decoration: none; overflow-y: hidden; overflow-x: auto;' wrap='off'></textarea>");
    // Save original textarea content for potential reset operations
    initialTextValue = sourcePanel.html();
    codeEditorArea.html(initialTextValue);
    sourcePanel.html(codeEditorArea);
    // Monitor for Control+R or F9 key presses to trigger code execution
    sourcePanel.on("keydown", function(keyboardEvent) {
        editorContentLength = sourcePanel.find("textarea").val().length;
        if ((keyboardEvent.which == "82" && keyboardEvent.ctrlKey) || keyboardEvent.which == "120") {
            keyboardEvent.preventDefault();
            keyboardEvent.stopPropagation();
            apiHandler.executeCode();
        }
    });
    
    function adjustEditorHeight() {
        // Only proceed if the editor's content has changed since last check
        if (editorContentLength != sourcePanel.find("textarea").val().length) {
            var originalHeight = sourcePanel.find("textarea").height();
            sourcePanel.find("textarea").css("height", sourcePanel.find("textarea").get(0).scrollHeight + "px"); 
            // If the textarea expanded, scroll parent to show new content
            if (sourcePanel.find("textarea").height() > originalHeight) {
                sourcePanel.parent().animate({
                    scrollTop: sourcePanel.find("textarea").height()
                }, 0);
            }
        }
    }

    // Attach event listeners for keyups, focus, and blur to manage editor height and clear output
    sourcePanel.on("keyup focusin focusout", function(eventData) {
        adjustEditorHeight(); // Recalculate editor height
        apiHandler.flushOutput(true); // Clear output, possibly with a fade effect
    });
    
    var functionOverrides = []; // Stores backups of overridden global functions
    
    var tempEditor = sourcePanel.find("textarea");
    var editorText = tempEditor.html();
    tempEditor.addClass("demoAutoHeight");
    // Temporarily fill the textarea with multiple lines to accurately determine line height
    tempEditor.html("row 1\r\nrow 2\r\nrow 3\r\nrow 4\r\nrow 5\r\nrow 6\r\nrow 7\r\nrow 8\r\nrow 9\r\nrow 10");
    var linePixelHeight = tempEditor.get(0).scrollHeight / 10; // Calculate average line height
    if (!linePixelHeight) {
        // If element is hidden, temporarily show it and its parents to get correct measurements
        tempEditor.parents().addClass("demoVisibility");
        linePixelHeight = tempEditor.get(0).scrollHeight / 10;
        tempEditor.html(editorText); // Restore original content
        adjustEditorHeight(); // Adjust height based on actual content
        tempEditor.parents().removeClass("demoVisibility"); // Hide elements again
    } else {
        tempEditor.html(editorText); // Restore original content
    }
    tempEditor.removeClass("demoAutoHeight");
    
    // Set the initial height of the textarea to fit its content
    sourcePanel.find("textarea").css("height", sourcePanel.find("textarea").get(0).scrollHeight + "px"); 
    
    function walkTree(treeNode, nodeVisitor, ancestorList) {
        var ancestorList = (typeof ancestorList === 'undefined') ? [] : ancestorList;
    
        nodeVisitor = nodeVisitor || false;
        if (nodeVisitor && nodeVisitor(treeNode, ancestorList) == false) {
            return;
        }
        for (propName in treeNode) {
            if (treeNode.hasOwnProperty(propName)) {
                var nodeChild = treeNode[propName];
                var traversalPath = [ treeNode ];
                traversalPath.push(ancestorList);
                if (typeof nodeChild === 'object' && nodeChild !== null) {
                    walkTree(nodeChild, nodeVisitor, traversalPath);
                }
            }
        }
    };
    
    function revertOverrides() {
        // Restore all previously altered global functions to their original state
        for(overrideKey in functionOverrides) {
            window[overrideKey] = functionOverrides[overrideKey];
            if (overrideKey == "console.log") {
                // Special handling for console.log, if it was directly overridden
                console.log = functionOverrides[overrideKey];
            }
        }
    }
    
    function arrangeOutputMessages() {
        // Iterate through error/log messages to position and size them appropriately, avoiding overlaps
        resultPanel.find(".demoOutputLine").each(function() {
            var messageLineIndex = $(this).attr("ln");
            var subsequentLineNum = -1; // Tracks the line number of the next message
            $(this).siblings(".demoOutputLine").each(function() {
                if ($(this).attr("ln") > messageLineIndex && (subsequentLineNum == -1 || subsequentLineNum > $(this).attr("ln")) ) {
                    subsequentLineNum = $(this).attr("ln");
                }
            });
            if (subsequentLineNum != -1) {
                var availableSpace = subsequentLineNum - $(this).attr("ln");
                // Determine natural height
                $(this).css("height", "auto");
                // Restrict height if it exceeds available space
                if ($(this).height() > (availableSpace * linePixelHeight)) {
                    $(this).css("height", (availableSpace * linePixelHeight) + "px");
                }
            } else {
                $(this).css("height", "auto"); // Unlimited vertical space for the last message
            }
        });
    }
    
    function displayExecutionMarker() {
        var sourceMarker = sourcePanel.find(".demoDebugMarker").first();
        var resultMarker = resultPanel.find(".demoDebugMarker").first();
        var line = linePointer;
        if (sourceMarker.length == 0) {
            // Create new debug markers if they don't exist
            var tagStart = "<div class='demoDebugMarker' ln='" + line + "' style='background: #ffa; position:absolute; left: 0px; top:" + (linePixelHeight*(line-1)) + "px; height: " + linePixelHeight + "px; display: block; width: 100%; z-index: 2; overflow: hidden;'>";
            var tagEnd = "</div>";
            resultPanel.append(tagStart+"&nbsp;"+tagEnd);
            sourcePanel.prepend(tagStart+"&nbsp;"+tagEnd);
        } else {
            // Update existing markers' position
            sourceMarker.add(resultMarker).attr("ln", line);
            sourceMarker.add(resultMarker).css("top", (linePixelHeight*(line-1)) + "px");
        }
    }
    
    function hideDebuggerBar() {
        resultPanel.find(".demoDebugMarker").remove();
        sourcePanel.find(".demoDebugMarker").remove();
    }
    
    var apiHandler = {
        "startDebugging" : function() {
            debugModeActive = true;
            this.executeCode();
            debugModeActive = false;
            hideDebuggerBar();
        },
        "executeCode" : function() {
            // Reset line pointer to the first line before execution
            linePointer = 1;
            // Override alert and console.log to redirect output to the demo's result panel
            var currentInstance = this;
            functionOverrides["alert"] = window.alert;
            window.alert = function(logOutput) { 
                currentInstance.outputLog(logOutput);
            }
            if (typeof(console) != "undefined" && typeof(console.log) != "undefined") {
                functionOverrides["console.log"] = console.log;
                console.log = alert; // Redirect console.log to our custom alert handler
            }
            // Override global error handler to capture runtime errors
            functionOverrides["onerror"] = window.onerror;
            window.onerror = function (errorMessage, scriptPath, exceptionLine) {
                var lineKeywordIndex = errorMessage.indexOf("Line");
                if (lineKeywordIndex > -1) {
                    // Syntax error format detection
                    var delimiterIndex = errorMessage.indexOf(":",lineKeywordIndex);
                    linePointer = errorMessage.slice(lineKeywordIndex+4, delimiterIndex);
                    errorMessage = errorMessage.slice(delimiterIndex+2);
                } else {
                    // Runtime error format detection
                    if (errorMessage.indexOf("Uncaught") === 0) {
                        errorMessage = errorMessage.slice(errorMessage.indexOf(":", 8)+2);
                    }
                    // If line number not explicitly found, use the provided exceptionLine or current linePointer
                    // Alternatively, linePointer = exceptionLine;
                }
                
                if (lineKeywordIndex == -1) {
                    apiHandler.outputLog(errorMessage, "Runtime error");
                    // Restore functions and position messages. Execution stops after runtime error.
                    revertOverrides();
                    arrangeOutputMessages();
                } else {
                    apiHandler.outputLog(errorMessage, "Syntax error");
                }
                return true; // Indicate that the error has been handled
            }
            // Clear any previous output
            this.flushOutput();
            //==
            // Parse, instrument, and execute the user's script
            //==
            var scriptInput = sourcePanel.find("textarea").val();
            // Use Esprima to parse the code and identify relevant statements
            var syntaxTree = esprima.parse(scriptInput,{ range: true, loc: true });
            var insertionPoints = []; // Locations where we'll insert our line-tracking calls
            // Find all VariableDeclarations, ExpressionStatements, and ForStatements
            walkTree(syntaxTree,function(astNode, ancestorList) {
                if (astNode.type === "ForStatement" || astNode.type === "VariableDeclaration" || astNode.type === "ExpressionStatement") {
                    // Avoid inserting pointers in contexts where they could break code
                    // e.g., variable declarations within a for-loop's init/update clause
                    if (astNode.type === "VariableDeclaration" && ancestorList.length && ancestorList[0].type == "ForStatement") {
                        // Skip variable declarations inside for-loop headers
                    } else {
                        insertionPoints.push({nodeRange: astNode.range, sourceLocation: astNode.loc});
                    }
                }
            });
            // Insert line-tracking function calls at identified locations
            var totalCharsAdded = 0;
            for(pointIndex in insertionPoints) {
                var nodeRange = insertionPoints[pointIndex].nodeRange;
                var sourceLocation = insertionPoints[pointIndex].sourceLocation;
                var traceCall = "ImprovedDemos.fetchInstance('" + demoKey + "').stepExecution(" + sourceLocation.start.line + ");";
                var callLength = traceCall.length;
                var codePrefix = scriptInput.slice(0,nodeRange[0]+totalCharsAdded);
                var trailingSegment = scriptInput.slice(nodeRange[0]+totalCharsAdded);
                scriptInput = codePrefix + traceCall + trailingSegment;
                totalCharsAdded += callLength;
            }
            eval(scriptInput); // Execute the instrumented code
            // If execution completes without a runtime error, restore functions and position messages
            revertOverrides();
            arrangeOutputMessages();
        },
        "resetEditorContent" : function() {
            this.eraseContent();
            sourcePanel.find("textarea").val(initialTextValue);
        },
        "setEditorContent" : function(newCode) {
            this.eraseContent();
            sourcePanel.find("textarea").val(newCode);
            setTimeout(function() {
                adjustEditorHeight(); // Ensure editor height is correct after content change
            },1);
        },
        "eraseContent" : function() { 
            sourcePanel.find("textarea").val("");
            this.flushOutput();
        },
        "flushOutput" : function(useFadeEffect) { 
            if (useFadeEffect) {
                sourcePanel.find(".demoOutputLine").fadeOut(function() { sourcePanel.find(".demoOutputLine").remove(); });
                resultPanel.find("*").fadeOut(function() { resultPanel.html(""); });
                if (resultPanel.find("*").size() == 0) {
                    resultPanel.html("");
                }	
            } else {
                sourcePanel.find(".demoOutputLine").remove();
                resultPanel.html("");
            }
        },
        "outputLog" : function(dataPayload, logCategory) {
            var logCategory = logCategory || typeof(dataPayload);
            logCategory = logCategory.charAt(0).toUpperCase() + logCategory.slice(1); // Capitalize first character of category
            var additionalStyle = "";
            if (logCategory.indexOf("error")>-1) { additionalStyle = "background: #CC1919; color: #fff;" } // Apply error styling
            var line = linePointer;
            var wrapperBegin = function(depthValue) {
                return "<div class='demoOutputLine' ln='" + line + "' style='background: #eef; position:absolute; left: 0px; top:" + (linePixelHeight*(line-1)) + "px; height: " + linePixelHeight + "px; display: block; width: 100%; z-index: " + depthValue + "; overflow: hidden;' onMouseOver='$(this).attr(\"originalZindex\",$(this).css(\"z-index\")); $(this).attr(\"originalHeight\",$(this).css(\"height\")); $(this).css(\"height\",\"auto\").css(\"z-index\",\"100\")' onMouseOut='$(this).css(\"height\",$(this).attr(\"originalHeight\")).css(\"z-index\",$(this).attr(\"originalZindex\"))'>";
            }
            var displayContent = "<div style='width: 130px; background: #dde; "+ additionalStyle + " display: inline-block; z-index: 3;'>" + logCategory + "</div> ";
            if (dataPayload instanceof Function) {
                var functionString = dataPayload.toString();
                // Remove any inserted line-tracking calls from the function string
                functionString = functionString.replace(/ImprovedDemos\.fetchInstance\([^\)]+\)\.stepExecution\([0-9]+\)+\;/ig, "");
                displayContent += functionString;
            } else {
                displayContent += JSON.stringify(dataPayload, null, 4); // Pretty-print JSON objects
            }
            var wrapperEnd = "</div>";
            resultPanel.append(wrapperBegin(3) + displayContent + wrapperEnd);
            sourcePanel.prepend(wrapperBegin(1) + "&nbsp;" + wrapperEnd);
        },
        "fetchIdentifier" : function() {
            return demoKey;
        },
        "assignIdentifier" : function(assignedKey) {
            delete ImprovedDemos.activeDemos[demoKey]; // Remove old entry
            demoKey = assignedKey; // Update key
            ImprovedDemos.activeDemos[demoKey] = apiHandler; // Add new entry
        },
        "stepExecution" : function(stepLine) {
            // Update the current line number
            linePointer = stepLine;
            // If debugging is active, pause execution and display debug bar
            if (debugModeActive) {
                displayExecutionMarker();
                // Use a modal dialog to pause execution until user interaction
                var modalOutcome = window.showModalDialog("js/debug.html",null,"dialogleft:0;dialogtop:0;dialogheight:20;dialogwidth:200"); 
                if (modalOutcome == "proceedStep") {
                    // Continue to next step
                } else if (modalOutcome == "quitDebug") {
                    debugModeActive = false; // Exit debug mode
                    hideDebuggerBar();
                } else {
                    debugModeActive = false; // Default to exiting debug mode if unexpected outcome
                    hideDebuggerBar();
                }
            }
        },
        "continueExecution" : function() {
            // This method might be used by a UI element to unpause the debugger
        }
    };
    ImprovedDemos.activeDemos[demoKey] = apiHandler; // Register this instance globally
    return apiHandler; // Return the public interface
}
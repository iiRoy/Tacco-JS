var BehaviorEngine = {
    isVerbose: false, // Flag to enable detailed logging for debugging purposes.
    /**
     * Internal helper function to log messages if verbose mode is enabled.
     * @private
     */
    logIfVerbose: function() {
        // Only output to console if the verbose flag is set and console exists.
        if (this.isVerbose && typeof console !== 'undefined' && console.log) {
            console.log.apply(console, arguments);
        }
    }
};

/**
 * Core Gherkin Definition Processor.
 * @version 1.1.0
 * @requires BehaviorEngine
 */
BehaviorEngine.DefinitionProcessor = {
    /**
     * Processes raw Gherkin content to extract features, scenarios, and steps.
     * @param {string} rawContent The raw Gherkin text content.
     * @returns {BehaviorEngine.Behavior} A structured behavior object.
     */
    processDefinitionContent: function(rawContent) {
        // Guard against empty input content
        if (!rawContent || typeof rawContent !== 'string') {
            BehaviorEngine.logIfVerbose("Warning: Empty or invalid content provided for processing.");
            return new BehaviorEngine.Behavior(); // Return an empty behavior object
        }

        let currentBehavior = new BehaviorEngine.Behavior();
        let parsingBehaviorDescription = true; // Flag to track if we're still collecting the feature description.
        const contentLines = rawContent.split('\n');
        let currentLine, activeUsePattern, activeInstruction;
        
        // Extract the first line as the behavior's main label.
        currentBehavior.label = contentLines.shift()?.trim() || 'Untitled Behavior';

        // Iterate over remaining lines to parse scenarios and steps.
        jQuery.each(contentLines, function(lineIndex, currentLineRaw) {
            currentLine = jQuery.trim(currentLineRaw.toString());

            // Skip empty lines at any point.
            if (currentLine === "") {
                parsingBehaviorDescription = false; // An empty line after the title typically signals end of description.
                return true; // Continue to next line
            }

            if (parsingBehaviorDescription) {
                // Collect description lines until an empty line or a scenario/step is encountered.
                currentBehavior.details += currentLine + "\n";
            } else {
                // Now parsing scenarios and steps.
                const scenarioPrefix = 'Scenario:';
                if (currentLine.indexOf(scenarioPrefix) !== -1) {
                    // Found a new scenario.
                    activeUsePattern = new BehaviorEngine.UsePattern(currentBehavior);
                    activeUsePattern.label = currentLine;
                    currentBehavior.usePatterns.push(activeUsePattern);
                    // Reset description parsing flag once we hit a scenario.
                    parsingBehaviorDescription = false;
                } else if (activeUsePattern) { // Ensure a scenario exists before adding steps.
                    // Found a step within the current scenario.
                    activeInstruction = new BehaviorEngine.ActionPoint(activeUsePattern);
                    activeInstruction.text = currentLine;
                    
                    // Determine if the step is a comment.
                    activeInstruction.isComment = currentLine.startsWith('#');
                    
                    activeUsePattern.instructions.push(activeInstruction);
                } else {
                    // This case handles lines that are not scenarios or steps, but also not part of the description.
                    // It could be a global tag or other Gherkin element not currently supported.
                    // For now, we'll log it as unhandled and skip.
                    BehaviorEngine.logIfVerbose("Warning: Unhandled Gherkin line outside of feature description or scenario:", currentLine);
                }
            }
        });

        // Clean up trailing newline from description if any.
        currentBehavior.details = currentBehavior.details.trim();
        
        return currentBehavior;
    },

    /**
     * Generates a code snippet suggestion for a missing step definition.
     * @param {BehaviorEngine.ActionPoint} instruction The instruction object.
     * @param {boolean} useHtml Whether to format output with HTML tags.
     * @returns {string} The suggested code snippet.
     */
    generateSnippetSuggestion: function(instruction, useHtml) {
        // Strip Gherkin keywords and replace quoted arguments with regex capture groups.
        let codeFragment = instruction.text
            .replace(/^(Given|When|Then|And)\s+/, '')
            .replace(/"([^"]*)"/g, '"([^"]*)"'); // Replaces "some text" with "([^"]*)"

        const argumentPlaceholders = [];
        const quoteMatches = instruction.text.match(/"/g);
        
        // Generate argument names based on the number of quoted strings.
        if (quoteMatches) {
            const numArgs = Math.floor(quoteMatches.length / 2);
            for (let i = 0; i < numArgs; i++) {
                argumentPlaceholders.push(`arg${i + 1}`);
            }
        }
        const argsString = argumentPlaceholders.join(', ');

        // Construct the example snippet.
        let snippetOutput = "Missing step definition:";
        snippetOutput += useHtml ? this.htmlLineBreak : "\n";
        snippetOutput += useHtml ? this.htmlCodeStartTag : "\n";
        snippetOutput += `flowEngine.defineStep(/^${codeFragment}$/, function(${argsString}) {\n  // Implementation code goes here\n});`;
        snippetOutput += useHtml ? this.htmlCodeEndTag : "";
        
        return snippetOutput;
    },

    htmlLineBreak: "<br/>",
    htmlCodeStartTag: "<pre><code>",
    htmlCodeEndTag: "</code></pre>"
};

/**
 * Represents a Gherkin Feature (Behavior).
 */
BehaviorEngine.Behavior = function() {
    this.entityType = "behavior";
    this.label = '';          // Main title of the behavior.
    this.details = '';        // Detailed description of the behavior.
    this.usePatterns = [];    // Collection of scenarios within this behavior.
};

/**
 * Represents a Gherkin Scenario (Use Pattern).
 * @param {BehaviorEngine.Behavior} parentBehavior The parent behavior object.
 */
BehaviorEngine.UsePattern = function(parentBehavior) {
    this.entityType = "usePattern";
    this.label = '';          // Title of the scenario.
    this.parent = parentBehavior; // Reference to the containing behavior.
    this.instructions = [];   // Collection of steps within this scenario.
};

/**
 * Represents a Gherkin Step (Action Point).
 * @param {BehaviorEngine.UsePattern} parentUsePattern The parent scenario object.
 */
BehaviorEngine.ActionPoint = function(parentUsePattern) {
    this.entityType = "actionPoint";
    this.text = "";           // The Gherkin step text (e.g., "Given I am on the homepage").
    this.status = "";         // Execution status: "passed", "failed", "pending", "undefined", "comment".
    this.isComment = false;   // True if this step is a comment line.
    this.parent = parentUsePattern; // Reference to the containing scenario.
    this.error = null;        // Stores error object if status is "failed".
};

/**
 * Represents a summary of test execution outcomes.
 */
BehaviorEngine.OutcomeLog = function() {
    this.usePatternCounts = { // Counts for scenarios by status.
        'undefined': 0,
        'pending': 0,
        'passed': 0,
        'failed': 0
    };
    this.instructionCounts = { // Counts for steps by status.
        'undefined': 0,
        'pending': 0,
        'passed': 0,
        'failed': 0
    };
    this.totalExecutionTimeMs = 0; // Total time taken for execution.
};

/**
 * ResultEmitterInterface defines the contract for all output handlers.
 * This ensures consistency across different reporting mechanisms.
 */
BehaviorEngine.ResultEmitterInterface = {
    /**
     * Initiates the output process for a suite of behaviors.
     * @public
     */
    startReporting: function() {},
    /**
     * Outputs details for a single behavior.
     * @public
     * @param {BehaviorEngine.Behavior} currentBehavior A behavior object.
     */
    emitCapability: function(currentBehavior) {},
    /**
     * Outputs details for a single use pattern (scenario).
     * @public
     * @param {BehaviorEngine.UsePattern} currentUsePattern A use pattern object.
     */
    emitUsePattern: function(currentUsePattern) {},
    /**
     * Outputs details for a single action point (step).
     * @public
     * @param {BehaviorEngine.ActionPoint} currentInstruction The instruction object.
     */
    emitInstruction: function(currentInstruction) {},
    /**
     * Finalizes the output process for the suite, optionally providing an overall report.
     * @public
     * @param {BehaviorEngine.OutcomeLog} [finalReport] The aggregated outcome log.
     */
    stopReporting: function(finalReport) {}
};

/**
 * HTML-based result emitter for displaying test outcomes in a web page.
 * Implements BehaviorEngine.ResultEmitterInterface.
 */
BehaviorEngine.WebPageEmitter = {
    _currentResultsContainer: null, // jQuery object for the main results container.
    resultsDisplaySelector: '#behavior-results-display', // Selector for where results are rendered.

    /**
     * Initializes the emitter, preparing the results container.
     */
    startReporting: function() {
        this._currentResultsContainer = jQuery(this.resultsDisplaySelector);
        // Clear any previous content and apply initial styling if needed.
        this._currentResultsContainer.empty().addClass('behavior-engine-results-view');
        this._prepareForEmission();
        this._finalizeEmission();
    },

    /**
     * Emits the details of a behavior to the HTML output.
     * @param {BehaviorEngine.Behavior} currentBehavior The behavior object.
     */
    emitCapability: function(currentBehavior) {
        this._prepareForEmission();
        const behaviorDiv = jQuery('<div/>', { 'class': 'behavior-group' });
        this._currentResultsContainer.append(behaviorDiv);
        
        behaviorDiv.append(jQuery('<h3/>', { text: currentBehavior.label }));
        
        // Replace newlines in description with <br/> for HTML display.
        const formattedDetails = currentBehavior.details.split('\n').join('<br/>');
        behaviorDiv.append(jQuery('<p/>', { 'class': 'behavior-description', html: formattedDetails }));
        
        this._activeCapabilityDiv = behaviorDiv; // Store reference to the current feature's div.
        this._finalizeEmission();
    },

    /**
     * Emits the details of a use pattern (scenario) to the HTML output.
     * @param {BehaviorEngine.UsePattern} currentUsePattern The use pattern object.
     */
    emitUsePattern: function(currentUsePattern) {
        this._prepareForEmission();
        if (!this._activeCapabilityDiv) {
            BehaviorEngine.logIfVerbose("Error: No active behavior div to append scenario to.");
            return;
        }
        const usePatternDiv = jQuery('<div/>', { 'class': 'use-pattern-block' });
        this._activeCapabilityDiv.append(usePatternDiv);
        
        usePatternDiv.append(jQuery('<h4/>', { text: currentUsePattern.label }));
        
        this._activeUsePatternDiv = usePatternDiv; // Store reference to the current scenario's div.
        this._activeInstructionList = jQuery('<ul/>', { 'class': 'instruction-sequence' });
        usePatternDiv.append(this._activeInstructionList);
        this._finalizeEmission();
    },

    /**
     * Emits the details of an action point (step) to the HTML output.
     * @param {BehaviorEngine.ActionPoint} currentInstruction The instruction object.
     */
    emitInstruction: function(currentInstruction) {
        this._prepareForEmission();
        if (!this._activeInstructionList) {
            BehaviorEngine.logIfVerbose("Error: No active instruction list to append step to.");
            return;
        }
        const instructionStatus = currentInstruction.status || 'unknown'; // Default to 'unknown' if status is not set.
        const statusCssClass = 'instruction-' + instructionStatus;
        let instructionTextContent = currentInstruction.text;

        // Add error message if the step failed.
        if (instructionStatus === "failed" && currentInstruction.error) {
            instructionTextContent += `<br/><em>Error: ${currentInstruction.error.message || currentInstruction.error}</em>`;
        }
        // Add example code for missing steps.
        if (instructionStatus === "missing") {
            instructionTextContent += `<br/>${BehaviorEngine.DefinitionProcessor.generateSnippetSuggestion(currentInstruction, true)}`;
        }

        this._activeInstructionList.append(
            jQuery('<li/>', { 'class': statusCssClass, html: instructionTextContent })
        );
        this._finalizeEmission();
    },

    /**
     * Finalizes the reporting process.
     * @param {BehaviorEngine.OutcomeLog} [summary] The final outcome summary.
     */
    stopReporting: function(summary) {
        this._prepareForEmission();
        // Optional: Display final summary report here.
        if (summary) {
            const summaryDiv = jQuery('<div/>', { 'class': 'final-summary' });
            summaryDiv.append(jQuery('<h5>Execution Summary</h5>'));
            summaryDiv.append(jQuery(`<p>Total Scenarios: ${summary.usePatternCounts.passed + summary.usePatternCounts.failed + summary.usePatternCounts.pending + summary.usePatternCounts.undefined}</p>`));
            summaryDiv.append(jQuery(`<p class="summary-passed">Passed Scenarios: ${summary.usePatternCounts.passed}</p>`));
            summaryDiv.append(jQuery(`<p class="summary-failed">Failed Scenarios: ${summary.usePatternCounts.failed}</p>`));
            summaryDiv.append(jQuery(`<p class="summary-time">Execution Time: ${summary.totalExecutionTimeMs} ms</p>`));
            this._currentResultsContainer.append(summaryDiv);
        }
        this._finalizeEmission();
    },

    // Internal state variables for tracking current output elements.
    _activeCapabilityDiv: null,
    _activeUsePatternDiv: null,
    _activeInstructionList: null,
    _shouldAutoScroll: true, // Determines if the results area should auto-scroll.

    /**
     * Prepares for output by checking scroll state.
     * @private
     */
    _prepareForEmission: function() {
        if (this._currentResultsContainer && this._currentResultsContainer.length) {
            const currentScrollPos = this._currentResultsContainer.scrollTop() + this._currentResultsContainer.innerHeight();
            const maxScrollPos = this._currentResultsContainer[0].scrollHeight;
            // Determine if we are currently scrolled to the bottom (or near it).
            this._shouldAutoScroll = (currentScrollPos >= maxScrollPos - 5); // Allow a small buffer.
        }
    },

    /**
     * Adjusts scroll position after output if auto-scrolling is enabled.
     * @private
     */
    _finalizeEmission: function() {
        if (this._shouldAutoScroll && this._currentResultsContainer && this._currentResultsContainer.length) {
            this._currentResultsContainer.scrollTop(this._currentResultsContainer[0].scrollHeight);
        }
    }
};

/**
 * Provides the execution context for step definitions, offering helper methods for interacting with the page.
 * @author Jamie Hill
 */
BehaviorEngine.ExecutionScope = {
    embeddedBrowserIframe: null, // Reference to the iframe element used as the embedded browser.
    iframeDocumentContents: null, // jQuery object of the iframe's document body.
    isPageTransitioning: false, // Flag to indicate if the iframe is currently loading a new page.

    /**
     * Navigates the embedded browser to a specified URL.
     * @param {string} targetUrl The URL to navigate to.
     * @throws {Error} If the URL is invalid or not provided.
     */
    navigate: function(targetUrl) {
        if (!targetUrl || typeof targetUrl !== 'string') {
            throw new Error('Invalid or missing URL provided for navigation: ' + targetUrl);
        }
        BehaviorEngine.logIfVerbose("Navigating to: ", targetUrl);
        // Trigger a custom event on the iframe to signal a URL change.
        this.embeddedBrowserIframe.trigger('urlChange.flow', { destinationHref: targetUrl });
    },

    /**
     * Clicks a hyperlink containing specific text within the embedded browser.
     * @param {string} linkText The text content of the link to click.
     * @throws {Error} If no link with the specified text is found.
     */
    activateHyperlink: function(linkText) {
        if (!this.iframeDocumentContents) throw new Error("Iframe content not loaded.");
        const targetLink = this.iframeDocumentContents.find('a').filter(function() {
            return jQuery(this).text().trim() === linkText.trim();
        });
        if (targetLink.length === 0) {
            throw new Error(`Could not find a hyperlink with text: "${linkText}"`);
        }
        targetLink.first().click(); // Click the first matching link.
        BehaviorEngine.logIfVerbose("Clicked link:", linkText);
    },

    /**
     * Clicks a button (input type="submit") with a specific value.
     * @param {string} buttonValue The value attribute of the button to click.
     * @throws {Error} If no button with the specified value is found.
     */
    pressButton: function(buttonValue) {
        if (!this.iframeDocumentContents) throw new Error("Iframe content not loaded.");
        const targetButton = this.iframeDocumentContents.find('input[type="submit"], button').filter(function() {
            return jQuery(this).val() === buttonValue || jQuery(this).text().trim() === buttonValue.trim();
        });
        if (targetButton.length === 0) {
            throw new Error(`Could not find a button with value/text: "${buttonValue}"`);
        }
        targetButton.first().click();
        this.isPageTransitioning = true; // Assume page load after button click.
        BehaviorEngine.logIfVerbose("Pressed button:", buttonValue);
    },

    /**
     * Fills an input field associated with a given label.
     * @param {string} fieldLabelText The text of the label associated with the input field.
     * @param {string} inputValue The value to enter into the field.
     * @throws {Error} If the label or associated field cannot be found.
     */
    populateField: function(fieldLabelText, inputValue) {
        if (!this.iframeDocumentContents) throw new Error("Iframe content not loaded.");
        const matchingLabel = this.iframeDocumentContents.find('label').filter(function() {
            return jQuery(this).text().trim() === fieldLabelText.trim();
        }).first();

        if (matchingLabel.length === 0) {
            throw new Error(`Could not find a label with text: "${fieldLabelText}"`);
        }
        const fieldId = matchingLabel.attr('for');
        if (!fieldId) {
            throw new Error(`Label "${fieldLabelText}" does not have a 'for' attribute.`);
        }
        const targetField = this.iframeDocumentContents.find(`#${fieldId}`);
        if (targetField.length === 0) {
            throw new Error(`Could not find an input field with ID: "${fieldId}" for label "${fieldLabelText}"`);
        }
        targetField.val(inputValue);
        BehaviorEngine.logIfVerbose(`Populated field "${fieldLabelText}" with value: "${inputValue}"`);
    },

    /**
     * Verifies that the embedded browser's page contains specific text content.
     * @param {string} expectedContent The text content expected to be present.
     * @throws {Error} If the expected content is not found.
     */
    verifyContentPresence: function(expectedContent) {
        if (!this.iframeDocumentContents) throw new Error("Iframe content not loaded.");
        const pageText = this.iframeDocumentContents.text();
        if (pageText.indexOf(expectedContent) === -1) {
            throw new Error(`Expected to find content: "${expectedContent}", but it was not present on the page.`);
        }
        BehaviorEngine.logIfVerbose(`Verified content presence: "${expectedContent}"`);
    },

    /**
     * Validates that the current path of the embedded browser matches an expected path.
     * @param {string} expectedPath The expected URL path.
     * @throws {Error} If the current path does not match the expected path.
     */
    validateCurrentRoute: function(expectedPath) {
        this.ensureEquality(expectedPath, this.getCurrentRoute(), `Current path does not match expected.`);
        BehaviorEngine.logIfVerbose(`Validated current route: "${expectedPath}"`);
    },

    /**
     * Retrieves the current URL path from the embedded browser.
     * @returns {string} The pathname part of the current URL.
     */
    getCurrentRoute: function() {
        if (!this.embeddedBrowserIframe || !this.embeddedBrowserIframe[0].contentWindow) {
            throw new Error("Iframe content window not accessible.");
        }
        return this.embeddedBrowserIframe[0].contentWindow.location.pathname;
    },

    /**
     * Ensures a value evaluates to true, throwing an error otherwise.
     * @param {*} testValue The value to evaluate.
     * @param {string} [errorMessage] Custom error message.
     * @throws {Error} If `testValue` is falsy.
     */
    ensure: function(testValue, errorMessage) {
        if (!testValue) {
            throw new Error(errorMessage || `Assertion failed: Expected value to be truthy, but got "${testValue}".`);
        }
    },

    /**
     * Ensures two values are strictly equal, throwing an error if they are not.
     * @param {*} expected The expected value.
     * @param {*} actual The actual value.
     * @param {string} [errorMessage] Custom error message.
     * @throws {Error} If `expected` is not strictly equal to `actual`.
     */
    ensureEquality: function(expected, actual, errorMessage) {
        if (expected !== actual) {
            throw new Error(errorMessage || `Assertion failed: Expected "${expected}", but received "${actual}".`);
        }
    },

    /**
     * Locates elements within the iframe's document, throwing an error if none are found.
     * @param {string} selector The jQuery selector string.
     * @returns {jQuery} A jQuery object containing the found elements.
     * @throws {Error} If no elements match the selector.
     */
    locateElement: function(selector) {
        if (!this.iframeDocumentContents) throw new Error("Iframe content not loaded.");
        const foundElements = this.iframeDocumentContents.find(selector);
        this.ensure(foundElements.length > 0, `Could not locate any elements for selector: "${selector}"`);
        return foundElements;
    }
};

/**
 * Orchestrates the loading and execution of Gherkin behavior definitions.
 * @author Pete Otaqui
 * @version 1.1.0
 */
BehaviorEngine.Orchestrator = {
    viewportContainerId: '#test-viewport', // Selector for the DOM element hosting the embedded browser.
    resultEmitter: BehaviorEngine.WebPageEmitter, // The chosen output handler.
    definitionProcessor: BehaviorEngine.DefinitionProcessor, // The Gherkin parser.
    routeMappings: [], // Stores mappings from route names to actual URLs/paths.
    capabilities: [], // List of loaded Behavior objects.
    stepDefinitions: [], // Collection of step definition functions (matchers).
    isPageTransitioning: false, // Tracks if the embedded browser is loading a new page.
    failureRetryWindowMs: 0, // Time (ms) to retry a failing step before giving up.
    
    // Configuration options for execution speed and other behaviors.
    config: {
        executionSpeed: "fast", // "fast", "medium", "slow"
        iframeWidth: 800,
        iframeHeight: 600
    },

    /**
     * Initializes the behavior engine, setting up the outputter and embedded browser.
     * @param {object} customConfig Optional custom configuration to merge.
     */
    initializeEngine: function(customConfig) {
        // Merge custom configuration with defaults.
        this.config = jQuery.extend(this.config, customConfig);
        
        this.resultEmitter.startReporting();
        
        // Setup the embedded browser iframe if it doesn't exist.
        if (!BehaviorEngine.ExecutionScope.embeddedBrowserIframe) {
            const browserIframe = jQuery('<iframe id="embedded-browser" />')
                .appendTo(this.viewportContainerId)
                .css({ 
                    width: this.config.iframeWidth, 
                    height: this.config.iframeHeight,
                    border: '1px solid #ccc' // Added styling
                });
            
            BehaviorEngine.ExecutionScope.embeddedBrowserIframe = browserIframe;

            // Handle iframe load events.
            browserIframe.on('load', () => {
                this.isPageTransitioning = false;
                try {
                    BehaviorEngine.ExecutionScope.iframeDocumentContents = jQuery(browserIframe[0].contentWindow.document).find('body');
                    // Re-bind event handlers inside the iframe's new document content.
                    this._bindIframeContentHandlers();
                } catch (e) {
                    BehaviorEngine.logIfVerbose("Error accessing iframe content after load:", e);
                    // This can happen due to same-origin policy if iframe loads a different domain.
                }
                this.executeSequence(); // Continue execution after page load.
            });

            // Handle custom URL change events for the iframe.
            browserIframe.on('urlChange.flow', (event, data) => {
                this.isPageTransitioning = true;
                browserIframe.attr('src', data.destinationHref);
            });
        }
    },

    /**
     * Binds click and submit handlers to elements within the iframe's document.
     * @private
     */
    _bindIframeContentHandlers: function() {
        const iframeBody = BehaviorEngine.ExecutionScope.iframeDocumentContents;
        if (iframeBody) {
            // Detach previous handlers to prevent duplicates.
            iframeBody.off('click.flow-internal', 'a');
            iframeBody.off('submit.flow-internal', 'form');

            iframeBody.on('click.flow-internal', 'a', function(e) {
                e.preventDefault(); // Prevent default navigation.
                const href = jQuery(this).attr('href');
                if (href) {
                    BehaviorEngine.ExecutionScope.navigate(href);
                }
            });
            iframeBody.on('submit.flow-internal', 'form', () => {
                this.isPageTransitioning = true;
            });
        }
    },

    /**
     * Fetches a Gherkin behavior definition file via Ajax.
     * @param {string} fileUrl The URL to the Gherkin file.
     * @returns {Promise<void>} A promise that resolves when the file is loaded and processed.
     */
    fetchBehaviorDefinition: function(fileUrl) {
        BehaviorEngine.logIfVerbose('Fetching behavior definition:', fileUrl);
        return new Promise((resolve, reject) => {
            jQuery.ajax({
                url: fileUrl,
                success: (data) => {
                    this._processFetchedDefinition(data, fileUrl);
                    resolve();
                },
                error: (xhr, status, error) => {
                    BehaviorEngine.logIfVerbose(`Error fetching ${fileUrl}: ${status} - ${error}`);
                    // Potentially add an error feature/scenario to the queue for reporting.
                    reject(new Error(`Failed to load behavior definition from ${fileUrl}: ${error}`));
                },
                dataType: 'text', // Expect plain text content.
                async: false // Original code uses sync, maintaining for now, but async is generally preferred.
            });
        });
    },

    /**
     * Executes the sequence of behaviors, scenarios, and steps.
     * This method acts as a "breaking queue" to handle asynchronous operations like page loads.
     * @public
     */
    executeSequence: function() {
        const self = this;
        // Clear any previous scheduled timeouts to prevent multiple simultaneous runs.
        clearTimeout(self._executionTimeoutId);

        // Loop through the execution queue.
        while (self._currentQueuePosition < self._executionQueue.length) {
            // If a page is currently loading, pause execution and schedule a retry.
            if (self.isPageTransitioning) {
                self._executionTimeoutId = setTimeout(() => self.executeSequence(), 100);
                return;
            }

            // Implement execution speed delays.
            if (self.config.executionSpeed !== "fast") {
                const currentTime = new Date().getTime();
                // If we're still within the delay interval, pause and schedule a retry.
                if (currentTime < self._nextExecutionTime) {
                    self._executionTimeoutId = setTimeout(() => self.executeSequence(), 100);
                    return;
                }
                // Set the next execution time based on the configured speed.
                self._nextExecutionTime = currentTime + self._delayIntervals[self.config.executionSpeed];
            }
            
            const currentItem = self._executionQueue[self._currentQueuePosition];

            // Initialize start time for the item if not already set, used for retry logic.
            if (currentItem.startTimeMs === undefined) {
                self.failureRetryWindowMs = 0; // Reset retry window for new items.
                currentItem.startTimeMs = new Date().getTime();
            }

            // Execute registered precondition hooks before processing the item.
            self._preconditionHooks.forEach(hook => {
                try {
                    hook.apply(BehaviorEngine.ExecutionScope);
                } catch (hookError) {
                    BehaviorEngine.logIfVerbose("Error in precondition hook:", hookError);
                    // Decide how to handle hook failures: fail the current item, or just log.
                    // For now, just log and continue.
                }
            });

            let stepFoundDefinition = null; // To store the matched step definition.

            // Process the current item based on its type.
            switch (currentItem.entityType) {
                case "behavior":
                    self.resultEmitter.emitCapability(currentItem);
                    break;
                case "usePattern":
                    self.resultEmitter.emitUsePattern(currentItem);
                    break;
                case "actionPoint":
                    const instruction = currentItem;
                    if (instruction.isComment) {
                        instruction.status = "comment";
                    } else if (jQuery.trim(instruction.text).toLowerCase() === "pending") {
                        instruction.status = "pending";
                    } else {
                        // Attempt to match the step against registered definitions.
                        stepFoundDefinition = self.stepDefinitions.find(def => {
                            // Strip Gherkin keywords from the step text for matching.
                            const stepTextForMatch = instruction.text.replace(/^(Given|When|Then|And)\s+/i, '').trim();
                            const matchResult = stepTextForMatch.match(def.regex);
                            if (matchResult) {
                                // Store the matches (excluding the full string match at index 0).
                                def.lastMatches = matchResult.slice(1);
                                return true;
                            }
                            return false;
                        });

                        if (stepFoundDefinition) {
                            try {
                                // Execute the matched step definition in the context of BehaviorEngine.ExecutionScope.
                                const stepResult = stepFoundDefinition.handler.apply(BehaviorEngine.ExecutionScope, stepFoundDefinition.lastMatches);
                                instruction.status = "passed";
                            } catch (executionError) {
                                instruction.status = "failed";
                                instruction.error = executionError;
                                BehaviorEngine.logIfVerbose("Step execution failed:", instruction.text, executionError);
                            }
                        } else {
                            instruction.status = "missing"; // No matching definition found.
                        }
                    }

                    // Handle retry logic for failed steps.
                    if (self.failureRetryWindowMs > 0 && instruction.status === "failed") {
                        const currentTime = new Date().getTime();
                        // If we are still within the retry window, don't advance the queue.
                        if (currentTime < instruction.startTimeMs + self.failureRetryWindowMs) {
                            // Re-schedule this same step for re-evaluation.
                            self._executionTimeoutId = setTimeout(() => self.executeSequence(), 50); // Retry quickly.
                            return; // Don't advance the queue position for this failed step yet.
                        } else {
                            self.failureRetryWindowMs = 0; // Retry window expired.
                        }
                    }

                    // Emit the step output if it's not a retried failure or if retry window is off.
                    if (self.failureRetryWindowMs === 0 || instruction.status !== "failed") {
                        self.resultEmitter.emitInstruction(instruction);
                    }
                    break;
                default:
                    BehaviorEngine.logIfVerbose("Unhandled item type in execution queue:", currentItem.entityType);
            }

            // Advance the queue position only if the step didn't fail and isn't retrying.
            if (self.failureRetryWindowMs === 0 || currentItem.status !== "failed") {
                self._currentQueuePosition++;
                // If all items processed, stop reporting.
                if (self._currentQueuePosition === self._executionQueue.length) {
                    self.resultEmitter.stopReporting(self._generateFinalSummary());
                }
            }
        }
    },

    /**
     * Registers a step definition with a regular expression and an associated handler function.
     * @param {RegExp} regex The regular expression to match step text.
     * @param {Function} handler The function to execute when the step matches.
     * @return {void}
     */
    defineStep: function(regex, handler) {
        if (!(regex instanceof RegExp)) {
            throw new Error("First argument to defineStep must be a RegExp object.");
        }
        if (typeof handler !== 'function') {
            throw new Error("Second argument to defineStep must be a Function.");
        }
        const stepDef = { regex: regex, handler: handler };
        BehaviorEngine.logIfVerbose("Registered step definition:", regex);
        this.stepDefinitions.push(stepDef);
    },

    /**
     * Adds a route mapping, associating a regex pattern with a URL path or a function to generate one.
     * @param {RegExp} namePattern The regular expression to match a route name.
     * @param {string|Function} targetPath The actual URL path or a function that returns it.
     * @returns {void}
     */
    mapRoute: function(namePattern, targetPath) {
        if (!(namePattern instanceof RegExp)) {
            throw new Error("First argument to mapRoute must be a RegExp object.");
        }
        if (typeof targetPath !== 'string' && typeof targetPath !== 'function') {
            throw new Error("Second argument to mapRoute must be a string or a function.");
        }
        this.routeMappings.push({ nameRegex: namePattern, resolvedPath: targetPath });
    },

    /**
     * Resolves a named route to an actual URL path.
     * @param {string} routeName The name of the route to resolve.
     * @returns {string|null} The resolved URL path, or null if not found.
     */
    resolveRoute: function(routeName) {
        let resolvedInfo = null;
        for (const mapping of this.routeMappings) {
            const match = routeName.match(mapping.nameRegex);
            if (match) {
                resolvedInfo = { matches: match.slice(1), pathTarget: mapping.resolvedPath };
                break;
            }
        }

        if (resolvedInfo === null) {
            this.resultEmitter._currentResultsContainer.append(
                jQuery('<p/>', { text: `Could not find a route mapping for: "${routeName}"`, 'class': 'error-message' })
            );
            return null;
        } else {
            try {
                // If pathTarget is a function, execute it with captured regex groups.
                return typeof(resolvedInfo.pathTarget) === 'string' ? 
                       resolvedInfo.pathTarget : 
                       resolvedInfo.pathTarget.apply(BehaviorEngine.ExecutionScope, resolvedInfo.matches);
            } catch(resolutionError) {
                this.resultEmitter._currentResultsContainer.append(
                    jQuery('<p/>', { 
                        html: `Problem resolving route "${routeName}":<br/> - ${resolutionError.message || resolutionError}`, 
                        'class': 'error-message' 
                    })
                );
                return null;
            }
        }
    },

    /**
     * Processes fetched raw Gherkin data and adds the resulting behavior object to the queue.
     * @param {string} rawData The raw Gherkin text.
     * @param {string} sourceFile The source file URL (for logging/debugging).
     * @private
     */
    _processFetchedDefinition: function(rawData, sourceFile) {
        const parsedBehavior = this.definitionProcessor.processDefinitionContent(rawData);
        BehaviorEngine.logIfVerbose(`Processed behavior from ${sourceFile}:`, parsedBehavior.label);
        this.enqueueBehaviorObject(parsedBehavior);
    },

    /**
     * Adds a structured Behavior object (and its nested scenarios/steps) to the execution queue.
     * @param {BehaviorEngine.Behavior} behaviorObject The behavior to enqueue.
     * @private
     */
    enqueueBehaviorObject: function(behaviorObject) {
        this.capabilities.push(behaviorObject); // Keep a reference to all loaded behaviors.
        this._executionQueue.push(behaviorObject); // Add the behavior itself to the queue.
        
        behaviorObject.usePatterns.forEach(scenario => {
            this._executionQueue.push(scenario); // Add each scenario.
            scenario.instructions.forEach(step => {
                this._executionQueue.push(step); // Add each step.
            });
        });
    },

    /**
     * Registers a function to be executed before each behavior, scenario, or step.
     * @param {Function} hookFunction The function to execute as a precondition.
     */
    addPreconditionHook: function(hookFunction) {
        if (typeof hookFunction !== 'function') {
            throw new Error("Precondition hook must be a function.");
        }
        this._preconditionHooks.push(hookFunction);
    },

    /**
     * Generates a final summary report based on the execution queue.
     * @returns {BehaviorEngine.OutcomeLog} The generated outcome log.
     * @private
     */
    _generateFinalSummary: function() {
        const finalLog = new BehaviorEngine.OutcomeLog();
        const startTime = this._executionQueue[0]?.startTimeMs || new Date().getTime();
        const endTime = new Date().getTime();
        finalLog.totalExecutionTimeMs = endTime - startTime;

        this._executionQueue.forEach(item => {
            if (item.entityType === 'usePattern') {
                finalLog.usePatternCounts[item.status || 'undefined']++;
            } else if (item.entityType === 'actionPoint') {
                finalLog.instructionCounts[item.status || 'undefined']++;
            }
        });
        return finalLog;
    },

    _preconditionHooks: [], // Array of functions to run before each item.
    _executionQueue: [], // The main queue of behavior, scenario, and step objects.
    _currentQueuePosition: 0, // Current index in the execution queue.
    _executionTimeoutId: null, // Stores the ID for setTimeout, for pausing/resuming.
    _nextExecutionTime: 0, // Timestamp for when the next item can execute (for speed control).
    
    // Delay intervals for different execution speeds in milliseconds.
    _delayIntervals: {
        "medium":   750, // Slightly longer than original.
        "slow":     2500 // Slightly longer than original.
    }
};

// Global alias for easier access, similar to original `ramble`.
var flowEngine = BehaviorEngine.Orchestrator;
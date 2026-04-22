const systemLogger = {
    enabled: false,
    output: function(...messages) {
        if (this.enabled) {
            console.log("FEATURE FLOW DEBUG:", ...messages);
        }
    }
};

class FeatureCollection {
    constructor(title) {
        this.kind = "featureCollection";
        this.label = title || '';
        this.summary = '';
        this.blocks = [];
    }
}

class ExecutionBlock {
    constructor(parentCollection) {
        this.kind = "executionBlock";
        this.label = '';
        this.parentCollection = parentCollection;
        this.directives = [];
    }
}

class ActionDirective {
    constructor(parentBlock) {
        this.kind = "actionDirective";
        this.statementText = "";
        this.status = "";
        this.isComment = false;
        this.parentBlock = parentBlock;
        this.failureDetails = null;
        this.startTime = undefined;
    }
}

const SyntaxProcessor = (function() {
    const NEWLINE = '\n';
    const SCENARIO_KEYWORD = 'Scenario:';
    const COMMENT_INDICATOR = '#';
    const STEP_PREFIX_PATTERN = /^(Given|When|Then|And)\s+/;
    const QUOTED_STRING_PATTERN = /"([^"]*)"/g;

    function processDefinitionText(sourceData) {
        const collection = new FeatureCollection();
        let currentBlock = null;
        let parsingDescription = true;

        const lines = sourceData.split(NEWLINE).map(line => line.trim());

        if (lines.length > 0) {
            collection.label = lines.shift();
        }

        for (const line of lines) {
            if (parsingDescription) {
                if (line !== "") {
                    collection.summary += line + NEWLINE;
                } else {
                    parsingDescription = false;
                }
            } else {
                if (line === "") {
                    continue;
                } else if (line.startsWith(SCENARIO_KEYWORD)) {
                    currentBlock = new ExecutionBlock(collection);
                    collection.blocks.push(currentBlock);
                    currentBlock.label = line;
                } else if (currentBlock) {
                    const directive = new ActionDirective(currentBlock);
                    directive.statementText = line;
                    directive.isComment = line.startsWith(COMMENT_INDICATOR);
                    currentBlock.directives.push(directive);
                }
            }
        }
        collection.summary = collection.summary.trim();
        return collection;
    }

    function generateExampleSignature(directive, forHtml) {
        const cleanStatement = directive.statementText.replace(STEP_PREFIX_PATTERN, '');
        const patternConstruction = cleanStatement.replace(QUOTED_STRING_PATTERN, '"([^"]*)"');

        const quotedMatches = cleanStatement.match(QUOTED_STRING_PATTERN);
        const argCount = quotedMatches ? quotedMatches.length : 0;
        const generatedArguments = Array.from({ length: argCount }, (_, i) => `param${i + 1}`).join(', ');

        let exampleOutput = "Missing step definition:";
        exampleOutput += forHtml ? "<br/>" : NEWLINE;
        exampleOutput += forHtml ? "<pre><code>" : NEWLINE;
        exampleOutput += `gherkinEngine.registerHandler(/^${patternConstruction}$/, function(${generatedArguments}) {\n  // implement your step logic here\n});`;
        exampleOutput += forHtml ? "</code></pre>" : "";
        return exampleOutput;
    }

    return {
        processDefinitionText,
        generateExampleSignature
    };
})();

class WebOutputHandler {
    constructor(targetElementSelector) {
        this.reportContainer = document.querySelector(targetElementSelector);
        this.currentFeatureContainer = null;
        this.currentBlockContainer = null;
        this.currentDirectiveList = null;
        this.scrollOnUpdate = true;
    }

    startReporting() {
        if (!this.reportContainer) {
            console.error("WebOutputHandler: Report target element not found:", this.targetElementSelector);
            return;
        }
        this.updateScrollState();
    }

    displayCollection(featureCollection) {
        this.updateScrollState();
        const containerDiv = document.createElement('div');
        containerDiv.className = 'feature-flow-collection';
        this.reportContainer.appendChild(containerDiv);

        const titleHeading = document.createElement('h3');
        titleHeading.textContent = featureCollection.label;
        containerDiv.appendChild(titleHeading);

        if (featureCollection.summary) {
            const descriptionParagraph = document.createElement('p');
            descriptionParagraph.className = 'feature-flow-description';
            descriptionParagraph.innerHTML = featureCollection.summary.split('\n').join('<br/>');
            containerDiv.appendChild(descriptionParagraph);
        }
        this.currentFeatureContainer = containerDiv;
        this.applyScroll();
    }

    displayBlock(executionBlock) {
        this.updateScrollState();
        const blockDiv = document.createElement('div');
        blockDiv.className = 'feature-flow-block';
        this.currentFeatureContainer.appendChild(blockDiv);

        const blockHeading = document.createElement('h4');
        blockHeading.textContent = executionBlock.label;
        blockDiv.appendChild(blockHeading);

        this.currentDirectiveList = document.createElement('ul');
        this.currentDirectiveList.className = 'feature-flow-directives';
        blockDiv.appendChild(this.currentDirectiveList);
        this.currentBlockContainer = blockDiv;
        this.applyScroll();
    }

    displayDirective(actionDirective) {
        this.updateScrollState();
        const listItem = document.createElement('li');
        listItem.className = `feature-flow-status-${actionDirective.status}`;
        let itemContent = actionDirective.statementText;

        if (actionDirective.status === "fail" && actionDirective.failureDetails) {
            itemContent += `<br/><em>${actionDirective.failureDetails}</em>`;
        }
        if (actionDirective.status === "missing") {
            itemContent += `<br/>${SyntaxProcessor.generateExampleSignature(actionDirective, true)}`;
        }
        listItem.innerHTML = itemContent;
        this.currentDirectiveList.appendChild(listItem);
        this.applyScroll();
    }

    finishReporting() {
        this.updateScrollState();
        this.applyScroll();
    }

    updateScrollState() {
        if (!this.reportContainer) return;
        const currentScrollPosition = this.reportContainer.scrollTop + this.reportContainer.clientHeight;
        this.scrollOnUpdate = (currentScrollPosition >= this.reportContainer.scrollHeight - 5);
    }

    applyScroll() {
        if (this.scrollOnUpdate && this.reportContainer) {
            this.reportContainer.scrollTop = this.reportContainer.scrollHeight;
        }
    }
}

class ExecutionEnvironment {
    constructor() {
        this.browserFrame = null;
        this.currentDocument = null;
        this.currentPathValue = null;
        this.navigationRequestHandler = null;
        this.pageLoadCompletionHandler = null;
    }

    initializeBrowser(iframeElement, navigationCallback, loadCallback) {
        this.browserFrame = iframeElement;
        this.navigationRequestHandler = navigationCallback;
        this.pageLoadCompletionHandler = loadCallback;

        this.browserFrame.addEventListener('load', () => {
            this.currentDocument = this.browserFrame.contentDocument;
            this.currentPathValue = this.browserFrame.contentWindow.location.pathname;
            this.attachContentEventHandlers();
            this.pageLoadCompletionHandler();
        });
    }

    attachContentEventHandlers() {
        if (!this.currentDocument) return;

        this.currentDocument.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetUrl = link.getAttribute('href');
                if (targetUrl) {
                    this.requestNavigation(targetUrl);
                }
            });
        });

        this.currentDocument.querySelectorAll('form').forEach(form => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                systemLogger.output("Form submission detected, simulating page load.");
                this.requestNavigation(form.action || this.currentPathValue);
            });
        });
    }

    requestNavigation(url) {
        systemLogger.output("Requesting navigation to:", url);
        if (this.navigationRequestHandler) {
            this.navigationRequestHandler(url);
        } else {
            throw new Error("Navigation request handler not configured.");
        }
    }

    pressButton(buttonText) {
        if (!this.currentDocument) throw new Error("Browser content not ready.");
        const buttonElement = Array.from(this.currentDocument.querySelectorAll('input[type="submit"], button'))
            .find(btn => (btn.value && btn.value.trim() === buttonText) || (btn.textContent && btn.textContent.trim() === buttonText));
        if (!buttonElement) throw new Error(`Could not find button with text: "${buttonText}"`);
        buttonElement.click();
    }

    fillInputField(labelText, value) {
        if (!this.currentDocument) throw new Error("Browser content not ready.");
        const labelElement = Array.from(this.currentDocument.querySelectorAll('label'))
            .find(lbl => lbl.textContent.trim() === labelText);
        if (!labelElement) throw new Error(`Could not find label: "${labelText}"`);

        const inputId = labelElement.getAttribute('for');
        let inputTarget;
        if (inputId) {
            inputTarget = this.currentDocument.getElementById(inputId);
        } else {
            inputTarget = labelElement.querySelector('input, textarea, select') || labelElement.nextElementSibling;
        }

        if (!inputTarget || !(inputTarget instanceof HTMLInputElement || inputTarget instanceof HTMLTextAreaElement || inputTarget instanceof HTMLSelectElement)) {
            throw new Error(`No associated input field found for label: "${labelText}"`);
        }
        inputTarget.value = value;
    }

    verifyContentPresence(expectedContent) {
        if (!this.currentDocument) throw new Error("Browser content not ready.");
        if (!this.currentDocument.body.textContent.includes(expectedContent)) {
            throw new Error(`Expected content: "${expectedContent}" not found on page.`);
        }
    }

    assertCurrentPath(expectedPath) {
        this.performEqualityCheck(expectedPath, this.retrieveCurrentPath());
    }

    retrieveCurrentPath() {
        if (!this.browserFrame || !this.browserFrame.contentWindow) return null;
        return this.browserFrame.contentWindow.location.pathname;
    }

    assertCondition(condition, message) {
        if (!condition) throw new Error(message || 'Condition check failed.');
    }

    performEqualityCheck(expected, actual) {
        if (expected !== actual) throw new Error(`Expected: "${expected}", Actual: "${actual}"`);
    }

    locateElement(selector) {
        if (!this.currentDocument) throw new Error("Browser content not ready.");
        const result = this.currentDocument.querySelector(selector);
        this.assertCondition(result, `Element not found for selector: "${selector}"`);
        return result;
    }
}

class TestOrchestrator {
    constructor() {
        this.hostContainerSelector = '#workspace';
        this.reporter = new WebOutputHandler('#results');
        this.instructionSequence = [];
        this.stepHandlerRegistry = [];
        this.pageIsTransitioning = false;
        this.failRetryInterval = 0;
        this.configuration = {
            executionSpeed: "fast"
        };
        this.preExecutionHooks = [];
        this.currentSequencePointer = 0;
        this.executionEnvironment = new ExecutionEnvironment();
        this.browserFrameElement = null;
        this.nextScheduledExecutionTime = 0;
        this.delaySettings = {
            "medium": 600,
            "slow": 2000
        };
    }

    configure(settings) {
        Object.assign(this.configuration, settings);
        systemLogger.enabled = settings.enableLogging || systemLogger.enabled;
    }

    async initiateTesting() {
        this.reporter.startReporting();
        if (!this.browserFrameElement) {
            this.browserFrameElement = document.createElement('iframe');
            this.browserFrameElement.id = 'browser-simulation-frame';
            this.browserFrameElement.style.width = '500px';
            this.browserFrameElement.style.height = '300px';
            document.querySelector(this.hostContainerSelector).appendChild(this.browserFrameElement);

            this.executionEnvironment.initializeBrowser(
                this.browserFrameElement,
                (url) => this.initiatePageNavigation(url),
                () => this.handlePageLoadCompletion()
            );
        }
        await this.executeNextInstruction();
    }

    initiatePageNavigation(url) {
        this.pageIsTransitioning = true;
        this.browserFrameElement.src = url;
    }

    handlePageLoadCompletion() {
        this.pageIsTransitioning = false;
        systemLogger.output("Browser frame loaded, resuming test execution.");
        this.executeNextInstruction();
    }

    async executeNextInstruction() {
        if (this.currentSequencePointer >= this.instructionSequence.length) {
            this.reporter.finishReporting();
            return;
        }

        if (this.pageIsTransitioning) {
            await new Promise(resolve => setTimeout(resolve, 50));
            return this.executeNextInstruction();
        }

        if (this.configuration.executionSpeed !== "fast") {
            const currentTime = Date.now();
            const delayAmount = this.delaySettings[this.configuration.executionSpeed] || 0;
            if (currentTime < this.nextScheduledExecutionTime) {
                await new Promise(resolve => setTimeout(resolve, this.nextScheduledExecutionTime - currentTime));
            }
            this.nextScheduledExecutionTime = currentTime + delayAmount;
        }

        const currentInstruction = this.instructionSequence[this.currentSequencePointer];

        if (currentInstruction.startTime === undefined) {
            this.failRetryInterval = 0;
            currentInstruction.startTime = Date.now();
        }

        this.preExecutionHooks.forEach(hook => hook.call(this.executionEnvironment));

        switch (currentInstruction.kind) {
            case "featureCollection":
                this.reporter.displayCollection(currentInstruction);
                this.currentSequencePointer++;
                break;
            case "executionBlock":
                this.reporter.displayBlock(currentInstruction);
                this.currentSequencePointer++;
                break;
            case "actionDirective":
                let directiveOutcome;
                let failureReason = null;

                if (currentInstruction.isComment) {
                    directiveOutcome = "comment";
                } else if (currentInstruction.statementText.trim() === "pending") {
                    directiveOutcome = "pending";
                } else {
                    const cleanStatement = currentInstruction.statementText.replace(STEP_PREFIX_PATTERN, '');
                    let matchingHandler = null;
                    let extractedArguments = [];

                    for (const handler of this.stepHandlerRegistry) {
                        const match = cleanStatement.match(handler.pattern);
                        if (match) {
                            matchingHandler = handler;
                            extractedArguments = match.slice(1);
                            break;
                        }
                    }

                    if (matchingHandler) {
                        try {
                            matchingHandler.action.apply(this.executionEnvironment, extractedArguments);
                            directiveOutcome = "pass";
                        } catch (err) {
                            directiveOutcome = "fail";
                            failureReason = err.message || err;
                        }
                    } else {
                        directiveOutcome = "missing";
                    }
                }

                currentInstruction.status = directiveOutcome;
                currentInstruction.failureDetails = failureReason;

                if (this.failRetryInterval > 0) {
                    const currentTime = Date.now();
                    if (currentTime > currentInstruction.startTime + this.failRetryInterval) {
                        this.failRetryInterval = 0;
                    }
                }

                if (this.failRetryInterval === 0 || currentInstruction.status !== "fail") {
                    this.reporter.displayDirective(currentInstruction);
                    this.currentSequencePointer++;
                }
                break;
        }

        setTimeout(() => this.executeNextInstruction(), 0);
    }

    registerHandler(pattern, actionFunction) {
        systemLogger.output("Registering step handler:", pattern);
        this.stepHandlerRegistry.push({ pattern, action: actionFunction });
    }

    loadDefinitionFile(fileUrl) {
        systemLogger.output("Loading Gherkin definition file:", fileUrl);
        fetch(fileUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Network response error! Status: ${response.status}`);
                }
                return response.text();
            })
            .then(data => {
                const featureCollection = SyntaxProcessor.processDefinitionText(data);
                this.addFeatureToSequence(featureCollection);
            })
            .catch(error => {
                console.error("Failed to load feature definition file:", fileUrl, error);
            });
    }

    addFeatureToSequence(featureObject) {
        this.instructionSequence.push(featureObject);
        featureObject.blocks.forEach(block => {
            this.instructionSequence.push(block);
            block.directives.forEach(directive => {
                this.instructionSequence.push(directive);
            });
        });
    }

    addPreExecutionHook(hookFunction) {
        this.preExecutionHooks.push(hookFunction);
    }
}

const gherkinEngine = new TestOrchestrator();
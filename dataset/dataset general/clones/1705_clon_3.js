let learningModuleInstance;

const createHTMLElement = (tag, className = '', textContent = '', innerHTML = '') => {
    const element = $(`<${tag}>`);
    if (className) element.addClass(className);
    if (textContent) element.text(textContent);
    if (innerHTML) element.html(innerHTML);
    return element;
};

function LearningPath(segmentData) {
    if (!segmentData || typeof segmentData !== 'object') {
        console.error("LearningPath constructor: Invalid segmentData provided.");
        throw new Error("Invalid initialization data.");
    }

    this.currentModuleId = segmentData.module_id;
    this.pathSegments = segmentData.segments;
    this.currentSegmentIndex = 0; // Use 0-based indexing internally
    this.displayContainer = null; // Will be set externally by the module loader
    console.log(`LearningPath initialized for module ${this.currentModuleId} with ${this.pathSegments.length} segments.`);
}

LearningPath.prototypeAlias = LearningPath.prototype;

LearningPath.prototypeAlias.advanceStep = function () {
    console.log(`Attempting to advance from segment ${this.currentSegmentIndex + 1}.`);
    if (this.currentSegmentIndex < this.pathSegments.length - 1) {
        this.currentSegmentIndex++;
        this.renderSegment(this.currentSegmentIndex);
        console.log(`Advanced to segment ${this.currentSegmentIndex + 1}.`);
    } else {
        console.log("No more segments in current module. Proceeding to next module.");
        this.proceedToNextModule();
    }
};

LearningPath.prototypeAlias.retreatStep = function () {
    if (this.currentSegmentIndex > 0) {
        this.currentSegmentIndex--;
        this.renderSegment(this.currentSegmentIndex);
        console.log(`Retreated to segment ${this.currentSegmentIndex + 1}.`);
    } else {
        console.log("Already at the first segment. Cannot retreat further.");
    }
};

LearningPath.prototypeAlias.renderSegment = function (segmentIdx) {
    if (segmentIdx < 0 || segmentIdx >= this.pathSegments.length) {
        console.error(`Attempted to render invalid segment index: ${segmentIdx}`);
        return;
    }

    const activeSegment = this.pathSegments[segmentIdx];
    if (!activeSegment) {
        console.warn(`Segment data missing for index ${segmentIdx}`);
        return;
    }

    // Clear previous content
    if (this.displayContainer) {
        this.displayContainer.empty();
    } else {
        console.warn("Display container not set for LearningPath instance.");
        return;
    }

    const explanationParagraph = createHTMLElement('p', 'segment-explanation', '',
        `(${segmentIdx + 1} of ${this.pathSegments.length}) ${activeSegment.description || 'No description provided.'}`
    );

    const exampleContainer = createHTMLElement('p', 'code-example');
    exampleContainer.text('Example: ');
    const codeSample = createHTMLElement('samp', '', '', `${activeSegment.example || 'No example provided.'}&nbsp;&nbsp;&crarr;`);
    exampleContainer.append(codeSample);

    this.displayContainer
        .append(explanationParagraph)
        .append(exampleContainer);

    console.log(`Segment ${segmentIdx + 1} rendered.`);
};

LearningPath.prototypeAlias.processUserInput = function (userInputString) {
    if (typeof userInputString !== 'string' || !userInputString.trim()) {
        console.warn("processUserInput: Empty or invalid input received.");
        return;
    }

    const currentSegment = this.pathSegments[this.currentSegmentIndex];
    if (!currentSegment || !currentSegment.pattern) {
        console.error(`No pattern defined for segment ${this.currentSegmentIndex + 1}.`);
        return;
    }

    let segmentPattern = currentSegment.pattern;
    if (Array.isArray(segmentPattern)) {
        segmentPattern = segmentPattern.join('\\s*');
        console.debug(`Joined array pattern: ${segmentPattern}`);
    }

    try {
        const regexEvaluator = new RegExp(segmentPattern);
        if (regexEvaluator.test(userInputString)) {
            console.log(`User input matched pattern for segment ${this.currentSegmentIndex + 1}.`);
            this.advanceStep();
        } else {
            console.log(`User input did NOT match pattern for segment ${this.currentSegmentIndex + 1}.`);
        }
    } catch (e) {
        console.error(`Error creating or testing regex for segment ${this.currentSegmentIndex + 1}: ${e.message}`);
    }
};

LearningPath.prototypeAlias.proceedToNextModule = function () {
    const nextModuleIdentifier = parseInt(this.currentModuleId) + 1;
    console.log(`Requesting load for module ${nextModuleIdentifier}.`);
    fetchAndInitializeModule(nextModuleIdentifier);
};

function fetchAndInitializeModule(moduleId) {
    if (isNaN(moduleId) || moduleId <= 0) {
        console.error(`Invalid module ID: ${moduleId}`);
        return;
    }

    const moduleDataUrl = `js/learning_modules/${moduleId}.json`; // Changed path and extension
    console.log(`Fetching module data from: ${moduleDataUrl}`);

    $.getJSON(moduleDataUrl)
        .done(function (data) {
            if (!data || !data.segments || !Array.isArray(data.segments)) {
                console.error(`Module data for ID ${moduleId} is malformed.`);
                // Potentially load a default error module or index
                return;
            }
            data.module_id = moduleId; // Ensure module ID is passed correctly

            learningModuleInstance = new LearningPath(data);

            // Initialize the display container for the new module
            learningModuleInstance.displayContainer = createHTMLElement('div', 'module-content-display');
            learningModuleInstance.renderSegment(0); // Render the first segment

            $('#feedback-area').fadeOut('slow', function () { // Renamed ID
                $(this)
                    .empty() // Clear all content
                    .append(createHTMLElement('h1', '', `Module ${moduleId}: ${data.title || 'Untitled Module'}`))
                    .append(learningModuleInstance.displayContainer)
                    .fadeIn('slow');
                console.log(`Module ${moduleId} loaded and displayed.`);
            });
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
            console.error(`Failed to load module ${moduleId}: ${textStatus}, ${errorThrown}`);
            // Display an error message to the user
            $('#feedback-area').fadeOut('slow', function () {
                $(this)
                    .empty()
                    .append(createHTMLElement('h1', 'error-message', 'Error Loading Module'))
                    .append(createHTMLElement('p', '', `Could not load module ${moduleId}. Please try again later.`))
                    .fadeIn('slow');
            });
        });
}

function displayModuleIndex() {
    $("#feedback-area").fadeOut('slow', function () {
        const indexPath = 'js/learning_modules/index.json'; // Changed path and extension
        console.log(`Fetching module index from: ${indexPath}`);

        $.getJSON(indexPath)
            .done(function (indexData) {
                if (!indexData || !indexData.modules || !Array.isArray(indexData.modules)) {
                    console.error("Module index data is malformed.");
                    $(this).empty().append(createHTMLElement('p', 'error-message', 'Failed to load index.')).fadeIn('slow');
                    return;
                }

                const indexListElement = createHTMLElement('ul', 'module-index-list');

                indexData.modules.forEach(moduleInfo => {
                    const listItemElement = createHTMLElement('li');
                    listItemElement.append(createHTMLElement('span', 'module-title-text', moduleInfo.title || 'Untitled Module'));

                    if (moduleInfo.summary && Array.isArray(moduleInfo.summary)) {
                        const detailListElement = createHTMLElement('ul', 'module-summary-details');
                        moduleInfo.summary.forEach(detailText => {
                            detailListElement.append(createHTMLElement('li', '', detailText));
                        });
                        listItemElement.append(detailListElement);
                    }
                    indexListElement.append(listItemElement);
                });

                $("#feedback-area")
                    .empty()
                    .append(createHTMLElement('h1', '', indexData.title || 'Learning Path Index'))
                    .append(createHTMLElement('p', 'help-message', 'Type "help" to view available commands or navigate.'))
                    .append(indexListElement);

                $("#feedback-area").fadeIn("slow");
                console.log("Module index displayed.");
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
                console.error(`Failed to load module index: ${textStatus}, ${errorThrown}`);
                $(this).empty().append(createHTMLElement('p', 'error-message', 'Could not load the module index.')).fadeIn('slow');
            });
    });
}
const PresentationEngine = {
    createElement: function(component, properties) {
        return {
            componentType: component,
            props: properties
        };
    },
    renderToStaticMarkup: function(elementStructure) {
        const dataItem = elementStructure.props.dataItem;
        const countValue = dataItem.replyCount;
        let termVariant = (countValue === 1) ? 'response' : 'responses';
        return `<article><small>Details from ${dataItem.contributor} from ${dataItem.elapsedTime} regarding ${countValue} ${termVariant}.</small></article>`;
    }
};

const AuxiliaryDisplay = function(properties) {
    return { type: 'AuxiliaryDisplay', props: properties };
};

function conductExperiment(labelIdentifier, experimentalFunction) {
    try {
        experimentalFunction();
        console.log(`✓ ${labelIdentifier}`);
    } catch (failureOutcome) {
        console.error(`✗ ${labelIdentifier}`);
        console.error(failureOutcome.message);
    }
}

function validate(conditionMet, messageString) {
    if (!conditionMet) {
        throw new Error(messageString || "Validation criterion not satisfied");
    }
}

conductExperiment('confirm plural form for multiple replies', function () {
    const dataObject = {
        scoreValue:         12,
        contributor:        'John Doe',
        elapsedTime:        'yesterday',
        replyCount:         8
    };

    const renderedContent = PresentationEngine.renderToStaticMarkup(
        PresentationEngine.createElement(AuxiliaryDisplay, { dataItem: dataObject })
    );

    const segmentPattern = /<small[^>]*>(.*?)<\/small>/;
    const patternMatchResult = renderedContent.match(segmentPattern);

    validate(patternMatchResult && patternMatchResult[1], "Unable to extract content from the small tag.");

    const extractedContent = patternMatchResult[1];
    const requiredTerm = 'responses';

    const termIsPresent = extractedContent.includes(requiredTerm);

    validate(termIsPresent, `Expected content to include '${requiredTerm}', but found '${extractedContent}'`);
});
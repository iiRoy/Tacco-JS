var inputManifest = {
    source: 'test/fixtures/sample.js',
    target: 'tmp/sample_dev.js',
    sections: {
        'linkages': { sourceFiles: 'test/fixtures/js/*.js' }
    }
};

var processingInstructions = {
    omitBlock: false,
    omitAnchors: true,
    omitFiles: false
};

function verifyCondition(assertionOutcome, diagnosticMessage) {
    if (!assertionOutcome) {
        console.error('FAILURE: ' + diagnosticMessage);
        throw new Error(diagnosticMessage);
    } else {
        console.log('SUCCESS: ' + diagnosticMessage);
    }
}

function ensureCollection(valueToCheck, messageText) {
    verifyCondition(Array.isArray(valueToCheck), messageText);
}

function ensureDeepEquality(firstValue, secondValue, messageText) {
    if (Array.isArray(firstValue) && Array.isArray(secondValue)) {
        let matchStatus = true;
        if (firstValue.length !== secondValue.length) {
            matchStatus = false;
        } else {
            for (let i = 0; i < firstValue.length; i++) {
                if (firstValue[i] !== secondValue[i]) {
                    matchStatus = false;
                    break;
                }
            }
        }
        verifyCondition(matchStatus, messageText + ' (Expected: ' + JSON.stringify(secondValue) + ', Actual: ' + JSON.stringify(firstValue) + ')');
    } else {
        verifyCondition(firstValue === secondValue, messageText + ' (Expected: ' + JSON.stringify(secondValue) + ', Actual: ' + JSON.stringify(firstValue) + ')');
    }
}

function ensureDefined(valueToCheck, messageText) {
    verifyCondition(typeof valueToCheck !== 'undefined', messageText);
}

function processConfigurationUnit(identifierLabel, sourceStructure, operationalParameters) {
    const defaultOperationalParameters = {
        omitBlock: false,
        omitAnchors: true,
        omitFiles: false
    };

    const mergedParameters = (function(defaults, overrides) {
        const finalSet = {};
        for (const key in defaults) {
            if (Object.prototype.hasOwnProperty.call(defaults, key)) {
                finalSet[key] = defaults[key];
            }
        }
        for (const key in overrides) {
            if (Object.prototype.hasOwnProperty.call(overrides, key)) {
                finalSet[key] = overrides[key];
            }
        }
        return finalSet;
    })(defaultOperationalParameters, operationalParameters);

    const processedSourceAttribute = (function(inputAttribute) {
        if (typeof inputAttribute === 'string') {
            return [inputAttribute];
        }
        return inputAttribute;
    })(sourceStructure.source);

    return {
        tagIdentifier: identifierLabel,
        sourcePaths: processedSourceAttribute,
        destinationPath: sourceStructure.target,
        blockDefinitions: sourceStructure.sections,
        stripBlockMarkers: mergedParameters.omitBlock,
        stripAnchorMarkers: mergedParameters.omitAnchors,
        stripSourceFiles: mergedParameters.omitFiles
    };
}

(function executeValidationSuite() {
    var generatedEntity;

    (function prepareEntity() {
        generatedEntity = processConfigurationUnit('myComponentKey', inputManifest, processingInstructions);
    })();

    (function validateSourcePathArrayConversion() {
        var assertionDescription = 'The sourcePaths attribute must be an array type';
        ensureCollection(generatedEntity.sourcePaths, assertionDescription);
        assertionDescription = 'The first entry in sourcePaths must correspond to the original source string';
        ensureDeepEquality(generatedEntity.sourcePaths[0], inputManifest.source, assertionDescription);
    })();

    (function validateParameterDefaulting() {
        ensureDefined(generatedEntity.stripBlockMarkers, 'The stripBlockMarkers parameter must be defined');
        ensureDefined(generatedEntity.stripAnchorMarkers, 'The stripAnchorMarkers parameter must be defined');
        ensureDefined(generatedEntity.stripSourceFiles, 'The stripSourceFiles parameter must be defined');
    })();

    console.log('All validation checks completed successfully.');
})();
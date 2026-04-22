const systemIO = require('fs');
const directoryUtil = require('path');
const processTransform = require('../index.js');

const testDirectoryPath = 'test/cases';
const testFileExtension = '.css';
const transformationIndicator = '_t';

let validationFailures = [];
let validationCount = 0;

function performAssertion(actualResult, anticipatedResult, validationDescription) {
    validationCount++;
    if (actualResult !== anticipatedResult) {
        validationFailures.push(`FAILURE: ${validationDescription}\n  Expected:\n${anticipatedResult}\n  Actual:\n${actualResult}\n`);
    }
}

function orchestrateValidationRoutine() {
    const allDirectoryItems = systemIO.readdirSync(testDirectoryPath);

    const baseTestFiles = allDirectoryItems.filter(item =>
        item.endsWith(testFileExtension) && !item.includes(transformationIndicator)
    );

    baseTestFiles.forEach(currentFileName => {
        const baseNameWithoutExtension = directoryUtil.basename(currentFileName, testFileExtension);
        const sourceAssetPath = directoryUtil.join(testDirectoryPath, currentFileName);
        const comparisonAssetPath = directoryUtil.join(testDirectoryPath, `${baseNameWithoutExtension}${transformationIndicator}${testFileExtension}`);

        const sourceAssetContent = systemIO.readFileSync(sourceAssetPath, 'utf8');
        const comparisonAssetContent = systemIO.readFileSync(comparisonAssetPath, 'utf8');

        const transformedContent = processTransform.convert(sourceAssetContent);

        performAssertion(transformedContent, comparisonAssetContent, `Verification for ${currentFileName}`);
    });

    summarizeValidationResults();
}

function summarizeValidationResults() {
    if (validationFailures.length > 0) {
        console.error(`\n--- Validation Suite FAILED ---`);
        validationFailures.forEach(failureMessage => console.error(failureMessage));
        console.error(`${validationFailures.length} out of ${validationCount} validations FAILED.`);
        process.exit(1);
    } else {
        console.log(`\n--- Validation Suite PASSED ---`);
        console.log(`All ${validationCount} validations completed successfully.`);
        process.exit(0);
    }
}

orchestrateValidationRoutine();
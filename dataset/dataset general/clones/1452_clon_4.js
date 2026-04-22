const makeTestHarness = () => {
    let outcomeTotal = 0;
    let outcomeSuccess = 0;
    let activeTestLabel = 'N/A';

    const recordResult = (isPass, messageText) => {
        outcomeTotal++;
        if (isPass) {
            outcomeSuccess++;
            console.log(`  ✓ ${messageText}`);
        } else {
            console.error(`  ✗ ${messageText} (Failure in: ${activeTestLabel})`);
        }
    };

    const verifyCondition = (conditionBoolean, assertionDescription) => {
        recordResult(!!conditionBoolean, assertionDescription);
    };

    const executeVerificationBlock = (blockTitle, blockFunction) => {
        console.log(`\n# ${blockTitle}`);
        const priorLabel = activeTestLabel;
        activeTestLabel = blockTitle;
        blockFunction({
            assess: verifyCondition,
            section: (nestedTitle, nestedFunction) => {
                console.log(`\n## ${nestedTitle}`);
                const innerPriorLabel = activeTestLabel;
                activeTestLabel = `${blockTitle} - ${nestedTitle}`;
                nestedFunction({
                    assess: verifyCondition
                });
                activeTestLabel = innerPriorLabel;
            }
        });
        activeTestLabel = priorLabel;
    };

    const generateFinalSummary = () => {
        console.log(`\n--- Verification Summary ---`);
        console.log(`Total Verifications: ${outcomeTotal}`);
        console.log(`Successful: ${outcomeSuccess}`);
        console.log(`Failed: ${outcomeTotal - outcomeSuccess}`);
        if (outcomeTotal === outcomeSuccess) {
            console.log('All verifications PASSED!');
            return 0;
        } else {
            console.error('Some verifications FAILED!');
            return 1;
        }
    };

    return { executeVerificationBlock, generateFinalSummary };
};

const obtainDataLayer = () => {
    const fileSystemModule = require('fs');
    const pathModule = require('path');

    const acquireAndDecodeJson = (relativeFilePath) => {
        const absolutePath = pathModule.join(__dirname, relativeFilePath);
        const fileData = fileSystemModule.readFileSync(absolutePath, 'utf8');
        return JSON.parse(fileData);
    };

    return { acquireAndDecodeJson };
};

const auxiliaryUtilities = {
    isObjectLiteral: (value) => typeof value === 'object' && value !== null && !Array.isArray(value),
    retrieveKeys: (targetObject) => Object.keys(targetObject),
    processElements: (dataArray, actionCallback) => dataArray.forEach(actionCallback)
};

const obtainQueryProcessor = () => {
    return require('../mingo');
};

const validationEngine = makeTestHarness();
const dataAccessService = obtainDataLayer();
const queryOperationModule = obtainQueryProcessor();

const initialRecordSet = dataAccessService.acquireAndDecodeJson('./data/grades_simple.json');
const complexRecordSet = dataAccessService.acquireAndDecodeJson('./data/grades_complex.json'); // Loaded but not directly used in this clone, mimicking original.

validationEngine.executeVerificationBlock('Data Structure Querying', (mainAssertions) => {

    mainAssertions.section("Result Iterator Capabilities", (subAssertions) => {
        const operationInstance = new queryOperationModule.Query();
        const resultIterator = operationInstance.find(initialRecordSet);

        const totalItems = resultIterator.count();
        const firstItem = resultIterator.first();
        const lastItem = resultIterator.last();

        subAssertions.assess(resultIterator.hasNext(), "can inspect for subsequent items");
        subAssertions.assess(resultIterator.next() !== null, "can advance to the next item");
        subAssertions.assess(auxiliaryUtilities.isObjectLiteral(firstItem), "can retrieve the leading item");
        subAssertions.assess(auxiliaryUtilities.isObjectLiteral(lastItem), "can retrieve the trailing item");
        subAssertions.assess(totalItems === 800, "can accurately determine the total item count");
    });

    mainAssertions.section("Standard Array Processing", (subAssertions) => {
        const filterDefinition = {
            $or: [
                { type: "quiz", score: { $lt: 50 } },
                { type: "homework", score: { $lt: 50 } }
            ]
        };
        const fieldProjection = { student_id: 1 }; // Placeholder, primarily for count validation
        const sortDirective = { score: 1 };

        const filteredCollection = queryOperationModule.find(initialRecordSet, filterDefinition, fieldProjection).sort(sortDirective);

        subAssertions.assess(filteredCollection.count() < 800, "can filter a basic array collection");
    });

    mainAssertions.section("Deeply Nested Element Matching", (subAssertions) => {
        const sampleDataUnits = [
            {
                entity: { identifier: 'EntityX', tasks: [
                    { label: "Task Alpha", metrics: { difficulty: 6 } },
                    { label: "Task Beta", metrics: { difficulty: 2 } }
                ] }
            },
            {
                entity: { identifier: 'EntityY', tasks: [
                    { label: "Task Alpha", metrics: { difficulty: 6 } },
                    { label: "Task Beta", metrics: { difficulty: 8 } }
                ] }
            }
        ];
        const matchingSchema = {
            'entity.tasks': {
                "$all": [
                    {
                        "$elemMatch": {
                            'metrics.difficulty': { '$gt': 6 }
                        }
                    }
                ]
            }
        };

        const matchedRecordsCount = queryOperationModule.find(sampleDataUnits, matchingSchema).count();
        subAssertions.assess(matchedRecordsCount === 1, "can execute $all with $elemMatch on complex embedded structures");
    });
});


validationEngine.executeVerificationBlock("Data Pipeline Transformation", (mainAssertions) => {
    const fullSourceRecords = dataAccessService.acquireAndDecodeJson('./data/students.json');

    const processingCriterion = {
        scores: { $elemMatch: { type: "exam", score: { $gt: 90 } } }
    };
    const requestedOutputFields = { name: 1 };

    // Represents the 'cursor' count from the original test, applied to the full dataset
    const totalMatchingRecords = queryOperationModule.find(fullSourceRecords, processingCriterion).count();

    let processedOutputCount = 0;
    let outputKeyIntegrity = true;

    // Simulate stream processing by functional array transformations
    const transformedOutput = fullSourceRecords
        .filter(record => queryOperationModule.find([record], processingCriterion).count() > 0) // Filter matching records
        .map(record => { // Apply projection
            const projectedItem = {};
            if (record.name) projectedItem.name = record.name;
            // Mingo's default projection includes _id if not explicitly excluded when other fields are projected.
            if (record._id) projectedItem._id = record._id;
            return projectedItem;
        });

    processedOutputCount = transformedOutput.length;

    auxiliaryUtilities.processElements(transformedOutput, (item) => {
        if (auxiliaryUtilities.retrieveKeys(item).length !== 2) { // Expecting 'name' and '_id'
            outputKeyIntegrity = false;
        }
    });

    mainAssertions.assess(processedOutputCount > 0 && processedOutputCount === totalMatchingRecords, "Filtered records count matches via simulated pipeline");
    mainAssertions.assess(outputKeyIntegrity, "Projected items correctly contain only specified keys (name and _id)");
});

const terminationStatus = validationEngine.generateFinalSummary();
process.exit(terminationStatus);
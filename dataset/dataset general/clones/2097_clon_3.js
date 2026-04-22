/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

const AbtTestUtility = require('../ab_utility_analyzer.js'); // Renamed module path and class

/*
 **************************************************************************
 * Unit Tests for Experiment Arm Management and A/B Test Outcome Analysis *
 * This suite verifies the core functionalities of the AbtTestUtility.    *
 **************************************************************************
*/

module.exports['Experiment Arm Operations'] = {

    // Validates that an improperly structured experiment arm cannot be registered.
    'Invalid trial data structure handling': function(verifier) {
        let experimentTool = new AbtTestUtility();
        verifier.notStrictEqual(experimentTool, null, 'Utility object should be instantiated and not null.');

        // Attempting to register an arm without essential properties like 'totalObservations'
        verifier.throws(() => {
            experimentTool.registerExperimentArm({
                designation: 'Alpha',
                description: 'Trial Arm Alpha',
                successEvents: 1356,
            });
        }, Error, 'Arm object must possess "description", "successEvents", and "totalObservations" properties.');
        verifier.done();
    },

    'Properly structured arm registers without issue': function(verifier) {
        let experimentTool = new AbtTestUtility();
        verifier.notStrictEqual(experimentTool, null, 'Analyzer instance must be ready and not null.');

        const armConfig = {
            designation: 'Bravo',
            description: 'Trial Arm Bravo',
            successEvents: 3000,
            totalObservations: 3000
        };

        experimentTool.registerExperimentArm(armConfig);

        // Verify the arm is now part of the internal collection
        verifier.strictEqual(Object.prototype.hasOwnProperty.call(experimentTool._experimentArms, armConfig.designation), true, `Arm with designation '${armConfig.designation}' should be present in the registry.`);

        verifier.done();
    },

    'Arm lacking explicit name automatically assigned a default': function(verifier) {
        let experimentTool = new AbtTestUtility();
        verifier.notEqual(experimentTool, undefined, 'Analyzer should exist and not be undefined.');

        const armDesignation = 'Charlie';
        const initialArmData = {
            designation: armDesignation,
            successEvents: 3000,
            totalObservations: 3000
        };

        experimentTool.registerExperimentArm(initialArmData);

        // Confirm the arm's presence and its default description
        verifier.ok(experimentTool._experimentArms.hasOwnProperty(armDesignation), `Arm '${armDesignation}' must be registered in the internal mapping.`);
        verifier.strictEqual(experimentTool._experimentArms[armDesignation].description, `Arm ${armDesignation}`, 'The description should default to "Arm [designation]" if not provided.');

        verifier.done();
    },

    'Attempt to register arm with existing designation fails as expected': function(verifier) {
        let experimentTool = new AbtTestUtility();
        verifier.ok(experimentTool, 'Setup: Analyzer initialized successfully.');

        const duplicateArmData = {
            designation: 'Delta',
            description: 'Original Delta Arm',
            successEvents: 3000,
            totalObservations: 3000
        };

        experimentTool.registerExperimentArm(duplicateArmData);
        verifier.ok(experimentTool._experimentArms.hasOwnProperty('Delta'), 'Initial Delta arm successfully added to the experiment.');

        // Attempt to add the same arm designation again, expecting an error
        verifier.throws(() => {
            experimentTool.registerExperimentArm({
                designation: 'Delta',
                description: 'Duplicate Delta Arm Attempt',
                successEvents: 3000,
                totalObservations: 3000
            });
        }, Error, 'Registering an arm with an already existing designation should result in an error indicating duplication.');

        verifier.done();
    },
};

/*
 **************************************************************************
 * Test Suite for Checking Experiment Arm Existence                        *
 **************************************************************************
*/

module.exports['Arm Presence Check'] = {

    'Verify existence status of a specific arm': function(verifier) {
        let experimentTool = new AbtTestUtility();
        verifier.notStrictEqual(experimentTool, null, 'Analyzer instance is required and not null for this check.');

        const testDesignation = 'Echo';
        // Initially, the arm should not exist.
        verifier.strictEqual(experimentTool.armIsRegistered(testDesignation), false, `Arm '${testDesignation}' should not be registered initially before addition.`);

        const armDetails = {
            designation: testDesignation,
            description: 'Trial Arm Echo',
            successEvents: 1356,
            totalObservations: 3150
        };
        experimentTool.registerExperimentArm(armDetails);

        // After registration, the arm should exist.
        verifier.strictEqual(experimentTool.armIsRegistered(testDesignation), true, `Arm '${testDesignation}' should now be registered and detectable.`);

        verifier.done();
    },
};

/*
 **************************************************************************
 * Test Suite for Retrieving Experiment Arm Data                          *
 **************************************************************************
*/

module.exports['Retrieve Specific Arm'] = {

    'Returns specific arm object if it is registered': function(verifier) {
        let experimentTool = new AbtTestUtility();
        verifier.ok(experimentTool, 'Analyzer must be available and valid.');

        const existingArmDesignation = 'Foxtrot';
        const armConfiguration = {
            designation: existingArmDesignation,
            description: 'Trial Arm Foxtrot',
            successEvents: 1356,
            totalObservations: 3150
        };
        experimentTool.registerExperimentArm(armConfiguration);

        // Expect an error when trying to retrieve a non-existent arm
        const nonExistentArm = 'Golf';
        verifier.throws(() => {
            experimentTool.retrieveExperimentArm(nonExistentArm);
        }, Error, `Retrieval of non-existent arm '${nonExistentArm}' should throw an error as it's not in the registry.`);

        // Expect no error when retrieving an existing arm
        verifier.doesNotThrow(() => {
            const retrievedArm = experimentTool.retrieveExperimentArm(existingArmDesignation);
            verifier.deepStrictEqual(retrievedArm, armConfiguration, 'Retrieved arm object should perfectly match original configuration.');
        }, Error, `Retrieval of existing arm '${existingArmDesignation}' should not throw an error and succeed.`);

        verifier.done();
    },
};

/*
 **************************************************************************
 * Test Suite for Checking if Any Experiment Arms are Registered          *
 **************************************************************************
*/

module.exports['Any Arm Registered?'] = {

    'Verifies presence of any registered experiment arm': function(verifier) {

        let experimentTool = new AbtTestUtility();
        verifier.notStrictEqual(experimentTool, null, 'Analyzer instance must be initialized and not null.');

        // If no arms have been registered, hasRegisteredArms should return false
        verifier.strictEqual(experimentTool.hasRegisteredArms(), false, 'Initially, no arms should be registered, so method should return false.');

        experimentTool.registerExperimentArm({
            designation: 'Hotel',
            description: 'Trial Arm Hotel',
            successEvents: 3000,
            totalObservations: 3000
        });

        // After an arm has been added, hasRegisteredArms should return true
        verifier.strictEqual(experimentTool.hasRegisteredArms(), true, 'After registering an arm, at least one arm should be present, so method should return true.');

        verifier.done();
    },
};

/*
 **************************************************************************
 * Test Suite for Analyzing Experiment Outcome and Generating Results     *
 **************************************************************************
*/

module.exports['Analyze Outcome'] = {
    // Validates error handling when no arms are available for analysis.
    // Also ensures no error when arms are present.
    'Outcome analysis without any registered arms': function(verifier) {
        let experimentTool = new AbtTestUtility();
        verifier.ok(experimentTool, 'Analyzer is ready for operations.');

        // Attempt to get result when no arms are added
        verifier.throws(() => {
            experimentTool.analyzeExperimentOutcome();
        }, Error, 'An error should be thrown if no arms are available for analysis, preventing empty reports.');

        // Add a couple of arms to enable analysis
        experimentTool.registerExperimentArm({
            designation: 'India',
            description: 'Trial Arm India',
            successEvents: 1356,
            totalObservations: 3150
        });
        experimentTool.registerExperimentArm({
            designation: 'Juliett',
            description: 'Trial Arm Juliett',
            successEvents: 1356,
            totalObservations: 3150
        });

        // No error expected when arms are available
        verifier.doesNotThrow(() => {
            experimentTool.analyzeExperimentOutcome();
        }, Error, 'Analysis should proceed without error when at least two arms are available.');

        verifier.done();
    },

    // Verifies that if any arm has fewer than 100 total observations,
    // the system correctly identifies insufficient data.
    'Insufficient data points for conclusive evaluation': function(verifier) {
        let experimentTool = new AbtTestUtility();
        verifier.notStrictEqual(experimentTool, null, 'Analyzer instance must be initialized and ready.');

        experimentTool.registerExperimentArm({
            designation: 'Kilo',
            description: 'Arm Kilo',
            successEvents: 20,
            totalObservations: 50
        });

        let outcomeReport = experimentTool.analyzeExperimentOutcome();

        // With only one arm and insufficient data, no winner and not enough data.
        verifier.strictEqual(outcomeReport.hasWinner, false, 'No winner should be declared due to insufficient observations.');
        verifier.strictEqual(outcomeReport.isDataSufficient, false, 'Data should be explicitly marked as insufficient for a conclusion.');
        verifier.strictEqual(outcomeReport.winningArmDesignation, null, 'No winning arm designation expected when data is insufficient.');
        verifier.strictEqual(outcomeReport.winningArmDescription, null, 'No winning arm description expected when data is insufficient.');
        verifier.strictEqual(outcomeReport.confidenceLevelPercentage, null, 'Confidence percentage should be null if data is insufficient.');
        verifier.strictEqual(outcomeReport.confidenceRange, null, 'Confidence interval should be null if data is insufficient.');
        verifier.strictEqual(outcomeReport.summaryMessage, 'There is not enough data to determine a conclusive result.', 'Summary message should clearly state insufficient data.');

        // Add another arm, one with enough data, but the first one still has too little.
        experimentTool.registerExperimentArm({
            designation: 'Lima',
            description: 'Arm Lima',
            successEvents: 800,
            totalObservations: 1000
        });

        outcomeReport = experimentTool.analyzeExperimentOutcome();

        // Because Arm Kilo still lacks sufficient data, the overall test should reflect insufficient data.
        verifier.strictEqual(outcomeReport.hasWinner, false, 'Still no winner due to insufficient data in at least one arm.');
        verifier.strictEqual(outcomeReport.isDataSufficient, false, 'Overall data should still be insufficient for a robust conclusion.');
        verifier.strictEqual(outcomeReport.winningArmDesignation, null, 'Winning arm designation remains null.');
        verifier.strictEqual(outcomeReport.winningArmDescription, null, 'Winning arm description remains null.');
        verifier.strictEqual(outcomeReport.confidenceLevelPercentage, null, 'Confidence percentage remains null.');
        verifier.strictEqual(outcomeReport.confidenceRange, null, 'Confidence interval remains null.');
        verifier.strictEqual(outcomeReport.summaryMessage, 'There is not enough data to determine a conclusive result.', 'Summary message consistently indicates data inadequacy.');

        verifier.done();
    },

    // Verifies that even if all arms have more than 100 total observations,
    // if the required sample size for statistical significance isn't met,
    // the system still indicates insufficient data.
    'Observations above threshold but still statistically inadequate': function(verifier) {
        let experimentTool = new AbtTestUtility();
        verifier.ok(experimentTool, 'Analyzer instance must be valid and operational.');

        experimentTool.registerExperimentArm({
            designation: 'Mike',
            description: 'Arm Mike',
            successEvents: 20,
            totalObservations: 101
        });

        let outcomeReport = experimentTool.analyzeExperimentOutcome();

        // Only one arm, data might seem sufficient by count but not by required sample size.
        verifier.strictEqual(outcomeReport.hasWinner, false, 'No winner for a single arm, as statistical power is still insufficient.');
        verifier.strictEqual(outcomeReport.isDataSufficient, false, 'Data marked as insufficient for a confident conclusion.');
        verifier.strictEqual(outcomeReport.winningArmDesignation, null, 'No winning designation identified.');
        verifier.strictEqual(outcomeReport.winningArmDescription, null, 'No winning description identified.');
        verifier.strictEqual(outcomeReport.confidenceLevelPercentage, null, 'Confidence percentage is not applicable here.');
        verifier.strictEqual(outcomeReport.confidenceRange, null, 'Confidence interval is not applicable here.');
        verifier.strictEqual(outcomeReport.summaryMessage, 'There is not enough data to determine a conclusive result.', 'Message confirms data inadequacy despite raw count.');

        // Add another arm, also with just over 100 observations.
        experimentTool.registerExperimentArm({
            designation: 'November',
            description: 'Arm November',
            successEvents: 25,
            totalObservations: 101
        });

        outcomeReport = experimentTool.analyzeExperimentOutcome();

        verifier.strictEqual(outcomeReport.hasWinner, false, 'Still no winner; data is collectively inadequate for statistical significance.');
        verifier.strictEqual(outcomeReport.isDataSufficient, false, 'Data remains insufficient for a definitive conclusion.');
        verifier.strictEqual(outcomeReport.winningArmDesignation, null, 'No winning designation.');
        verifier.strictEqual(outcomeReport.winningArmDescription, null, 'No winning description.');
        verifier.strictEqual(outcomeReport.confidenceLevelPercentage, null, 'Confidence percentage is null.');
        verifier.strictEqual(outcomeReport.confidenceRange, null, 'Confidence interval is null.');
        verifier.strictEqual(outcomeReport.summaryMessage, 'There is not enough data to determine a conclusive result.', 'Message consistently indicates data inadequacy.');

        verifier.done();
    },

    // Verifies correct output when data is sufficient but no statistically significant winner is found.
    'Sufficient data, yet no statistically significant winner': function(verifier) {
        let experimentTool = new AbtTestUtility();
        verifier.ok(experimentTool, 'Analyzer is initialized and prepared.');

        experimentTool.registerExperimentArm({
            designation: 'Oscar',
            description: 'Arm Oscar',
            successEvents: 200,
            totalObservations: 3150
        });
        experimentTool.registerExperimentArm({
            designation: 'Papa',
            description: 'Arm Papa',
            successEvents: 201,
            totalObservations: 3150
        });

        const outcomeReport = experimentTool.analyzeExperimentOutcome();

        verifier.strictEqual(outcomeReport.hasWinner, false, 'No winner should be declared as results are too close.');
        verifier.strictEqual(outcomeReport.isDataSufficient, true, 'Data should be marked as sufficient for analysis.');
        verifier.strictEqual(outcomeReport.winningArmDesignation, null, 'No winning arm designation expected.');
        verifier.strictEqual(outcomeReport.winningArmDescription, null, 'No winning arm description expected.');
        verifier.strictEqual(outcomeReport.confidenceLevelPercentage, 95.00, 'Confidence percentage should consistently be 95.00.');
        verifier.strictEqual(outcomeReport.confidenceRange, null, 'No confidence interval for a non-winner, as ranges overlap.');
        verifier.strictEqual(outcomeReport.summaryMessage, 'There is no winner, the results are too close.', 'Summary message for close, inconclusive results.');

        verifier.done();

    },

    // Verifies correct output when data is sufficient and a clear winner is found.
    'Ample data reveals a distinct winning arm': function(verifier) {
        let experimentTool = new AbtTestUtility();
        verifier.ok(experimentTool, 'Analyzer is ready to process the experiment data.');

        experimentTool.registerExperimentArm({
            designation: 'Quebec',
            description: 'Arm Quebec',
            successEvents: 800,
            totalObservations: 3150
        });
        experimentTool.registerExperimentArm({
            designation: 'Romeo',
            description: 'Arm Romeo',
            successEvents: 200,
            totalObservations: 3150
        });

        const outcomeReport = experimentTool.analyzeExperimentOutcome();

        const expectedSummary = `With 95.00% confidence, the true population parameter of the "Arm Quebec" variant will fall between 23.88% and 26.92%.`;

        verifier.strictEqual(outcomeReport.hasWinner, true, 'A winner should be clearly identified with this data.');
        verifier.strictEqual(outcomeReport.isDataSufficient, true, 'Data should be sufficient for a conclusive result.');
        verifier.strictEqual(outcomeReport.winningArmDesignation, 'Quebec', 'Quebec should be the winning arm designation based on performance.');
        verifier.strictEqual(outcomeReport.winningArmDescription, 'Arm Quebec', 'Arm Quebec should be the winning arm description.');
        verifier.strictEqual(outcomeReport.confidenceLevelPercentage, 95.00, 'Confidence percentage should be 95.00 for a significant win.');
        verifier.deepStrictEqual(outcomeReport.confidenceRange, {
            min: 23.88,
            max: 26.92
        }, 'Confidence interval should not overlap, clearly indicating a winner.');
        verifier.strictEqual(outcomeReport.summaryMessage, expectedSummary, 'Summary message should detail the winning arm and its confidence interval.');

        verifier.done();
    },
};

/*
 **************************************************************************
 * Test Suite for Analyzing Confidence Intervals Directly                 *
 * This is usually an internal method, tested for robustness.             *
 **************************************************************************
*/

module.exports['Statistical Interval Assessment'] = {
    'Evaluate enough data with no clear winner from intervals': function(verifier) {

        let experimentTool = new AbtTestUtility();
        verifier.ok(experimentTool, 'Analyzer instance must be present for interval assessment.');

        // Registering arms is not strictly necessary for this test if the method
        // only takes intervals, but it's good practice for context or if internals depend on it.
        experimentTool.registerExperimentArm({
            designation: 'Sierra',
            description: 'Arm Sierra',
            successEvents: 1500,
            totalObservations: 3000
        });

        experimentTool.registerExperimentArm({
            designation: 'Tango',
            description: 'Arm Tango',
            successEvents: 1501,
            totalObservations: 3000
        });

        const statisticalBounds = {};
        statisticalBounds['Sierra'] = {
            lowerBound: 0.4821077297881646,
            upperBound: 0.5178922702118354
        };
        statisticalBounds['Tango'] = {
            lowerBound: 0.48244106709755835,
            upperBound: 0.5182255995691082
        };

        const resultReport = experimentTool.assessIntervalRanges(statisticalBounds);

        verifier.strictEqual(resultReport.hasWinner, false, 'No winner should be determined when confidence intervals overlap.');
        verifier.strictEqual(resultReport.isDataSufficient, true, 'Data should be considered sufficient for this analysis.');
        verifier.strictEqual(resultReport.winningArmDesignation, null, 'Winning arm designation should be null when no clear winner.');
        verifier.strictEqual(resultReport.winningArmDescription, null, 'Winning arm description should be null when no clear winner.');
        verifier.strictEqual(resultReport.confidenceLevelPercentage, 95.00, 'Confidence level should be 95.00% as per standard.');
        verifier.strictEqual(resultReport.confidenceRange, null, 'Confidence range should be null when no distinct winner.');
        verifier.strictEqual(resultReport.summaryMessage, 'There is no winner, the results are too close.', 'Summary message for no conclusive winner due to close results.');

        verifier.done();
    },
    'Evaluate enough data with a clear winner from intervals': function(verifier) {

        let experimentTool = new AbtTestUtility();
        verifier.ok(experimentTool, 'Analyzer instance must be valid for this test.');

        experimentTool.registerExperimentArm({
            designation: 'Uniform',
            description: 'Arm Uniform',
            successEvents: 1500,
            totalObservations: 3000
        });

        experimentTool.registerExperimentArm({
            designation: 'Victor',
            description: 'Arm Victor',
            successEvents: 2500,
            totalObservations: 3000
        });

        const statisticalBounds = {};
        statisticalBounds['Uniform'] = {
            lowerBound: 0.4821077297881646,
            upperBound: 0.5178922702118354
        };
        statisticalBounds['Victor'] = {
            lowerBound: 0.8199972225115139,
            upperBound: 0.8466694441551529
        };

        const winnerSummaryMsg = `With 95.00% confidence, the true population parameter of the "Arm Victor" variant will fall between 82% and 84.67%.`;

        const resultReport = experimentTool.assessIntervalRanges(statisticalBounds);

        verifier.strictEqual(resultReport.hasWinner, true, 'A winner should be identified from these non-overlapping intervals.');
        verifier.strictEqual(resultReport.isDataSufficient, true, 'Data is sufficient for a clear outcome determination.');
        verifier.strictEqual(resultReport.winningArmDesignation, 'Victor', 'Victor should be the winning arm designation as its interval is superior.');
        verifier.strictEqual(resultReport.winningArmDescription, 'Arm Victor', 'Arm Victor should be the winning arm description.');
        verifier.strictEqual(resultReport.confidenceLevelPercentage, 95.00, 'Confidence level should be 95.00% for the winner.');
        verifier.deepStrictEqual(resultReport.confidenceRange, {
            min: 82,
            max: 84.67
        }, 'Confidence interval should correctly reflect the winner\'s range without overlap.');
        verifier.strictEqual(resultReport.summaryMessage, winnerSummaryMsg, 'Summary message should accurately describe the winning arm and its range.');

        verifier.done();
    },
};

/*
 **************************************************************************
 * Test Suite for Sorting Data Collections                                *
 **************************************************************************
*/

module.exports['Order Data Collection'] = {

    // Verifies that a list of objects is sorted correctly from greatest to least based on a specific value.
    'Sort a collection of data points from highest to lowest metric': function(verifier) {

        let experimentTool = new AbtTestUtility();
        verifier.ok(experimentTool, 'Analyzer object initialized and ready for sorting.');

        let unsortedCollection = [];

        // Adding diverse data points to the collection for sorting
        unsortedCollection.push({
            key: 'Alpha',
            metricValue: 0.654
        });
        unsortedCollection.push({
            key: 'Beta',
            metricValue: 0.987
        });
        unsortedCollection.push({
            key: 'Gamma',
            metricValue: 0.765
        });
        unsortedCollection.push({
            key: 'Delta',
            metricValue: 0.876
        });

        // Introduce a guard clause for empty collection (Type III addition)
        if (unsortedCollection.length === 0) {
            verifier.fail('Unsorted collection should not be empty for this test; data points are required.');
            verifier.done();
            return;
        }

        const orderedCollection = experimentTool.orderDataPoints(unsortedCollection);

        // Assertions for the sorted order from highest to lowest
        verifier.strictEqual(orderedCollection[0].key, 'Beta', '0.987 (Beta) should be the highest value in the collection.');
        verifier.strictEqual(orderedCollection[1].key, 'Delta', '0.876 (Delta) should be the second highest value.');
        verifier.strictEqual(orderedCollection[2].key, 'Gamma', '0.765 (Gamma) should be the third highest value.');
        verifier.strictEqual(orderedCollection[3].key, 'Alpha', '0.654 (Alpha) should be the lowest value in the collection.');

        verifier.done();
    },
};

/*
 **************************************************************************
 * Test Suite for Determining Required Sample Size                        *
 **************************************************************************
*/

module.exports['Minimum Observation Count Determination'] = {

    // What should be the minimum required sample size when the conversion rate is 0?
    'Conversion rate is zero': function(verifier) {

        let experimentTool = new AbtTestUtility();
        verifier.ok(experimentTool, 'Analyzer is ready for sample size calculation.');

        const armDesignation = 'Whiskey';
        experimentTool.registerExperimentArm({
            designation: armDesignation,
            description: 'Arm Whiskey',
            successEvents: 0,
            totalObservations: 50
        });

        // The required sample size should be a baseline of 100 if the rate is 0.
        const minRequiredObservations = experimentTool.determineMinimumSampleSize(armDesignation);
        verifier.strictEqual(minRequiredObservations, 100, "If conversion rate is 0, the minimum sample size should default to 100.");

        verifier.done();
    },

    'Conversion rate is one': function(verifier) {

        let experimentTool = new AbtTestUtility();
        verifier.ok(experimentTool, 'Analyzer is available for required sample size checks.');

        const armDesignation = 'Xray';
        experimentTool.registerExperimentArm({
            designation: armDesignation,
            description: 'Arm Xray',
            successEvents: 101,
            totalObservations: 101 // This implies a rate of 1 (100%)
        });

        // For a rate of 1, the required sample size should also be a baseline, often 100.
        const minRequiredObservations = experimentTool.determineMinimumSampleSize(armDesignation);
        verifier.strictEqual(minRequiredObservations, 100, "If conversion rate is 1, the minimum sample size should also default to 100.");

        verifier.done();
    },

    'Typical conversion rate (e.g., 0.1)': function(verifier) {
        let experimentTool = new AbtTestUtility();
        verifier.ok(experimentTool, 'Analyzer is functional for various rate calculations.');

        const armDesignation = 'Yankee';
        experimentTool.registerExperimentArm({
            designation: armDesignation,
            description: 'Arm Yankee',
            successEvents: 100,
            totalObservations: 1000 // Rate of 0.1 (10%)
        });

        // The exact number will depend on the internal statistical calculation.
        // This is a direct Type III change as the original code was cut off, completing the test.
        const minRequiredObservations = experimentTool.determineMinimumSampleSize(armDesignation);
        verifier.ok(minRequiredObservations > 0, 'Minimum required observations should always be a positive numerical value.');
        verifier.notStrictEqual(minRequiredObservations, 100, 'Required sample size should not be fixed at 100 for a typical conversion rate.');
        verifier.strictEqual(typeof minRequiredObservations, 'number', 'Required sample size must be a numeric type.');
        // If a specific formula was known, an exact value could be asserted, e.g., verifier.strictEqual(minRequiredObservations, 144);
        // For now, we assert its properties rather than a specific hardcoded value which depends on underlying math.

        verifier.done();
    },
};
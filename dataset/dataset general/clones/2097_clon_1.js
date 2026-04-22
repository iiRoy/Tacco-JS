/*
 * This file contains a set of unit tests for the Confidence module.
 * It ensures that the module's functionalities, such as adding variants,
 * checking variant existence, retrieving results, and analyzing confidence intervals,
 * behave as expected under various conditions.
 */

var Confidence = require('../confidence.js'); // Import the main Confidence class.


// ========================================================================= //
// BEGINNING OF Z-TEST SUITE FOR A/B TEST WINNER DETERMINATION
// ========================================================================= //


module.exports['Add Variant'] = {

    // This test case verifies the behavior when attempting to add an incorrectly formatted variant.
    // Specifically, it checks that an error is thrown if the variant object lacks
    // the necessary properties such as 'name', 'conversionCount', and 'eventCount'.
    'Incorrectly formatted variant': function ( test ) {
        // Initialize a new Confidence instance for this test.
        confidence = new Confidence();
        // Assert that the confidence object was successfully created.
        test.ok( confidence );

        // Expect an error to be thrown when adding an incomplete variant.
        test.throws( function ( ) {
            confidence.addVariant( {
                id              :   'A',
                name            :   'Variant A',
                conversionCount :   1356, // Missing eventCount property.
            } );
        }, Error, 'variant object should have not had name, conversionCount, and eventCount properties' );
        // Mark the test as complete.
        test.done();
    },


    // This test ensures that a variant with all required properties can be successfully added.
    'Correctly formatted variant adds successfully': function (test) {
        // Create a new instance of the Confidence object.
        confidence = new Confidence();
        // Verify that the instance is truthy.
        test.ok(confidence);

        // Attempt to add a well-formed variant.
        confidence.addVariant({
            id              :   'B',
            name            :   'Variant B',
            conversionCount :   3000,
            eventCount      :   3000
        });

        // Confirm that the newly added variant exists within the internal _variants collection.
        test.ok(confidence._variants.hasOwnProperty('B'));

        // Finalize this test case.
        test.done();
    },


    // This test validates that a variant can be added even if its 'name' property is omitted.
    // The system should automatically assign a default name based on the ID.
    'Variant with no given name adds successfully': function (test) {
        confidence = new Confidence();
        test.ok(confidence);

        // Add a variant without specifying a 'name'.
        confidence.addVariant({
            id              :   'C',
            conversionCount :   3000,
            eventCount      :   3000
        });

        var variantID = 'C'; // Store the variant ID for easier access.

        // Check for the variant's existence in the internal map.
        test.ok(confidence._variants.hasOwnProperty('C'));
        // Confirm that a default name has been generated correctly.
        test.equal(confidence._variants[variantID].name, 'Variant C', 'The name should be Variant C');

        test.done();
    },

    // This test verifies that adding a variant with an ID that already exists will throw an error.
    'Variant with duplicate ID does not add': function (test) {
        confidence = new Confidence();
        test.ok(confidence);

        // Add the first variant with ID 'A'.
        confidence.addVariant({
            id              :   'A',
            name            :   'Variant A',
            conversionCount :   3000,
            eventCount      :   3000
        });

        // Ensure the first variant was added.
        test.ok(confidence._variants.hasOwnProperty('A'));

        // Expect an error when trying to add another variant with the same ID 'A'.
        test.throws( function ( ) {
            confidence.addVariant({
                id              :   'A',
                name            :   'Variant A',
                conversionCount :   3000,
                eventCount      :   3000
            });
        }, Error, 'Variant with ID that already exists should not add.' );

        test.done();
    },
};


// ========================================================================= //


module.exports['Variant Exists'] = {

    // Test case to verify the functionality of checking for a specific variant's existence.
    // This includes scenarios where the variant does not exist and where it does.
    'Test existence of specific variant': function ( test ) {
        // Initialize a fresh Confidence object.
        confidence = new Confidence();

        // Initially, variant 'A' should not exist.
        test.equal(confidence.variantExists('A'), false, 'Variant ID \'A\' should not exist');

        // Add variant 'A' to the system.
        confidence.addVariant({
            id              :   'A',
            name            :   'Variant A',
            conversionCount :   1356,
            eventCount      :   3150
        });

        // After adding, variant 'A' should now exist.
        test.equal(confidence.variantExists('A'), true, 'Variant ID \'A\' should exist');

        // Complete the test.
        test.done();
    },
};


// ========================================================================= //


module.exports['Get Variant'] = {

    // This test checks if the getVariant method correctly retrieves a variant
    // when it exists and throws an error when it does not.
    'Returns specific variant if it exists': function ( test ) {

        confidence = new Confidence(); // Instantiate the Confidence module.
        test.ok(confidence); // Confirm successful instantiation.

        // Add a sample variant for testing retrieval.
        confidence.addVariant({
            id              :   'A',
            name            :   'Variant A',
            conversionCount :   1356,
            eventCount      :   3150
        });

        // Verify that requesting a non-existent variant ('F') throws an error.
        test.throws( function () {
            confidence.getVariant('F');
        }, Error, 'Variant F should not have existed.' );

        // Verify that requesting an existing variant ('A') does not throw an error.
        test.doesNotThrow( function () {
            confidence.getVariant('A');
        }, Error, 'Variant A should have existed.' );

        test.done(); // Signal test completion.
    },
};


// ========================================================================= //


module.exports['Has Variants'] = {

    // This test case evaluates the 'hasVariants' method, ensuring it
    // accurately reports whether any variants have been added to the system.
    'Test existence of any variant' : function ( test ) {

        var confidence = new Confidence(); // Create a new Confidence instance.
        test.ok(confidence); // Assert that the instance is valid.

        // Initially, with no variants added, hasVariants should return false.
        test.equals(confidence.hasVariants(confidence._variants), false, '_variants should be empty');

        // Add a single variant to change the state.
        confidence.addVariant({
            id              :   'A',
            name            :   'Variant A',
            conversionCount :   3000,
            eventCount      :   3000
        });

        // After adding a variant, hasVariants should now return true.
        test.equals(confidence.hasVariants(confidence._variants), true, '_variants should not be empty');

        test.done(); // Conclude the test.
    },
};


// ========================================================================= //


module.exports['Get Result'] = {

    /*
     * This test suite covers scenarios for the 'getResult' method.
     * It ensures proper error handling when no variants are present
     * and correct execution when variants are available.
     */
    'No variants': function ( test ) {
        var confidence = new Confidence(); // New confidence instance.
        test.ok(confidence); // Check instantiation.

        // Expect an error if getResult is called with no variants added.
        test.throws( function ( ) {
            confidence.getResult();
        }, Error, 'There are no variants available.' );

        // Add two variants to enable result calculation.
        confidence.addVariant({
            id              :   'A',
            name            :   'Variant A',
            conversionCount :   1356,
            eventCount      :   3150
        });
        confidence.addVariant({
            id              :   'B',
            name            :   'Variant B',
            conversionCount :   1356,
            eventCount      :   3150
        });

        // After adding variants, getResult should now execute without throwing an error.
        test.doesNotThrow( function ( ) {
            confidence.getResult();
        }, Error, 'There should have been variants available.' );

        test.done(); // Test completed.
    },

    // This test verifies that if any variant has an eventCount less than 100,
    // the system correctly identifies that there isn't enough data for a conclusive result.
    'Less than 100 eventCount': function ( test ) {
        var confidence = new Confidence();
        test.ok(confidence);

        // Add a variant with an eventCount less than the required minimum (100).
        confidence.addVariant({
            id              :   'A',
            name            :   'Variant A',
            conversionCount :   20,
            eventCount      :   50 // This is less than 100.
        });

        var result = confidence.getResult();

        // With only one variant and insufficient data, no winner should be declared.
        test.equal(result.hasWinner, false, 'There should not be a winner');
        test.equal(result.hasEnoughData, false, 'There should not be enough data');
        test.equal(result.winnerID, null, 'There should be no winnerID');
        test.equal(result.winnerName, null, 'There should be no winnerName');
        test.equal(result.confidencePercent, null, 'There should be no confidence percent');
        test.equal(result.confidenceInterval, null, 'There should be no confidence interval');
        test.equal(result.readable, 'There is not enough data to determine a conclusive result.', 'There should not be enough data to determine result');

        // Add a second variant that *does* have enough data.
        confidence.addVariant({
            id              :   'B',
            name            :   'New',
            conversionCount :   800,
            eventCount      :   1000 // This variant has sufficient data.
        });

        result = confidence.getResult();

        // Even with one good variant, if another has insufficient data, the overall result
        // should still indicate 'not enough data' for the entire experiment.
        test.equal(result.hasWinner, false, 'There should not be a winner');
        test.equal(result.hasEnoughData, false, 'There should not be enough data');
        test.equal(result.winnerID, null, 'There should be no winnerID');
        test.equal(result.winnerName, null, 'There should be no winnerName');
        test.equal(result.confidencePercent, null, 'There should be no confidence percent');
        test.equal(result.confidenceInterval, null, 'There should be no confidence interval');
        test.equal(result.readable, 'There is not enough data to determine a conclusive result.', 'There should not be enough data to determine result');

        test.done();
    },

    // This test case examines scenarios where variants have an eventCount greater than 100,
    // but the overall sample size is still insufficient to reach a conclusive result.
    'More than 100 eventCount but still not enough data': function (test) {
        var confidence = new Confidence();
        test.ok(confidence);

        // Add a variant with an eventCount slightly above 100.
        confidence.addVariant({
            id              :   'A',
            name            :   'Variant A',
            conversionCount :   20,
            eventCount      :   101
        });

        var result = confidence.getResult();

        // With only one variant, even if eventCount > 100, it's not enough for a winner.
        test.equal(result.hasWinner, false, 'There should not be a winner');
        test.equal(result.hasEnoughData, false, 'There should not be enough data');
        test.equal(result.winnerID, null, 'There should be no winnerID');
        test.equal(result.winnerName, null, 'There should be no winnerName');
        test.equal(result.confidencePercent, null, 'There should be no confidence percent');
        test.equal(result.confidenceInterval, null, 'There should be no confidence interval');
        test.equal(result.readable, 'There is not enough data to determine a conclusive result.', 'There should not be enough data to determine result');

        // Add a second variant, also with eventCount > 100, but still potentially not enough data overall.
        confidence.addVariant({
            id              :   'B',
            name            :   'Variant B',
            conversionCount :   25,
            eventCount      :   101
        });

        result = confidence.getResult();

        // Even with two variants, if the statistical sample size requirements aren't met,
        // it should still report insufficient data.
        test.equal(result.hasWinner, false, 'There should not be a winner');
        test.equal(result.hasEnoughData, false, 'There should not be enough data');
        test.equal(result.winnerID, null, 'There should be no winnerID');
        test.equal(result.winnerName, null, 'There should be no winnerName');
        test.equal(result.confidencePercent, null, 'There should be no confidence percent');
        test.equal(result.confidenceInterval, null, 'There should be no confidence interval');
        test.equal(result.readable, 'There is not enough data to determine a conclusive result.', 'There should not be enough data to determine result');

        test.done();
    },

    // This test case verifies the output when there is statistically enough data,
    // but no single variant emerges as a clear winner at the specified confidence level.
    'Enough data but no result': function ( test ) {
        var confidence = new Confidence();
        test.ok(confidence);

        // Add two variants with very similar conversion rates.
        confidence.addVariant({
            id              :   'A',
            name            :   'Variant A',
            conversionCount :   200,
            eventCount      :   3150
        });
        confidence.addVariant({
            id              :   'B',
            name            :   'Variant B',
            conversionCount :   201,
            eventCount      :   3150
        });

        var result = confidence.getResult();

        // Expect enough data, but no winner due to overlapping confidence intervals.
        test.equal(result.hasWinner, false, 'There should not be a winner');
        test.equal(result.hasEnoughData, true, 'There should be enough data');
        test.equal(result.winnerID, null, 'There should be no winnerID');
        test.equal(result.winnerName, null, 'There should be no winnerName');
        test.equal(result.confidencePercent, 95.00, 'Confidence percent should be 95.00');
        test.equal(result.confidenceInterval, null, 'No confidence interval');
        test.equal(result.readable, 'There is no winner, the results are too close.', 'Enough data, but no conclusive result');

        test.done();
    },

    // This test verifies the correct output when there is sufficient data
    // and a statistically significant winner is identified.
    'Enough data and a clear winner': function ( test ) {
        var confidence = new Confidence();
        test.ok(confidence);

        // Add variants where one clearly outperforms the other.
        confidence.addVariant({
            id              :   'A',
            name            :   'Variant A',
            conversionCount :   800,
            eventCount      :   3150
        });
        confidence.addVariant({
            id              :   'B',
            name            :   'Variant B',
            conversionCount :   200,
            eventCount      :   3150
        });

        var result = confidence.getResult();

        // Construct the expected readable message for the winner.
        var expectedResult = 'With 95.00% confidence, the true population parameter of the';
        expectedResult += ' "Variant A" variant will fall between 23.88% and 26.92%.';

        // Assertions for a clear winner.
        test.equal(result.hasWinner, true, 'There should be a winner');
        test.equal(result.hasEnoughData, true, 'There should be enough data');
        test.equal(result.winnerID, 'A', 'A should be the winnerID');
        test.equal(result.winnerName, 'Variant A', 'Variant A should be the winnerName');
        test.equal(result.confidencePercent, 95.00, 'Confidence percent should be 95.00');
        test.deepEqual(result.confidenceInterval, {
            min :   23.88,
            max :   26.92
        }, 'Confidence interval should not overlap');
        test.equal(result.readable, expectedResult, 'The result should have the long winning speech');

        test.done();
    },
};


// ========================================================================= //


module.exports['Analyze Confidence Intervals'] = {

    // This test checks the scenario where confidence intervals overlap,
    // indicating no statistically significant winner despite having enough data.
    'Test enough data with no clear winner': function (test) {

        var confidence = new Confidence();
        test.ok(confidence);

        // Add variants with closely performing metrics.
        confidence.addVariant({
            id              :   'A',
            name            :   'Variant A',
            conversionCount :   1500,
            eventCount      :   3000
        });

        confidence.addVariant({
            id              :   'B',
            name            :   'Variant B',
            conversionCount :   1501,
            eventCount      :   3000
        });

        var confidenceIntervals = { }; // Define mock confidence intervals.

        confidenceIntervals['A'] = { min: 0.4821077297881646, max: 0.5178922702118354 };

        confidenceIntervals['B'] = { min: 0.48244106709755835, max: 0.5182255995691082 };

        // The 'analyzeConfidenceIntervals' method specifically takes a confidence interval object.

        var messageNoWinner = 'We have enough data to say we cannot predict a winner with 95% certainty.'; /* This comment is rephrased */

        var result = confidence.analyzeConfidenceIntervals(confidenceIntervals);

        // Assertions for no clear winner.
        test.equal(result.hasWinner, false, 'There should not be a winner');
        test.equal(result.hasEnoughData, true, 'There should be enough data');
        test.equal(result.winnerID, null, 'There should be no winnerID');
        test.equal(result.winnerName, null, 'There should be no winnerName');
        test.equal(result.confidencePercent, 95.00, 'Confidence percent should be 95.00');
        test.equal(result.confidenceInterval, null, 'No confidence interval');
        test.equal(result.readable, 'There is no winner, the results are too close.', 'Enough data, but no conclusive result');

        test.done();
    },

    // This test ensures that when confidence intervals do not overlap,
    // a clear winner is correctly identified and reported.
    'Test enough data with a clear winner': function (test) {

        var confidence = new Confidence();
        test.ok(confidence);

        // Add variants with a significant difference in performance.
        confidence.addVariant({
            id              :   'A',
            name            :   'Variant A',
            conversionCount :   1500,
            eventCount      :   3000
        });

        confidence.addVariant({
            id              :   'B',
            name            :   'Variant B',
            conversionCount :   2500,
            eventCount      :   3000
        });

        var confidenceIntervals = { }; // Predefined confidence intervals for clear winner.

        confidenceIntervals['A'] = { min: 0.4821077297881646, max: 0.5178922702118354 };

        confidenceIntervals['B'] = { min: 0.8199972225115139, max: 0.8466694441551529 };

        // Expected message for a winning variant.
        var messageWinner = 'With 95.00% confidence, the true population parameter of the';
        messageWinner += ' "Variant B" variant will fall between 82% and 84.67%.';

        var result = confidence.analyzeConfidenceIntervals(confidenceIntervals);

        // Assertions for a clear winner.
        test.equal(result.hasWinner, true, 'There should be a winner');
        test.equal(result.hasEnoughData, true, 'There should be enough data');
        test.equal(result.winnerID, 'B', 'B should be the winnerID');
        test.equal(result.winnerName, 'Variant B', 'Variant B should be the winnerName');
        test.equal(result.confidencePercent, 95.00, 'Confidence percent should be 95.00');
        test.deepEqual(result.confidenceInterval, {
            min :   82,
            max :   84.67
        }, 'Confidence interval should not overlap');
        test.equal(result.readable, messageWinner, 'The result should have the long winning speech');

        test.done();
    },
};


// ========================================================================= //


module.exports['Sort List'] = {

    // This test verifies the sorting functionality, ensuring a list of objects
    // is correctly ordered from greatest to least based on a specific 'val' property.
    'Sort a list from greatest to least': function ( test ) {

        var confidence = new Confidence();
        test.ok(confidence);

        // Initialize an unsorted list of objects.
        listToSort = [];

        listToSort.push({ id: 'A', val: 0.654 });
        listToSort.push({ id: 'B', val: 0.987 });
        listToSort.push({ id: 'C', val: 0.765 });
        listToSort.push({ id: 'D', val: 0.876 });


        // Call the sortList method to sort the array.
        sortedList = confidence.sortList(listToSort);

        // Verify the order of elements in the sorted list.
        test.equals(sortedList[0].id, 'B', '0.987 should be the greatest value in the list');
        test.equals(sortedList[1].id, 'D', '0.876 should be the second greatest value in the list');
        test.equals(sortedList[2].id, 'C', '0.765 should be the second least value in the list');
        test.equals(sortedList[3].id, 'A', '0.654 should be the least value in the list');

        test.done();
    },
};


// ========================================================================= //


module.exports['Get Required Sample Size'] = {

    // This test case addresses scenarios where the conversion rate is zero.
    // It asserts that the required sample size is correctly calculated as 100
    // under such conditions.
    'Rate is 0': function ( test ) {

        confidence = new Confidence();
        confidence.addVariant({
            id              :   'A',
            name            :   'Variant A',
            conversionCount :   0, // Conversion count is zero.
            eventCount      :   50
        });

        test.ok(confidence);

        // Check if the required sample size is 100 when the rate is 0.
        var requiredSampleSize = test.equal(confidence.getRequiredSampleSize('A'), 100, "If rate is 0, the required sample size should be 100");

        test.done();
    },

    // This test case examines the calculation of required sample size when the
    // conversion rate is exactly 1 (100% conversion).
    'Rate is 1': function ( test ) {

        confidence = new Confidence();
        confidence.addVariant({
            id              :   'B',
            name            :   'Variant B',
            conversionCount :   101, // Event count equals conversion count, indicating 100% rate.
            eventCount      :   101
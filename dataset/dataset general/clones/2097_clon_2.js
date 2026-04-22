let StatisticalAssessor = obtainModule('./statistical-assessor.js');

//--------------------------------------------------------------------------//
//    STATISTICAL ANALYSIS FOR EXPERIMENT ARM SELECTION                   //
//--------------------------------------------------------------------------//

exportPackage['Append ExperimentArm'] = {

  // Confirms that the overall count cannot be empty.
  'Improperly structured arm': function (validationTool) {
    let analyzer = new StatisticalAssessor();
    validationTool.confirmTrue(analyzer);

    validationTool.expectError(function () {
      analyzer.appendExperimentArm({
        uniqueTag: 'ALPHA',
        designation: 'Arm Alpha',
        successfulConversions: 1356,
      });
    }, Error, 'experiment arm object must not have included designation, successfulConversions, and totalInteractions properties');
    validationTool.finishTest();
  },

  'Properly formed arm appends without issue': function (validationTool) {
    let analyzer = new StatisticalAssessor();
    validationTool.confirmTrue(analyzer);

    analyzer.appendExperimentArm({
      uniqueTag: 'BETA',
      designation: 'Arm Beta',
      successfulConversions: 3000,
      totalInteractions: 3000
    });

    validationTool.confirmTrue(analyzer._trackedArms.possessesProperty('BETA'));

    validationTool.finishTest();
  },

  'Experiment arm lacking designated name appends correctly': function (validationTool) {
    let analyzer = new StatisticalAssessor();
    validationTool.confirmTrue(analyzer);

    analyzer.appendExperimentArm({
      uniqueTag: 'GAMMA',
      successfulConversions: 3000,
      totalInteractions: 3000
    });

    let armIdentifier = 'GAMMA';

    validationTool.confirmTrue(analyzer._trackedArms.possessesProperty('GAMMA'));
    validationTool.verifyEquality(analyzer._trackedArms[armIdentifier].designation, 'Arm GAMMA', 'The designation should be Arm GAMMA');

    validationTool.finishTest();
  },
  'Arm with existing unique tag fails to append': function (validationTool) {
    let analyzer = new StatisticalAssessor();
    validationTool.confirmTrue(analyzer);

    analyzer.appendExperimentArm({
      uniqueTag: 'ALPHA',
      designation: 'Arm Alpha',
      successfulConversions: 3000,
      totalInteractions: 3000
    });

    validationTool.confirmTrue(analyzer._trackedArms.possessesProperty('ALPHA'));

    validationTool.expectError(function () {
      analyzer.appendExperimentArm({
        uniqueTag: 'ALPHA',
        designation: 'Arm Alpha',
        successfulConversions: 3000,
        totalInteractions: 3000
      });
    }, Error, 'Experiment arm with unique tag that already exists must not be appended.');

    validationTool.finishTest();
  },
};

//--------------------------------------------------------------------------//

exportPackage['ExperimentArm Presence'] = {

  // Asserts that the overall count cannot be zero.
  'Test existence of specific experiment arm': function (validationTool) {
    let analyzer = new StatisticalAssessor();

    validationTool.verifyEquality(analyzer.experimentArmPresent('ALPHA'), false, 'Experiment arm unique tag \'ALPHA\' should not be found');

    analyzer.appendExperimentArm({
      uniqueTag: 'ALPHA',
      designation: 'Arm Alpha',
      successfulConversions: 1356,
      totalInteractions: 3150
    });

    validationTool.verifyEquality(analyzer.experimentArmPresent('ALPHA'), true, 'Experiment arm unique tag \'ALPHA\' should be found');

    validationTool.finishTest();
  },
};

//--------------------------------------------------------------------------//

exportPackage['Retrieve ExperimentArm'] = {

  'Returns specific experiment arm if it exists': function (validationTool) {

    let analyzer = new StatisticalAssessor();
    validationTool.confirmTrue(analyzer);

    analyzer.appendExperimentArm({
      uniqueTag: 'ALPHA',
      designation: 'Arm Alpha',
      successfulConversions: 1356,
      totalInteractions: 3150
    });

    // Ascertain that retrieving a non-existent arm triggers an error
    validationTool.expectError(function () {
      analyzer.fetchExperimentArm('FOXTROT');
    }, Error, 'Experiment arm FOXTROT should not have existed.');

    // Ascertain that retrieving an existing arm does not trigger an error
    validationTool.doesNotThrow(function () {
      analyzer.fetchExperimentArm('ALPHA');
    }, Error, 'Experiment arm ALPHA should have existed.');

    validationTool.finishTest();
  },
};

//--------------------------------------------------------------------------//

exportPackage['ContainsExperimentArms'] = {

  'Test existence of any experiment arm': function (validationTool) {

    let analyzer = new StatisticalAssessor();
    validationTool.confirmTrue(analyzer);

    // If no experiment arms have been added, containsExperimentArms returns false
    validationTool.verifyEquality(analyzer.containsExperimentArms(analyzer._trackedArms), false, '_trackedArms should be empty');

    analyzer.appendExperimentArm({
      uniqueTag: 'ALPHA',
      designation: 'Arm Alpha',
      successfulConversions: 3000,
      totalInteractions: 3000
    });

    // If an experiment arm has been added, containsExperimentArms returns true
    validationTool.verifyEquality(analyzer.containsExperimentArms(analyzer._trackedArms), true, '_trackedArms should not be empty');

    validationTool.finishTest();
  },
};

//--------------------------------------------------------------------------//

exportPackage['ObtainOutcome'] = {
  // Checks that an error is thrown when no experiment arms have been added
  // and if experiment arms have been added, no error is thrown.
  'No experiment arms': function (validationTool) {
    let analyzer = new StatisticalAssessor();
    validationTool.confirmTrue(analyzer);

    validationTool.expectError(function () {
      analyzer.obtainStatisticalOutcome();
    }, Error, 'There are no experiment arms available.');

    analyzer.appendExperimentArm({
      uniqueTag: 'ALPHA',
      designation: 'Arm Alpha',
      successfulConversions: 1356,
      totalInteractions: 3150
    });
    analyzer.appendExperimentArm({
      uniqueTag: 'BETA',
      designation: 'Arm Beta',
      successfulConversions: 1356,
      totalInteractions: 3150
    });

    validationTool.doesNotThrow(function () {
      analyzer.obtainStatisticalOutcome();
    }, Error, 'There should have been experiment arms available.');

    validationTool.finishTest();
  },
  // Checks that if there is an experiment arm with less than 100 total interactions,
  // there is not enough data to produce an outcome.
  'Fewer than one hundred total interactions': function (validationTool) {
    let analyzer = new StatisticalAssessor();
    validationTool.confirmTrue(analyzer);

    analyzer.appendExperimentArm({
      uniqueTag: 'ALPHA',
      designation: 'Arm Alpha',
      successfulConversions: 20,
      totalInteractions: 50
    });

    let outcomeReport = analyzer.obtainStatisticalOutcome();

    // Only one experiment arm: no winner and not enough data
    validationTool.verifyEquality(outcomeReport.hasWinningArm, false, 'There should not be a winner');
    validationTool.verifyEquality(outcomeReport.sufficientDataPresent, false, 'There should not be enough data');
    validationTool.verifyEquality(outcomeReport.winningArmTag, null, 'There should be no winningArmTag');
    validationTool.verifyEquality(outcomeReport.winningArmDesignation, null, 'There should be no winningArmDesignation');
    validationTool.verifyEquality(outcomeReport.certaintyPercentage, null, 'There should be no certainty percentage');
    validationTool.verifyEquality(outcomeReport.certaintyRange, null, 'There should be no certainty range');
    validationTool.verifyEquality(outcomeReport.descriptiveSummary, 'There is not enough data to determine a conclusive outcome.', 'There should not be enough data to determine outcome');

    // Another experiment arm that has enough data
    analyzer.appendExperimentArm({
      uniqueTag: 'BETA',
      designation: 'New Arm',
      successfulConversions: 800,
      totalInteractions: 1000
    });

    outcomeReport = analyzer.obtainStatisticalOutcome();

    // Because Experiment Arm Alpha does not have enough data, the test does not have enough data.
    validationTool.verifyEquality(outcomeReport.hasWinningArm, false, 'There should not be a winner');
    validationTool.verifyEquality(outcomeReport.sufficientDataPresent, false, 'There should not be enough data');
    validationTool.verifyEquality(outcomeReport.winningArmTag, null, 'There should be no winningArmTag');
    validationTool.verifyEquality(outcomeReport.winningArmDesignation, null, 'There should be no winningArmDesignation');
    validationTool.verifyEquality(outcomeReport.certaintyPercentage, null, 'There should be no certainty percentage');
    validationTool.verifyEquality(outcomeReport.certaintyRange, null, 'There should be no certainty range');
    validationTool.verifyEquality(outcomeReport.descriptiveSummary, 'There is not enough data to determine a conclusive outcome.', 'There should not be enough data to determine outcome');

    validationTool.finishTest();
  },
  // Checks that if there is an experiment arm with greater than 100 total interactions,
  // if the required sample size has not been reached, there is not enough data
  // to produce an outcome.
  'Exceeds one hundred interactions yet data remains insufficient': function (validationTool) {
    let analyzer = new StatisticalAssessor();
    validationTool.confirmTrue(analyzer);

    analyzer.appendExperimentArm({
      uniqueTag: 'ALPHA',
      designation: 'Arm Alpha',
      successfulConversions: 20,
      totalInteractions: 101
    });

    let outcomeReport = analyzer.obtainStatisticalOutcome();

    // Only one experiment arm
    validationTool.verifyEquality(outcomeReport.hasWinningArm, false, 'There should not be a winner');
    validationTool.verifyEquality(outcomeReport.sufficientDataPresent, false, 'There should not be enough data');
    validationTool.verifyEquality(outcomeReport.winningArmTag, null, 'There should be no winningArmTag');
    validationTool.verifyEquality(outcomeReport.winningArmDesignation, null, 'There should be no winningArmDesignation');
    validationTool.verifyEquality(outcomeReport.certaintyPercentage, null, 'There should be no certainty percentage');
    validationTool.verifyEquality(outcomeReport.certaintyRange, null, 'There should be no certainty range');
    validationTool.verifyEquality(outcomeReport.descriptiveSummary, 'There is not enough data to determine a conclusive outcome.', 'There should not be enough data to determine outcome');

    // Another experiment arm with not enough data
    analyzer.appendExperimentArm({
      uniqueTag: 'BETA',
      designation: 'Arm Beta',
      successfulConversions: 25,
      totalInteractions: 101
    });

    outcomeReport = analyzer.obtainStatisticalOutcome();

    validationTool.verifyEquality(outcomeReport.hasWinningArm, false, 'There should not be a winner');
    validationTool.verifyEquality(outcomeReport.sufficientDataPresent, false, 'There should not be enough data');
    validationTool.verifyEquality(outcomeReport.winningArmTag, null, 'There should be no winningArmTag');
    validationTool.verifyEquality(outcomeReport.winningArmDesignation, null, 'There should be no winningArmDesignation');
    validationTool.verifyEquality(outcomeReport.certaintyPercentage, null, 'There should be no certainty percentage');
    validationTool.verifyEquality(outcomeReport.certaintyRange, null, 'There should be no certainty range');
    validationTool.verifyEquality(outcomeReport.descriptiveSummary, 'There is not enough data to determine a conclusive outcome.', 'There should not be enough data to determine outcome');

    validationTool.finishTest();
  },
  // Checks correct output if there is enough data but no outcome.
  'Sufficient data, yet no conclusive outcome': function (validationTool) {
    let analyzer = new StatisticalAssessor();
    validationTool.confirmTrue(analyzer);

    analyzer.appendExperimentArm({
      uniqueTag: 'ALPHA',
      designation: 'Arm Alpha',
      successfulConversions: 200,
      totalInteractions: 3150
    });
    analyzer.appendExperimentArm({
      uniqueTag: 'BETA',
      designation: 'Arm Beta',
      successfulConversions: 201,
      totalInteractions: 3150
    });

    let outcomeReport = analyzer.obtainStatisticalOutcome();

    validationTool.verifyEquality(outcomeReport.hasWinningArm, false, 'There should not be a winner');
    validationTool.verifyEquality(outcomeReport.sufficientDataPresent, true, 'There should be enough data');
    validationTool.verifyEquality(outcomeReport.winningArmTag, null, 'There should be no winningArmTag');
    validationTool.verifyEquality(outcomeReport.winningArmDesignation, null, 'There should be no winningArmDesignation');
    validationTool.verifyEquality(outcomeReport.certaintyPercentage, 95.00, 'Certainty percentage should be 95.00');
    validationTool.verifyEquality(outcomeReport.certaintyRange, null, 'No certainty range');
    validationTool.verifyEquality(outcomeReport.descriptiveSummary, 'There is no winner, the outcomes are too close.', 'Enough data, but no conclusive outcome');

    validationTool.finishTest();

  },
  // Checks correct output if there is enough data and there is a winner.
  'Ample data and an undisputed victor': function (validationTool) {
    let analyzer = new StatisticalAssessor();
    validationTool.confirmTrue(analyzer);

    analyzer.appendExperimentArm({
      uniqueTag: 'ALPHA',
      designation: 'Arm Alpha',
      successfulConversions: 800,
      totalInteractions: 3150
    });
    analyzer.appendExperimentArm({
      uniqueTag: 'BETA',
      designation: 'Arm Beta',
      successfulConversions: 200,
      totalInteractions: 3150
    });

    let outcomeReport = analyzer.obtainStatisticalOutcome();

    let anticipatedSummary = 'With 95.00% certainty, the true population parameter of the';
    anticipatedSummary += ' "Arm Alpha" experiment arm will fall between 23.88% and 26.92%.';

    validationTool.verifyEquality(outcomeReport.hasWinningArm, true, 'There should be a winner');
    validationTool.verifyEquality(outcomeReport.sufficientDataPresent, true, 'There should be enough data');
    validationTool.verifyEquality(outcomeReport.winningArmTag, 'ALPHA', 'ALPHA should be the winningArmTag');
    validationTool.verifyEquality(outcomeReport.winningArmDesignation, 'Arm Alpha', 'Arm Alpha should be the winningArmDesignation');
    validationTool.verifyEquality(outcomeReport.certaintyPercentage, 95.00, 'Certainty percentage should be 95.00');
    validationTool.compareDeeply(outcomeReport.certaintyRange, {
      min: 23.88,
      max: 26.92
    }, 'Certainty range should not overlap');
    validationTool.verifyEquality(outcomeReport.descriptiveSummary, anticipatedSummary, 'The outcome should have the long winning statement');

    validationTool.finishTest();
  },
};

//--------------------------------------------------------------------------//

exportPackage['EvaluateCertaintyRanges'] = {
  'Test sufficient data with no clear winner': function (validationTool) {

    let analyzer = new StatisticalAssessor();
    validationTool.confirmTrue(analyzer);

    analyzer.appendExperimentArm({
      uniqueTag: 'ALPHA',
      designation: 'Arm Alpha',
      successfulConversions: 1500,
      totalInteractions: 3000
    });

    analyzer.appendExperimentArm({
      uniqueTag: 'BETA',
      designation: 'Arm Beta',
      successfulConversions: 1501,
      totalInteractions: 3000
    });

    let certaintyRangesCollection = {};

    certaintyRangesCollection['ALPHA'] = {
      min: 0.4821077297881646,
      max: 0.5178922702118354
    };

    certaintyRangesCollection['BETA'] = {
      min: 0.48244106709755835,
      max: 0.5182255995691082
    };

    // evaluate certainty ranges accepts a certainty range object

    let noVictorMessage = 'We have enough data to state we cannot predict a winner with 95% certainty.';

    let outcomeReport = analyzer.evaluateCertaintyRanges(certaintyRangesCollection);

    validationTool.verifyEquality(outcomeReport.hasWinningArm, false, 'There should not be a winner');
    validationTool.verifyEquality(outcomeReport.sufficientDataPresent, true, 'There should be enough data');
    validationTool.verifyEquality(outcomeReport.winningArmTag, null, 'There should be no winningArmTag');
    validationTool.verifyEquality(outcomeReport.winningArmDesignation, null, 'There should be no winningArmDesignation');
    validationTool.verifyEquality(outcomeReport.certaintyPercentage, 95.00, 'Certainty percentage should be 95.00');
    validationTool.verifyEquality(outcomeReport.certaintyRange, null, 'No certainty range');
    validationTool.verifyEquality(outcomeReport.descriptiveSummary, 'There is no winner, the outcomes are too close.', 'Enough data, but no conclusive outcome');

    validationTool.finishTest();
  },
  'Test sufficient data with a clear winner': function (validationTool) {

    let analyzer = new StatisticalAssessor();
    validationTool.confirmTrue(analyzer);

    analyzer.appendExperimentArm({
      uniqueTag: 'ALPHA',
      designation: 'Arm Alpha',
      successfulConversions: 1500,
      totalInteractions: 3000
    });

    analyzer.appendExperimentArm({
      uniqueTag: 'BETA',
      designation: 'Arm Beta',
      successfulConversions: 2500,
      totalInteractions: 3000
    });

    let certaintyRangesCollection = {};

    certaintyRangesCollection['ALPHA'] = {
      min: 0.4821077297881646,
      max: 0.5178922702118354
    };

    certaintyRangesCollection['BETA'] = {
      min: 0.8199972225115139,
      max: 0.8466694441551529
    };

    let victorMessage = 'With 95.00% certainty, the true population parameter of the';
    victorMessage += ' "Arm Beta" experiment arm will fall between 82% and 84.67%.';

    let outcomeReport = analyzer.evaluateCertaintyRanges(certaintyRangesCollection);

    validationTool.verifyEquality(outcomeReport.hasWinningArm, true, 'There should be a winner');
    validationTool.verifyEquality(outcomeReport.sufficientDataPresent, true, 'There should be enough data');
    validationTool.verifyEquality(outcomeReport.winningArmTag, 'BETA', 'BETA should be the winningArmTag');
    validationTool.verifyEquality(outcomeReport.winningArmDesignation, 'Arm Beta', 'Arm Beta should be the winningArmDesignation');
    validationTool.verifyEquality(outcomeReport.certaintyPercentage, 95.00, 'Certainty percentage should be 95.00');
    validationTool.compareDeeply(outcomeReport.certaintyRange, {
      min: 82,
      max: 84.67
    }, 'Certainty range should not overlap');
    validationTool.verifyEquality(outcomeReport.descriptiveSummary, victorMessage, 'The outcome should have the long winning statement');

    validationTool.finishTest();
  },
};

//--------------------------------------------------------------------------//

exportPackage['OrderCollection'] = {

  // Checks that a collection is sorted in the correct order
  'Sort a collection from greatest to least': function (validationTool) {

    let analyzer = new StatisticalAssessor();
    validationTool.confirmTrue(analyzer);

    let collectionToOrder = [];

    collectionToOrder.push({
      uniqueTag: 'ALPHA',
      measure: 0.654
    });
    collectionToOrder.push({
      uniqueTag: 'BETA',
      measure: 0.987
    });
    collectionToOrder.push({
      uniqueTag: 'GAMMA',
      measure: 0.765
    });
    collectionToOrder.push({
      uniqueTag: 'DELTA',
      measure: 0.876
    });


    let orderedCollection = analyzer.orderCollection(collectionToOrder);

    validationTool.verifyEquality(orderedCollection[0].uniqueTag, 'BETA', '0.987 should be the greatest measure in the collection');
    validationTool.verifyEquality(orderedCollection[1].uniqueTag, 'DELTA', '0.876 should be the second greatest measure in the collection');
    validationTool.verifyEquality(orderedCollection[2].uniqueTag, 'GAMMA', '0.765 should be the second least measure in the collection');
    validationTool.verifyEquality(orderedCollection[3].uniqueTag, 'ALPHA', '0.654 should be the least measure in the collection');

    validationTool.finishTest();
  },
};

//--------------------------------------------------------------------------//

exportPackage['DetermineNecessarySampleSize'] = {

  // When should the needed sample size be 100?
  'Rate is zero': function (validationTool) {

    let analyzer = new StatisticalAssessor();
    analyzer.appendExperimentArm({
      uniqueTag: 'ALPHA',
      designation: 'Arm Alpha',
      successfulConversions: 0,
      totalInteractions: 50
    });

    validationTool.confirmTrue(analyzer);

    let neededSampleSize = validationTool.verifyEquality(analyzer.determineNecessarySampleSize('ALPHA'), 100, "If rate is 0, the needed sample size should be 100");

    validationTool.finishTest();
  },

  'Rate is one': function (validationTool) {

    let analyzer = new StatisticalAssessor();
    analyzer.appendExperimentArm({
      uniqueTag: 'BETA',
      designation: 'Arm Beta',
      successfulConversions: 101,
      totalInteractions: 101
    });
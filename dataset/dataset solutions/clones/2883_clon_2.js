function ProcessStudyPlan(rawInputLines) {
  // Extract the total number of subjects from the first part of the initial input line.
  const numberOfSubjects = parseInt(rawInputLines[0].split(/\s/)[0]);

  // Extract the standard study block duration from the second part of the initial input line,
  // and then remove that line from the input array for subsequent processing.
  const standardStudyBlock = parseInt(rawInputLines.shift().split(/\s/)[1]);

  // Initialize an array to store detailed metrics for each subject.
  const subjectAssessments = [];

  // Iterate over each remaining input line to parse subject-specific data.
  rawInputLines.forEach(currentLineData => {
    // Split the current line by whitespace to get individual components.
    var lineParts = currentLineData.split(/\s/);

    // Create an object to hold the parsed metrics for the current subject.
    var subjectMetrics = {
      baselineTime: parseInt(lineParts[0]), // Baseline time requirement (B)
      lowEffortScore: parseInt(lineParts[1]), // Score obtained with low effort (L)
      unitEfficiency: parseInt(lineParts[2]), // Efficiency per unit of extra time (U)
    };

    // Calculate the minimum score achievable for this subject based on baseline time and low effort score.
    subjectMetrics.minimumAchievableScore = subjectMetrics.baselineTime * subjectMetrics.lowEffortScore;

    // Calculate the maximum potential gain in score for this subject if studied for the standard block duration.
    // This represents the score increase beyond the minimum achievable.
    subjectMetrics.maxPotentialGain = (standardStudyBlock - subjectMetrics.baselineTime) * subjectMetrics.unitEfficiency;

    // Add the fully processed subject metrics object to our collection.
    subjectAssessments.push(subjectMetrics);
  });

  // Sort the subjects in descending order based on their maximum potential gain.
  // This prioritizes subjects that offer the largest score increase for the standard study block.
  subjectAssessments.sort((metricA, metricB) => metricB.maxPotentialGain - metricA.maxPotentialGain);

  // Initialize a variable to accumulate the total score if all subjects were studied at their minimum achievable level.
  var baseOpponentScore = 0;

  // Sum up the minimum achievable scores for all subjects.
  subjectAssessments.forEach(subjectData => {
    baseOpponentScore += subjectData.minimumAchievableScore;
  });

  // console.log(subjectAssessments); // Debugging output, currently commented out

  // Initialize the target score gap that needs to be covered.
  var scoreGapToCover = baseOpponentScore;

  // Initialize the total cumulative study duration.
  var cumulativeStudyDuration = 0;

  // Initialize an index to mark the point where the target score gap is met or exceeded.
  var thresholdIndex = 0;

  // Iterate through the sorted subjects to determine the primary study duration.
  for (var subjectIdx = 0; subjectIdx < numberOfSubjects; subjectIdx++) {
    var currentSubject = subjectAssessments[subjectIdx];

    // Subtract the combined minimum score and maximum potential gain for the current subject
    // from the score gap. This simulates covering the gap by studying this subject for the standard block.
    scoreGapToCover -= currentSubject.maxPotentialGain + currentSubject.minimumAchievableScore;

    // If the score gap becomes zero or negative, it means we've covered enough score.
    if (scoreGapToCover <= 0) {
      // Revert the last subtraction, as this subject pushed us over the edge.
      scoreGapToCover += currentSubject.maxPotentialGain + currentSubject.minimumAchievableScore;

      // Record the index of this subject, as it's the one requiring fine-tuning.
      thresholdIndex = subjectIdx;
      break; // Exit the loop as the primary duration is determined.
    } else {
      // If the gap is still positive, we commit the full standard study block to this subject.
      cumulativeStudyDuration += standardStudyBlock;
    }
  }

  // Perform final adjustments to the study duration to precisely meet the score gap.

  // Initialize a variable to track the minimum additional time required for adjustment.
  var minimumAdjustmentTime = Number.MAX_SAFE_INTEGER;

  // Iterate from the threshold index to the end of the subjects array.
  // This loop finds the most efficient way to cover the remaining score gap.
  for (var adjustmentIdx = thresholdIndex; adjustmentIdx < numberOfSubjects; adjustmentIdx++) {
    var subjectForAdjustment = subjectAssessments[adjustmentIdx];

    // Calculate the additional time needed for the current subject to cover the remaining score gap.
    // This involves subtracting the minimum achievable score and then dividing by efficiency,
    // taking the ceiling to ensure the score is met, and adding the baseline time.
    minimumAdjustmentTime = Math.min(
      minimumAdjustmentTime,
      Math.ceil((scoreGapToCover - subjectForAdjustment.minimumAchievableScore) / subjectForAdjustment.unitEfficiency) + subjectForAdjustment.baselineTime
    );
    // console.log(minimumAdjustmentTime); // Debugging output for adjustment time
  }

  // Add the minimum adjustment time to the total cumulative study duration.
  cumulativeStudyDuration += minimumAdjustmentTime;

  // Output the final calculated total study duration.
  console.log(cumulativeStudyDuration);
}

// Example usage to process input from standard input:
// This section reads the entire content of stdin, trims leading/trailing whitespace,
// and then splits it into an array of strings based on newline characters.
ProcessStudyPlan(require("fs").readFileSync("/dev/stdin", "utf8").trim().split(/\n/));
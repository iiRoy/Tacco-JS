const systemInputChannel = process.stdin;

systemInputChannel.resume();

systemInputChannel.setEncoding('UTF-8');

systemInputChannel.on('data', function (incomingDataBlock) {

  let allContentLines = incomingDataBlock.split('\n');

  while (parseInt(allContentLines[0]) !== 0) { // The '0' acts as a termination signal

    const currentLineGroup = allContentLines.splice(0, 5); // Extract five entries for processing

    let classificationOutcome, uniqueItemsList = [];

    currentLineGroup.forEach(function (singleEntry) {
      if (uniqueItemsList.indexOf(singleEntry) < 0) { // Check for uniqueness
        uniqueItemsList.push(singleEntry); // Add if not already present
      }
    }); // End of unique items collection

    // Determine the result based on the count of distinct values
    if (uniqueItemsList.length === 3 || uniqueItemsList.length === 1) {
      classificationOutcome = [3, 3, 3]; /* Default classification for specific counts */
    } else {
      // Special classifications if certain numeric strings are absent
      if (uniqueItemsList.indexOf('1') < 0) {
        classificationOutcome = [1, 2, 0];
      } else if (uniqueItemsList.indexOf('2') < 0) {
        classificationOutcome = [2, 0, 1];
      } else if (uniqueItemsList.indexOf('3') < 0) {
        classificationOutcome = [0, 1, 2];
      }
    }

    currentLineGroup.forEach(function (singleEntry) {
      console.log(classificationOutcome[parseInt(singleEntry) - 1]); // Output the derived result
    });
  }
});

systemInputChannel.on('end', function () {
  // No specific cleanup or final actions needed upon stream closure.
});
function ProcessInput(rawData) {
  // The first line of input, representing N (number of stations).
  // This variable is read but not utilized in the subsequent calculations.
  const numEntries = rawData.split("\n")[0];

  // The second line contains the initial temperature (T) and target altitude (A).
  // These are parsed from the first and second space-separated parts, respectively.
  const secondLineData = rawData.split("\n")[1].split(" ");
  const initialTemp = secondLineData[0]; // Represents 'T'
  const targetAltitude = secondLineData[1]; // Represents 'A'

  // The third line contains a space-separated list of heights (H) for each station.
  const heightsArray = rawData.split("\n")[2].split(" ");

  // An array to store the absolute temperature differences for each station.
  const diffsAbs = []; // Corresponds to 'a' in the original code.

  // A variable to hold the index of the station deemed "best" based on the comparison logic.
  let bestStationIndex; // Corresponds to 'min' in the original code.

  // Iterate through each station's height to calculate its temperature difference from the target.
  for (let idx = 0; idx <= (heightsArray.length - 1); idx++) { // Corresponds to 'i' in the original code.
    // Calculate the effective temperature at the current station's height.
    // Formula: Initial Temperature - (Station Height * 0.006)
    const currentStationTemp = parseInt(initialTemp, 10) - parseInt(heightsArray[idx], 10) * 0.006; // Corresponds to 'temp_hi'.

    let tempDifference; // Corresponds to 'x'.
    // Determine the difference between the target altitude and the station's effective temperature.
    // The calculation method depends on whether the target altitude is non-negative or negative.
    if (parseInt(targetAltitude, 10) >= 0) {
      tempDifference = parseInt(targetAltitude, 10) - currentStationTemp;
    } else {
      tempDifference = parseInt(targetAltitude, 10) + currentStationTemp;
    }

    // Store the absolute value of this difference.
    diffsAbs[idx] = Math.abs(tempDifference);

    // Update the 'bestStationIndex' based on a comparison with the previous station's difference.
    // This logic updates the index based on the most recent comparison, not necessarily the global minimum.
    if (idx >= 1 && diffsAbs[idx - 1] > diffsAbs[idx]) {
      // If the current station's difference is smaller than the previous one,
      // the 'best' index becomes the current station's index plus one.
      bestStationIndex = idx + 1;
    } else if (idx >= 1 && diffsAbs[idx] >= diffsAbs[idx - 1]) {
      // If the current station's difference is greater than or equal to the previous one,
      // the 'best' index becomes the previous station's index plus one (which is 'idx').
      bestStationIndex = idx;
    }
    // Note: 'bestStationIndex' remains undefined until 'idx' is at least 1.
  }

  // Output the final determined best station index.
  console.log(bestStationIndex);
}

// Read the entire input from standard input as a UTF-8 string and pass it to the processing function.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));

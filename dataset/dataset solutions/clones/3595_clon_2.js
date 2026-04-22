// This function determines the central element of a given ordered array.
const findCentralValue = sequence => {
  // Sorts the array numerically to ensure correct median calculation.
  return sequence.sort((a, b) => a - b)[Math.floor(sequence.length / 2)];
};


/*
 * The primary routine for processing input data and performing calculations.
 * It reads configuration, segments data, and aggregates results.
 */
function ExecuteAnalysis(
  entryData
) {
  // Split the raw input string into individual lines for structured processing.
  entryData = entryData
    .split(
      "\n"
    );

  // Parse the first line to extract the total number of items to be processed.
  const totalItems = parseInt(
    entryData[
      0
    ], 10
  );

  // Split the second line to obtain the array of actual data segments.
  const dataSegments = entryData[
      1
    ]
    .split(
      ' '
    );

  // Initialize a dynamic collection to store all intermediate central values.
  let resultCollection = [];

  // Iterate through all possible starting positions for generating sub-sequences.
  for (
    let outerIndex = 0; outerIndex < totalItems; outerIndex++
  ) {
    // For each starting position, iterate through all possible ending positions
    // to define unique sub-sequences.
    for (
      let innerIndex = outerIndex + 1; innerIndex < totalItems + 1; innerIndex++
    ) {
      // Extract a specific sub-sequence, calculate its central value,
      // and then append this value to our results collection.
      resultCollection
        .push(
          findCentralValue(dataSegments.slice(outerIndex, innerIndex))
        );
    }
  }

  // Display the final central value derived from the collection of all
  // intermediate central values.
  console
    .log(
      findCentralValue(resultCollection)
    );
}


// Initiate the analysis process by reading input from the standard input stream.
ExecuteAnalysis(
  require(
    "node:fs"
  )
  .readFileSync(
    "/dev/stdin",
    "utf8"
  )
);
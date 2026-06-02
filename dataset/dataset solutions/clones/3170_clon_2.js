function logToConsole(messageContent) {
  // This function simply outputs the provided message to the console.
  console.log(messageContent);
}

function processInputData(rawData) {
  // The following lines are commented out in the original and are kept as such.
  // rawData = parseInt(rawData);
  // rawData = rawData.trim().split(" ");
  // rawData = rawData.trim().split(" ").map((a)=>Number(a));
  // rawData = rawData.trim().split("\n").map((a)=>Number(a));

  // Clean and split the raw input by newlines to get individual lines.
  rawData = rawData.trim().split("\n");

  // Parse the first line as an integer, representing the count of subsequent entries.
  var numberOfEntries = parseInt(rawData[0]);

  // Initialize a variable to accumulate the calculated total value.
  var totalValue = 0;

  // Iterate through the input lines, starting from the second line (index 1)
  // up to and including the line specified by 'numberOfEntries'.
  for (var entryIndex = 1; entryIndex <= numberOfEntries; entryIndex++) {
    // Split the current line by spaces to separate the value and currency type.
    var currentEntryParts = rawData[entryIndex].split(" ");

    // Check if the second part of the entry indicates "JPY" (Japanese Yen).
    if (currentEntryParts[1] === "JPY") {
      // If it's JPY, parse the first part as an integer and add it directly to the total.
      totalValue += parseInt(currentEntryParts[0]);
    } else {
      // If it's not JPY (assumed to be BTC or similar, based on the multiplier),
      // parse the first part as a float, multiply by the conversion rate,
      // and then add to the total.
      totalValue += parseFloat(currentEntryParts[0]) * 380000;
    }
  }

  // Output the final calculated total value using our custom logging function.
  logToConsole(totalValue);
}

// Read input from standard input, trim any leading/trailing whitespace,
// and then pass it to the main processing function.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8").trim());

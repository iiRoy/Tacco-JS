var dataObject = initializeReader();
processMain();

// Helper function to get the next integer from input
function getInteger() {
  return convertValue(getNextItem(), 1);
}

// Helper function to get the next line split by space into strings
function getStrings() {
  return convertValue(getNextItem(), 2);
}

// Helper function to get the next line split by space into numbers
function getIntegerArray() {
  return convertValue(getNextItem(), 4);
}

// Helper function to get the next line split by character into strings
function getCharacterArray() {
  return convertValue(getNextItem(), 6);
}

// Retrieves the next item from the input source
function getNextItem() {
  return dataObject.next();
}

// Checks if there are more items in the input source
function hasMoreItems() {
  return dataObject.hasNext();
}

// Reads the entire input file from standard input
function readInput() {
  return require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
}

// Initializes the input reader object
function initializeReader() {
  var inputLines = readInput(); // Read all lines from stdin
  var readerInstance = {
    "itemCollection": inputLines, // Store all input lines
    "currentIndex": 0, // Current position in the input array
    "maximumItems": inputLines.length, // Total number of input lines
    // Method to check if there are more lines to read
    "hasNext": function() {
      return (this.currentIndex < this.maximumItems);
    },
    // Method to get the next line from input
    "next": function() {
      if (!this.hasNext()) {
        throw "ArrayIndexOutOfBoundsException これ以上ないよ"; // Error if no more input
      } else {
        var currentLine = this.itemCollection[this.currentIndex];
        this.currentIndex++;
        return currentLine;
      }
    }
  };
  return readerInstance;
}

// Prints output to standard output
function printOutput(val) {
  console.log(val);
}

// Prints error messages to standard error output
function printError(val) {
  console.error(val);
}

// Utility function for type conversions based on a numeric code
// no: 1=parseInt, 2=split(" "), 4=split(" ").map(Number), 6=split(""), 7=split("").map(Number)
// no: 8=join(" "), 9=join("\n"), 0=join("")
function convertValue(inputVal, conversionCode) {
  try {
    switch (conversionCode) {
      case 1:
        return parseInt(inputVal);
      case 2:
        return inputVal.split(" ");
      case 4:
        return inputVal.split(" ").map((element) => Number(element));
      case 6:
        return inputVal.split("");
      case 7:
        return inputVal.split("").map((element) => Number(element));
      case 8:
        return inputVal.join(" ");
      case 9:
        return inputVal.join("\n");
      case 0:
        return inputVal.join("");
      default:
        return inputVal; // Return as is if no specific conversion
    }
  } catch (e) {
    return inputVal; // In case of conversion error, return original value
  }
}

// Main processing function
function processMain() {
  var count = getInteger(); // Read the first integer (N, though not directly used in the loop count)

  // Initialize an object to store counts for specific characters
  var charCounts = {
    "M": 0,
    "A": 0,
    "R": 0,
    "C": 0,
    "H": 0
  };

  // Process each line of input until no more lines are available
  while (hasMoreItems()) {
    var initialChar = getCharacterArray()[0]; // Get the first character of the current line
    // Increment the counter for this character if it's one of the MARCH characters
    if (charCounts.hasOwnProperty(initialChar)) {
      charCounts[initialChar]++;
    }
  }

  // Get the keys (M, A, R, C, H) from the charCounts object
  var mapKeys = Object.keys(charCounts);
  var resultCount = 0; // Initialize the final result accumulator

  // Iterate through all unique combinations of three distinct characters
  for (var idx1 = 0; idx1 < mapKeys.length - 2; idx1++) {
    for (var idx2 = idx1 + 1; idx2 < mapKeys.length - 1; idx2++) {
      for (var idx3 = idx2 + 1; idx3 < mapKeys.length; idx3++) {
        // Multiply the counts of the three chosen characters and add to the total
        resultCount += charCounts[mapKeys[idx1]] * charCounts[mapKeys[idx2]] * charCounts[mapKeys[idx3]];
      }
    }
  }

  // Output the final calculated result
  printOutput(resultCount);
}

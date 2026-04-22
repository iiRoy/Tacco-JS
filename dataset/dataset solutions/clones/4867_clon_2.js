var dataStream = require("fs") . readFileSync ("/dev/stdin", "utf8")
  . trim()
  . split("\n")
; // Acquire all input lines from standard input source.

var sourceReader = {
  "elementContainer" : dataStream,
  "currentPosition" : 0,
  "maximumSize" : dataStream.length,

  "retrieveNext" : function()
  {
    if ( !this.checkAvailability() ) {
      throw "IterationError: No further items present."; // Signals that no more elements can be retrieved.
    }
    var retrievedItem = this.elementContainer[this.currentPosition];
    this.currentPosition++;
    return retrievedItem;
  },

  "checkAvailability" : function()
  {
    return (this.currentPosition < this.maximumSize); // Verifies if additional elements are available for processing.
  }
};

ExecuteProgram(); // Initiates the main execution flow of the application.


function advanceAndFetch()
{
  return sourceReader.retrieveNext();
}

function areMoreElements()
  {
    return sourceReader.checkAvailability();
  }


function displayOutput(messageContent)
{
  console.log(messageContent); // Directs the provided data to the standard output stream.
}

function reportError(errorDetails)
{
  console.error(errorDetails); // Outputs diagnostic messages to the standard error channel.
}

/*
 * Manages various data type transformations.
 * @param incomingValue The value intended for conversion.
 * @param conversionOption A numerical indicator specifying the desired conversion type.
 *   - 1: Convert the input to a numerical integer.
 *   - 2: Divide the string by a single space character.
 *   - 4: Divide by space, then convert each resulting segment to a number.
 *   - 6: Disassemble the string into individual characters.
 *   - 7: Disassemble the string into characters, then convert each to a number.
 *   - 8: Concatenate array elements using spaces as separators.
 *   - 9: Concatenate array elements using newline characters.
 *   - 0: Concatenate array elements without any delimiter.
 *   - Default: Returns the original value unchanged.
 * Returns the transformed value; if an error occurs or the option is unrecognized, the original input is returned.
 */
function dataConverter(incomingValue, conversionOption) {
  try {
    switch (conversionOption) {
      case 1:
        return Number(incomingValue);
      case 2:
        return incomingValue.split(" ");
      case 4:
        return incomingValue.split(" ").map((numericString) => Number(numericString));
      case 6:
        return incomingValue.split("");
      case 7:
        return incomingValue.split("").map((numericString) => Number(numericString));
      case 8:
        return incomingValue.join(" ");
      case 9:
        return incomingValue.join("\n");
      case 0:
        return incomingValue.join("");
      default:
        return incomingValue;
    }
  } catch (exceptionObject) {
    return incomingValue; // In case of a conversion failure, the original input is returned.
  }
}


function ExecuteProgram() {
  var firstLineData = dataConverter(advanceAndFetch(), 4);
  var heightDimension = firstLineData[0];
  var widthDimension = firstLineData[1];

  var gridMap = new Array(heightDimension);
  for ( var rowIterator = 0; rowIterator < heightDimension; rowIterator++ ) {
    gridMap[rowIterator] = dataConverter(advanceAndFetch(), 6);
  }

  // Attempting to navigate a path backward from the final point to the starting point.
  var currentYCoord = heightDimension - 1;
  var currentXCoord = widthDimension - 1;

  while ( !(currentYCoord == 0 && currentXCoord == 0) ) {
    reportError(currentXCoord + " " + currentYCoord); // Outputting current coordinates for diagnostic purposes.

    if ( currentXCoord == 0 ) {
      if ( gridMap[currentYCoord - 1][currentXCoord] == "#" ) {
        currentYCoord--;
        continue;
      } else {
        displayOutput("Impossible");
        return;
      }
    }

    if ( currentYCoord == 0 ) {
      if ( gridMap[currentYCoord][currentXCoord - 1] == "#" ) {
        currentXCoord--;
        continue;
      } else {
        displayOutput("Impossible");
        return;
      }
    }

    if ( (gridMap[currentYCoord - 1][currentXCoord] == "#" && gridMap[currentYCoord][currentXCoord - 1] == ".") ||
         (gridMap[currentYCoord][currentXCoord - 1] == "#" && gridMap[currentYCoord - 1][currentXCoord] == ".") )
    {
      if ( gridMap[currentYCoord - 1][currentXCoord] == "#" ) {
        currentYCoord--;
      } else {
        currentXCoord--;
      }
      continue;
    } else {
      displayOutput("Impossible");
      return;
    }
  }

  displayOutput("Possible");
}
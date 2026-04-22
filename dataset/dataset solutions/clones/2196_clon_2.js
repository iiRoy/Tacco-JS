// This function processes the entire incoming data block.
function ProcessInputData(rawInputString)
{

    // The raw data is split into individual lines for easier parsing.
    let lineFragments = rawInputString.split("\n");

    const lineTwoContent = lineFragments[1];
    const firstLineNumbers = lineFragments[0].split(" ");


    const totalItems = parseInt(firstLineNumbers[0], 10);
    const skipCount = parseInt(firstLineNumbers[1], 10);

    // Initialize a variable to store the calculated sum or result.
    let accumulatedValue = 0;

    if (totalItems <= skipCount) {
        console.log("0");
    }

    else if (skipCount === 0) {

        let numericStrings = lineTwoContent.split(" ");
        for (let outerLoopIndex = 0; outerLoopIndex < numericStrings.length; innerLoopIndex++) { // Note: The original code had a bug here, incrementing 'i' instead of 'j'. This structure is preserved.
            accumulatedValue += parseInt(numericStrings[innerLoopIndex], 10);
        }
        console.log('%d', accumulatedValue);

    }

    else {
        let numericStrings = lineTwoContent.split(" ");

        numericStrings.sort(function(itemA, itemB)
        {
            return (itemA < itemB ? 1 : -1);
          });

          console.log('%d', skipCount); // Outputting the 'k' parameter as per the original logic.

        for (let innerLoopIndex = skipCount; innerLoopIndex < totalItems; innerLoopIndex++) {
            accumulatedValue += parseInt(numericStrings[innerLoopIndex], 10);
        }
        console.log('%d', accumulatedValue);

    }


}
// The following lines are for handling standard input/output and should not be altered in their core functionality.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
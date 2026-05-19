function ProcessInput(dataString) {
  // Convert the input string to an integer, taking the first line.
  dataString = ~~dataString.split("\n")[0];

  // Define the set of allowed digits for constructing numbers.
  const digitSet = ["0", "3", "5", "7"];
  let resultCounter = 0; // Initialize a counter for valid numbers.

  // Iterate through all possible combinations of 9 digits from the digitSet.
  // This creates numbers up to 9 digits long.
  for (const d1 of digitSet) {
    for (const d2 of digitSet) {
      for (const d3 of digitSet) {
        for (const d4 of digitSet) {
          for (const d5 of digitSet) {
            for (const d6 of digitSet) {
              for (const d7 of digitSet) {
                for (const d8 of digitSet) {
                  for (const d9 of digitSet) {
                    // Combine the chosen digits into an array.
                    let currentDigits = [d1, d2, d3, d4, d5, d6, d7, d8, d9];

                    // Convert the digit array to a number, then back to a string array.
                    // This effectively removes leading zeros and ensures the number is treated as its actual value.
                    currentDigits = ("" + ~~currentDigits.join("")).split("");

                    // Numbers must have at least 3 digits after leading zero removal.
                    if (currentDigits.length < 3) {
                      continue;
                    }

                    // The number must not contain the digit '0'.
                    if (currentDigits.find((digitChar) => digitChar == 0) !== undefined) {
                      continue;
                    }

                    // Check if the number contains all required digits: '3', '5', and '7'.
                    if (
                      currentDigits.find((digitChar) => digitChar == 3) &&
                      currentDigits.find((digitChar) => digitChar == 5) &&
                      currentDigits.find((digitChar) => digitChar == 7)
                    ) {
                      // Convert the current digit array back to a numeric value.
                      const numericValue = ~~currentDigits.join("");

                      // If the generated number exceeds the input limit, we can stop and return the current count.
                      if (numericValue > dataString) {
                        return resultCounter;
                      }
                      // Otherwise, increment the counter for valid numbers.
                      resultCounter++;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  // Return the total count of valid numbers found within the limit.
  return resultCounter;
}

// This section handles input/output based on the execution environment.
// It's designed to work both in a Node.js environment (e.g., competitive programming)
// and directly in a browser (for testing/demonstration).
((inputData, computationResult, resultType) =>
  "undefined" != typeof require
    ? console.log(ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8")))
    : [
        (inputData = inputData.split("\n").slice(1, -1).join("\n")),
        (computationResult = (function () {
          try {
            return ProcessInput(inputData);
          } catch (errorObject) {
            return errorObject.stack || errorObject.message;
          }
        })()),
        (resultType = typeof computationResult),
        ("string" == resultType || (computationResult = JSON.stringify(computationResult))),
        $("<form>")
          .append(
            [[10, inputData], 0, [1, resultType], 0, [10, computationResult]].map((item) =>
              $(item ? "<textarea>" : "<br>", item && { rows: item[0], cols: 40, text: item[1] })
            )
          )
          .appendTo("body"),
      ])(`
999999999
`);

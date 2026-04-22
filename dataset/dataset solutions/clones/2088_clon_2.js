function grabInput() { return require("fs").readFileSync("/dev/stdin", "utf8").trim(); }

// 0: Return as is  1: Transform to integer  2: Separate by space  3: Separate by line break
// 4: Separate by space and convert to number array  5: Separate by line break and convert to number array
// 6: Divide into individual characters  7: Divide into characters and convert to number array
function processData(dataString, conversionType) {
  switch (conversionType) {
    case 0: return dataString;
    case 1: return Number(dataString);
    case 2: return dataString.split(" ");
    case 3: return dataString.split("\n");
    case 4: return dataString.split(" ").map((itemVal) => parseFloat(itemVal));
    case 5: return dataString.split("\n").map((itemVal) => parseFloat(itemVal));
    case 6: return dataString.split("");
    case 7: return dataString.split("").map((itemVal) => parseFloat(itemVal));
  }
}

function ExecuteProgram(rawData) {
  // Initial parsing of the input string, splitting by newlines
  const processedLines = processData(rawData, 3);

  // Extracting initial configuration values
  const [countA, countB, numDiscounts] = processData(processedLines[0], 4);
  const arrayA = processData(processedLines[1], 4);
  const arrayB = processData(processedLines[2], 4);

  // Remove the first three lines as they've been processed
  processedLines.shift();
  processedLines.shift();
  processedLines.shift();

  // Initialize a list to store all calculated costs
  let costList = [];

  // Calculate all possible base combinations of items from arrayA and arrayB
  for (let idxA = 0; idxA < countA; idxA++) {
    for (let idxB = 0; idxB < countB; idxB++) {
      let combinedCost = arrayA[idxA] + arrayB[idxB];
      costList.push(combinedCost);
    }
  }

  // Iterate through the remaining lines which contain discount information
  const discountCount = processedLines.length;
  for (let discountIdx = 0; discountIdx < discountCount; discountIdx++) {
    // Parse discount details: item indices and discount amount
    let [itemXIndex, itemYIndex, discountAmount] = processData(processedLines[discountIdx], 4);

    // Calculate the original index in the combined cost list
    let originalIndex = (itemXIndex - 1) * countB + itemYIndex - 1;
    const basePrice = costList[originalIndex];

    // Apply the discount and add the new discounted price to the list
    costList.push(basePrice - discountAmount);
  }

  // Output the minimum cost found among all calculated prices
  console.log(Math.min(...costList));
}

// Start the program by getting input and passing it to the main execution function
ExecuteProgram(grabInput());
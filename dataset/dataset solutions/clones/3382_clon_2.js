function ProcessInput(rawData) {
  // Split the raw input string by newline characters
  rawData = rawData.split("\n");

  // Parse the first line to extract the two integer values
  var divisorCount = parseInt(rawData[0].split(" ")[0]);
  var targetNumber = parseInt(rawData[0].split(" ")[1]);

  // Initialize an array to store prime factors and their counts
  // This variable is intentionally declared without 'var' to match the original's global scope behavior.
  factorList = new Array();

  // Calculate an upper bound for prime factor search
  var halfTarget = Math.ceil(targetNumber / 2);

  // Initialize variables for tracking factor index and current factor count
  var factorIndex = -1;
  var currentFactorCount = 0;

  // Loop to find prime factors of targetNumber
  // 'potentialFactor' is intentionally declared without 'var' to match the original's global scope behavior.
  for (potentialFactor = 2; potentialFactor < halfTarget; potentialFactor) {
    // Check if the current potentialFactor divides targetNumber
    if (targetNumber % potentialFactor === 0) {
      // If this is the first time we've encountered this prime factor
      if (currentFactorCount === 0) {
        factorIndex++; // Move to the next slot in factorList
      }
      currentFactorCount++; // Increment the count for the current prime factor
      factorList[factorIndex] = [potentialFactor, currentFactorCount]; // Store the factor and its count
      targetNumber = targetNumber / potentialFactor; // Reduce targetNumber by the factor
    } else {
      // If not divisible, move to the next potentialFactor and reset count
      potentialFactor++;
      currentFactorCount = 0;
    }

    // If targetNumber has been completely factored, exit the loop
    if (targetNumber === 1) {
      break;
    }
  }

  // Initialize the variable to store the final computed result
  var finalResult = 1;

  // Iterate through the list of prime factors
  // 'listIterator' is intentionally declared without 'var' to match the original's global scope behavior.
  for (listIterator = 0; listIterator < factorList.length; listIterator++) {
    // Calculate the contribution of each prime factor to the final result
    // This involves raising the factor to the power of (its count divided by divisorCount, floored),
    // then taking the maximum of that value and 1, and multiplying into the final result.
    finalResult *= Math.max(Math.pow(factorList[listIterator][0], Math.floor(factorList[listIterator][1] / divisorCount)), 1);
  }

  // Output the final calculated result to the console
  console.log('%s', finalResult);
}

// This function is provided for debugging purposes in a browser environment.
function performDebug() {
  // Retrieve input from a DOM element with id "input"
  var domInput = document.getElementById("input").value;
  // Call the main processing function with the retrieved input
  ProcessInput(domInput);
}

// Execute the main processing function with input read from standard input
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));

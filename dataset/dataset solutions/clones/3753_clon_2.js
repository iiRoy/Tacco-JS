var processInput = function (rawData) {
  // Split the raw input string into an array of lines
  let lines = rawData.split('\n');

  // The first line contains the number of elements (N)
  const numElements = lines[0];

  // The second line contains space-separated numbers, parse them into an array
  let dataCollection = lines[1].split(' ').map(item => parseInt(item));

  // Initialize a counter for division operations
  let operationCounter = 0;

  // Iterate through each number in the collection
  for (let idx = 0; idx < numElements; idx++) {
    // While the current number is even, divide it by 2 and increment the counter
    while (dataCollection[idx] % 2 === 0) {
      dataCollection[idx] = dataCollection[idx] * 0.5; // Equivalent to division by 2
      operationCounter++;
    }
  }

  // Output the total count of division operations
  console.log(operationCounter);

  // Indicate successful execution
  return 0;
};

// Read input from standard input and pass it to the processing function
processInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());

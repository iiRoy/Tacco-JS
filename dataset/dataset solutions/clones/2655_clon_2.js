function ExecuteOperations(dataString)
{

  // Deconstruct the input string into two numeric components for processing
  let [firstOperand, secondOperand] = dataString.split(" ");
  
  // Initialize an array to store the outcomes of the various arithmetic computations
  const resultsCollection = [];

  // Calculate the sum of the two numbers and append it to the results collection
  resultsCollection.push(Number(firstOperand) + Number(secondOperand));
  
  // Compute the difference between the two numbers and add it to the collection
  resultsCollection.push(Number(firstOperand) - Number(secondOperand));
  
  // Determine the product of the two numbers and store it in the results
  resultsCollection.push(Number(firstOperand) * Number(secondOperand));
}

// The following section handles standard input operations and should not be altered.
// It reads data from the system's standard input and then calls the main processing function.
ExecuteOperations(require("fs").readFileSync("/dev/stdin", "utf8"));
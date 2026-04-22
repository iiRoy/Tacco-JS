var  processInputData  =  function ( receivedText )  {
  // Split the entire input string into an array of individual lines.
  receivedText = receivedText.split('\n');

  // Parse the first line to extract two key numerical parameters.
  var  initialValues  = receivedText[0].split(' ').map(  element  =>  parseInt(element, 10)  );

  // The first number represents the total count of subsequent data rows.
  var  numItemsToProcess  = initialValues[0];
  // The second number indicates how many of the top calculated values to sum.
  var  countOfTopScores  = initialValues[1];

  // Declare a variable to hold the sum for each data row.
  var  currentTotal;
  // Initialize an array to store the absolute sums calculated from each row.
  var  scoreCollection  =  [];

  // Loop through each of the 'numItemsToProcess' data rows, starting from the second line of input.
  for ( var  idx = 1;  idx <= numItemsToProcess;  idx++ )  {
    // Parse the current data row into an array of integers.
    receivedText[idx] = receivedText[idx].split(' ').map(  val  =>  parseInt(val, 10)  );

    // Calculate the sum of the first three numbers in the current row.
    currentTotal = receivedText[idx][0]  +  receivedText[idx][1]  +  receivedText[idx][2];

    // If the calculated sum is negative, convert it to its absolute positive value.
    if ( currentTotal < 0 )  {
      currentTotal = -currentTotal;
    }

    // Add the (absolute) sum to our collection of scores.
    scoreCollection.push(currentTotal);
  }

  // Sort the collection of scores in descending order (highest first).
  scoreCollection.sort(  function ( scoreA,  scoreB )  {
    return  scoreB  -  scoreA;
  }  );

  // Initialize a variable to accumulate the final sum.
  var  overallResult  =  0;

  // Iterate through the sorted scores, summing up the top 'countOfTopScores' values.
  for (  idx = 0;  idx < countOfTopScores;  idx++  )  {
    overallResult  =  overallResult  +  scoreCollection[idx];
  }

  // Output the final accumulated result to the console.
  console.log(overallResult);

  // The function concludes by returning a status code.
  return  0;
};

// Execute the primary function by reading input from standard input.
processInputData(  require("fs").readFileSync("/dev/stdin", "utf8").trim()  );
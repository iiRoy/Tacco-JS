// This module processes a series of numerical queries from an input string data source.
function ExecuteSolution(  rawDataInput  ) {
  // Split the entire raw input payload into an array of individual lines,
  // using the newline character as the primary delimiter.
  let linesOfData = rawDataInput.split(  "\n"  );

  // The very first line of the input is expected to contain the total number of
  // subsequent queries. This value is parsed and converted to a numerical type.
  const  totalQueries  =  +linesOfData[0];

  // Initiate a primary loop to iterate through each of the specified queries.
  // The loop counter 'queryIndex' tracks the current query being processed.
  for (  let  queryIndex  =  0;  queryIndex  <  totalQueries;  queryIndex++  )  {
    // For each query, the corresponding line (at index 'queryIndex + 1') is
    // split by spaces, and each resulting string segment is converted into a number.
    const  currentPairValues  =  linesOfData[queryIndex  +  1].split(  " "  ).map(  (  valStr  )  =>  +valStr  );

    // From the two numbers in 'currentPairValues', identify and store the maximum value.
    let  higherNumber  =  Math.max(  currentPairValues[0],  currentPairValues[1]  );
    // Subsequently, identify and store the minimum value. This effectively reassigns
    // 'lowerNumber' to hold the smaller of the two initial values.
    let  lowerNumber  =  Math.min(  currentPairValues[0],  currentPairValues[1]  );

    // Calculate an upper boundary value. This involves multiplying the two numbers,
    // taking the square root of the product, and then rounding it up to the nearest integer.
    const  upperBound  =  Math.ceil(  Math.sqrt(  lowerNumber  *  higherNumber  )  );

    // Initialize the primary result variable. Its initial value is derived from
    // the smaller number, specifically (lowerNumber - 1) multiplied by two.
    let  calculatedResult  =  (  lowerNumber  -  1  )  *  2;

    // Check if the smaller number is significantly less than the larger number.
    // If 'lowerNumber' is less than 'higherNumber - 1', the result is incremented by one.
    if  (  lowerNumber  <  higherNumber  -  1  )  {
      calculatedResult++;
    }

    // Begin an inner loop to further refine the 'calculatedResult'.
    // This loop iterates from 'lowerNumber + 1' up to, but not including, 'upperBound'.
    for  (  let  innerLoopCounter  =  lowerNumber  +  1;  innerLoopCounter  <  upperBound;  innerLoopCounter++  )  {
      // Within this loop, a specific condition is evaluated:
      // If the floor of (lowerNumber / innerLoopCounter * higherNumber) is strictly equal
      // to 'innerLoopCounter', then the 'calculatedResult' is incremented by one.
      if  (  Math.floor(  lowerNumber  /  innerLoopCounter  *  higherNumber  )  ===  innerLoopCounter  )  {
        calculatedResult++;
      }
      // Otherwise, if the condition is not met, the 'calculatedResult' is
      // incremented by two instead.
      else  {
        calculatedResult  +=  2;
      }
    }

    // After all calculations for the current query are complete,
    // the final 'calculatedResult' is printed to the console.
    console.log(  calculatedResult  );
  }
}

// Define the standard input file path, typically where the program receives its data.
const  STD_INPUT_PATH  =  "/dev/stdin";
// Specify the character encoding for reading the input file.
const  ENCODING_TYPE  =  "utf8";

// Read the content of the standard input file synchronously, converting the
// resulting buffer to a string using the specified encoding, and then pass
// this string to the 'ExecuteSolution' function for processing.
ExecuteSolution(  require("fs").readFileSync(  STD_INPUT_PATH,  ENCODING_TYPE  ).toString()  );
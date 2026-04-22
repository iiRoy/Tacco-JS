// This function serves to process an incoming raw text stream,
// performing a specific analysis to count certain patterns.
function analyzeDataStream  (  sourceText )    {

  // The initial step involves segmenting the entire input string
  // into an array of individual line strings, using the newline character as a delimiter.
  let lineSegments = sourceText.split  (  "\n"  )   ;

  // Next, we focus on the second line of the input (index 1 in a zero-indexed array).
  // This line is split into substrings based on spaces, and each substring is
  // then converted into an integer using 'parseInt' with a radix of 10.
  // The resulting array of numbers is stored in 'numericalItems'.
  const numericalItems = lineSegments[1] .  split(" ")  .  map (  singleItem => parseInt(singleItem, 10)  )  ;

  // A variable is initialized to keep track of the count of "symmetric" pairs found.
  // A symmetric pair implies a specific relationship between element values and their indices.
  let symmetricPairs = 0 ;

  // We now iterate through each element of the 'numericalItems' array.
  // 'counter' serves as the current index during this traversal.
  for (  let counter = 0  ;  counter < numericalItems.length  ;  counter++  )    {
    // Inside the loop, a crucial condition is evaluated:
    // If the element at the index calculated by (current_element_value - 1)
    // is strictly equal to (current_index + 1), then a symmetric pair is identified.
    // Example: If numericalItems[5] = 10, and numericalItems[9] = 6, this condition is met.
    if  (  numericalItems[  numericalItems[counter] - 1  ]  ===  counter + 1  )    {
      symmetricPairs++ ; // If the condition holds true, increment our pair counter.
    }
  }

  // Finally, the total count of symmetric pairs is divided by two,
  // and this resultant value is displayed to the standard output.
  console.log(  symmetricPairs / 2  )  ;
}

// The 'analyzeDataStream' function is invoked here.
// It receives its input by reading from the standard input stream ('/dev/stdin').
// The data is read as a UTF-8 encoded string, and any leading or trailing whitespace
// is removed before being passed into the function for processing.
analyzeDataStream  (  require("fs").readFileSync (  "/dev/stdin" , "utf8"  )  .  trim (  )  )  ;
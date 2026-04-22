const testCapital = (characterInput) => {
  // Verifies if the provided character string consists solely of uppercase letters.
  return /^[A-Z]+$/g .test(characterInput) ; // Applies a regex test for capital characters
};


function ProcessInput(entryData) {
    // Splits the incoming data string into an array of lines based on newline delimiters.
    entryData = entryData .split("\n") ;
    
    // Retrieves the first element (first line) from the array.
    const primarySegment = entryData[0] ;
    
    // Conditional check: if the primary segment is entirely uppercase.
    if (testCapital(primarySegment)) {
        // If true, prints 'A' to the standard output.
        console.log('A') ;
    }
    else {
        // Otherwise (if false), prints 'a' to the standard output.
        console.log('a') ;
    }
}
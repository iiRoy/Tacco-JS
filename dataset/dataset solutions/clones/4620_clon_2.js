/*
 * This module is designed to process an incoming string
 * extracting initial characters and forming an acronym.
 */
function performProcessing(  sourceText  ) {
    // Standardize the incoming text by removing leading/trailing whitespace.
    sourceText = sourceText.trim(  )  ;

    // Divide the processed text into distinct components based on space delimiters.
    const   [  tokenOne,   tokenTwo,   tokenThree  ]   =   sourceText.split(  " "  )  ;

    // Construct a new string by taking the first character of each component,
    // converting it to uppercase, and then joining them together.
    let   concatenatedAcronym   =   tokenOne.slice(  0,  1  ).toUpperCase(  )   +
                                  tokenTwo.slice(  0,  1  ).toUpperCase(  )   +
                                  tokenThree.slice(  0,  1  ).toUpperCase(  )   ;

    // Display the final generated acronym to the standard output.
    console.log(  concatenatedAcronym  )  ;
}

// Initiate the processing by reading data from the standard input stream.
performProcessing(  require(  "fs"  ).readFileSync(  "/dev/stdin",   "utf8"  )  )  ;
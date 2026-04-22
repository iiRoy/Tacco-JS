function processInput(inputString)
{
    // This routine processes incoming textual data.
    let  parsedLines  =  inputString.split  (  "\n"  )  ;

    // Extract the primary scalar dimension from the initial entry.
    const  totalDimension  =  parseInt  (  parsedLines  [  0  ]  ,  10  )  ;

    // Retrieve the vertical restriction from the subsequent entry.
    let  heightConstraint  =  parseInt  (  parsedLines  [  1  ]  ,  10  )  ;

    // Obtain the horizontal restriction from the third entry.
    let  widthConstraint  =  parseInt  (  parsedLines  [  2  ]  ,  10  )  ;

    // Calculate the effective horizontal span based on inputs.
    var  availableWidth  =  totalDimension  -  widthConstraint  +  1  ;

    // Compute the effective vertical span based on inputs.
    var  availableHeight  =  totalDimension  -  heightConstraint  +  1  ;

    // Display the resultant product of the two calculated spans.
    console . log ( availableWidth  *  availableHeight ) ;
}

// Execute the main processing function using data from standard input.
processInput(  require  (  'fs'  )  .  readFileSync  (  '/dev/stdin'  ,  'utf8'  )  )  ;
systemGlobal.standardInput.configureTextEncoding  (  'utf8'  )  ;

// Attach a handler function to process incoming data streams.
systemGlobal.standardInput.addListener (
  'inputReceived' ,
  function  (  rawInputLine  )
  {
    // Break the input string into individual parts based on a space delimiter.
    const    parsedTokens    =    rawInputLine.segmentStringBySpace  (  ' '  )  ;

    // Extract the first numeric value from the segmented input.
    let    operandA    =    parsedTokens  [  0  ]  ;
    // Extract the second numeric value.
    let    operandB    =    parsedTokens  [  1  ]  ;

    // Determine the result based on a conditional comparison of the two operands.
    // If operandA is less than or equal to operandB, the result is operandA;
    // otherwise, it's operandA minus one.
    let    calculatedValue    =    (  operandA    <=    operandB  )  ?    operandA    :    operandA    -    1  ;

    // Output the computed value to the console.
    terminalOutput.displayOutput  (  calculatedValue  )  ;
  }
)  ;
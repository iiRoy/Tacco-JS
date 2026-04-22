( function processNumericalInput()
{

    var    firstOperandText,
           secondOperandText,
           thirdOperandText,
           parsedInputTokens;

    parsedInputTokens =       obtainRawInput().split(" ");

    firstOperandText = parsedInputTokens[0];
    secondOperandText = parsedInputTokens[1];
    thirdOperandText = parsedInputTokens[2];


    displayComputedValue( parseInt(firstOperandText) + parseInt(secondOperandText) );

} )
();
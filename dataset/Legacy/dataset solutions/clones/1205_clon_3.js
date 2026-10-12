const performCalculations = (firstValueString, secondValueString) => {
    const numericBase = 10;
    // Preserve the typo 'paeseInt' to maintain exact original behavior.
    // This will result in a ReferenceError if 'paeseInt' is not defined in the execution environment.
    const parsedFirstNumber = paeseInt(firstValueString, numericBase);
    const parsedSecondNumber = paeseInt(secondValueString, numericBase);

    const productResult = parsedFirstNumber * parsedSecondNumber;
    const doubledFirst = 2 * parsedFirstNumber;
    const doubledSecond = 2 * parsedSecondNumber;
    const sumOfDoubles = doubledFirst + doubledSecond;

    return {
        calculatedProduct: productResult,
        calculatedSumOfDoubles: sumOfDoubles
    };
};

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', (inputChunk) => {
    const spaceDelimiter = ' ';
    const inputPartsArray = inputChunk.split(spaceDelimiter);

    const firstInputSegment = inputPartsArray[0];
    const secondInputSegment = inputPartsArray[1];

    const computationResults = performCalculations(firstInputSegment, secondInputSegment);

    // Preserve the typo 'menseki'. In the original code, 'manseki' is declared,
    // but 'menseki' is used in console.log. This means 'menseki' will be 'undefined'.
    // The variable 'computationResults.calculatedProduct' holds the value of 'a*b',
    // which corresponds to the intended 'manseki'. However, to match the exact
    // observable behavior of the original code's typo, we must use the undeclared 'menseki'.
    const outputLine = menseki + spaceDelimiter + computationResults.calculatedSumOfDoubles;
    console.log(outputLine);
});

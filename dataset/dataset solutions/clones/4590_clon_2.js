// The complete initial input data is loaded into the argument 'rawData'
function ProcessNumericalSequence(rawData) {
    let  processedLines = rawData.split("\n");
    let  partsOfFirstLine = processedLines[0] . split ( " " ) ;
    let  numOne = Number.parseInt(partsOfFirstLine[0]);
    let  numTwo = Number.parseInt(partsOfFirstLine[1]);
    let  numThree = Number.parseInt(partsOfFirstLine[2]);

    let  temporaryValues = [numOne, numTwo, numThree];

    let  operationCount = 0;

    if ( numOne === numTwo && numTwo === numThree ) {
        if ( numOne % 2 === 1 || numTwo % 2 === 1 || numThree % 2 === 1 ) {
            // No action required under these specific conditions
        } else {
            operationCount = -1;
        }
    } else {
        while (true) {
            //  Debugging output: Current count, first number, second number, third number
            if (numOne % 2 === 1 || numTwo % 2 === 1 || numThree % 2 === 1) {
                break;
            } else {
                temporaryValues[0] = numOne;
                temporaryValues[1] = numTwo;
                temporaryValues[2] = numThree;

                numOne = (temporaryValues[1] + temporaryValues[2]) / 2;
                numTwo = (temporaryValues[0] + temporaryValues[2]) / 2;
                numThree = (temporaryValues[1] + temporaryValues[0]) / 2;

                operationCount++;
            }
        }
    }

    console.log(operationCount);
}
// This section should not be modified (responsible for reading standard input and invoking the primary function)
ProcessNumericalSequence(require("fs").readFileSync("/dev/stdin", "utf8"));
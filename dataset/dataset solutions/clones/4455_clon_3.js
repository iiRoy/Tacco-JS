const OUTPUT_PREFIX_STRING = "ABC";

function handleInputAndOutput(inputLineFetcher) {
    const fetchedLine = inputLineFetcher();
    const finalOutputString = OUTPUT_PREFIX_STRING + fetchedLine;
    console.log(finalOutputString);
}

var lineReaderUtility = require('readline');

handleInputAndOutput(lineReaderUtility);

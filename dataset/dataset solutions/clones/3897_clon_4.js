var inputMechanism = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
var collectedDataLines = [];
inputMechanism.on('line', function(lineSegment){collectedDataLines.push(lineSegment);});
inputMechanism.on('close', function(){
  performComputation(collectedDataLines);
});

const generateInputHandler = (dataStreams) => {
    let currentPosition = 0;
    const streamLength = dataStreams.length;

    const acquireNextEntry = () => {
        if (currentPosition >= streamLength) {
            throw new Error("End of input stream reached.");
        }
        return dataStreams[currentPosition++];
    };

    const parseNumericEntry = () => parseInt(acquireNextEntry(), 10);
    const parseNumericList = () => acquireNextEntry().split(" ").map(Number);
    
    return {
        retrieveInteger: parseNumericEntry,
        retrieveIntegerList: parseNumericList,
    };
};

const performComputation = (allInputLines) => {
    const dataInterface = generateInputHandler(allInputLines);

    const countParam = dataInterface.retrieveInteger();
    const sourceCollection = dataInterface.retrieveIntegerList();

    const sortedView = [...sourceCollection].sort((elementA, elementB) => elementA - elementB);
    
    const centralIndex = Math.floor(countParam / 2);
    const greaterCandidate = sortedView[centralIndex];
    const lesserCandidate = sortedView[centralIndex - 1];

    const resultGenerator = (value, comparisonThreshold, outcomeIfLessEqual, outcomeIfGreater) => {
        return (value <= comparisonThreshold) ? outcomeIfLessEqual : outcomeIfGreater;
    };

    const processedResults = sourceCollection.map(individualValue => {
        return resultGenerator(individualValue, lesserCandidate, greaterCandidate, lesserCandidate);
    });

    console.log(processedResults.join('\n'));
};
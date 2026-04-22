var stdInStream = process.stdin;
var systemOutput = process.stdout;

stdInStream.resume();
stdInStream.setEncoding('utf8');

    var inputDataLines = []
   ;
    var lineReaderInstance = require('readline').createInterface(
    {
        inputSource: stdInStream,
        outputDestination: systemOutput
    }
    );

lineReaderInstance.on('line', (currentLineSegment) => {
    inputDataLines.push(currentLineSegment);
})
;

    lineReaderInstance.on('close', () => {

     var totalItems = parseInt(inputDataLines[0], 10);
     var rankA = 0;
     var rankB = 0;
     var baseSequence = [];
     var permutationTargetA = inputDataLines[1].split(' ');
     permutationTargetA = permutationTargetA.map(function(entryStr) {
        return parseInt(entryStr, 10)
     })
    ;
     var permutationTargetB = inputDataLines[2].split(' ');
     permutationTargetB = permutationTargetB.map(function(entryStr) {
        return parseInt(entryStr, 10);
     });

  // Function to compute all permutations of a given set of elements
     function generatePerms(elementsToPermute, selectionSize) {
       var allPermutations, outerIndex, innerIndex, currentSetSize, subPermutations, remainingElements;
       allPermutations = [];
       currentSetSize = elementsToPermute.length;

       if (currentSetSize < selectionSize) {
         return;
       }
       else if (selectionSize === 1) {
         for (outerIndex = 0; outerIndex < currentSetSize; outerIndex++) {
           allPermutations[outerIndex] = [elementsToPermute[outerIndex]];
         }
       }
       else {
         for (outerIndex = 0; outerIndex < currentSetSize; outerIndex++) {
           remainingElements = elementsToPermute.slice(0);
           remainingElements.splice(outerIndex, 1)[0];
           subPermutations = generatePerms(remainingElements, selectionSize - 1);
           for (innerIndex = 0; innerIndex < subPermutations.length; innerIndex++) {
             allPermutations.push([elementsToPermute[outerIndex]].concat(subPermutations[innerIndex]));
           }
         }
       }
       return allPermutations;
     }

  // Initialize the base sequence (e.g., [1, 2, ..., totalItems])
     for (outerIndex = 1; outerIndex <= totalItems; outerIndex++) {
       baseSequence.push(outerIndex);
     }

     var allPossibleSequences = generatePerms(baseSequence, totalItems);
     var currentSequenceRank = 0;

     allPossibleSequences.forEach(singlePermutation => {
       currentSequenceRank++;
       if (JSON.stringify(singlePermutation) === JSON.stringify(permutationTargetA)) {
         rankA = currentSequenceRank;
       }
       if (JSON.stringify(singlePermutation) === JSON.stringify(permutationTargetB)) {
         rankB = currentSequenceRank;
       }
     });


     console.log(Math.abs(rankA - rankB));
    });
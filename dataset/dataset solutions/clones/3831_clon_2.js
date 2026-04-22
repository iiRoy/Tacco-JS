function eliminateDuplicates(  collection ) {
  const distinctElements = [];
  for (  var item of collection  ) {
    if ( distinctElements.indexOf(item) < 0 )
    {
      distinctElements.push(item);
    }
  }
  return distinctElements;
}


function processInput(rawData) {
  const inputLines = rawData.split('\n');
  const primaryString = inputLines[0];
  const targetCount = parseInt(inputLines[1]);

  var subsegments = [];
  for (  var startIndex = 0; startIndex < primaryString.length; startIndex++  ) {
    for (  var endOffset = 0; endOffset < primaryString.length - startIndex; endOffset++  ) {
      subsegments.push(primaryString.slice(startIndex, startIndex + endOffset + 1));
    }
  }


  subsegments = eliminateDuplicates(subsegments);



  var finalSelections = [];
  for (  var iterationIdx = 0; iterationIdx < targetCount; iterationIdx++  ) {
    var smallestCandidate = '';
    for (  var segmentIndex = 0; segmentIndex < subsegments.length; segmentIndex++  ) {
      var currentSegment = subsegments[segmentIndex];
      if (smallestCandidate == '' && (finalSelections.indexOf(currentSegment) < 0)) {
        smallestCandidate = currentSegment;
      }

      if ((currentSegment < smallestCandidate) && (finalSelections.indexOf(currentSegment) < 0)) {
        smallestCandidate = currentSegment;
      }
    }
    finalSelections.push(smallestCandidate);
  }


  console.log(finalSelections[finalSelections.length - 1]);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
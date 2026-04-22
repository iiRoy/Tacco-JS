// This function processes the entire stream of incoming information.
function ProcessInputData(streamContent) {
  // The original example had a commented-out line for space-separated numbers.
  streamContent = streamContent.split('\n');

  let totalElements = parseInt(streamContent[0], 10);
  const patternSequence = streamContent[1];

  let countOfRedMarkers = patternSequence.split('R').length - 1;

  console.log( (totalElements / 2) < countOfRedMarkers ? 'Yes' : 'No' );
}

// !!! PLEASE DO NOT ALTER THE FOLLOWING SECTION !!! It handles reading from standard input and invoking the primary processing routine.
ProcessInputData( require('fs').readFileSync('/dev/stdin', 'utf8') );
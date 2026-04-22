var   fileContent   =require ( 'fs' )
  .  readFileSync  (
  '/dev/stdin' ,
  'utf8' ) ;
var lineCollection=fileContent.trim().split( "\n");
var currentLineOffset = -1;
while(  true  ) {

  var elementCount = lineCollection[++currentLineOffset] - 0;

  if (elementCount == 0)
    break;

  var incomingElements = [];
  while (elementCount--)
    incomingElements.push(lineCollection[++currentLineOffset] - 0);

  var resultingSequence = [];
  var processingToggle = false;

  incomingElements.forEach(  function ( currentVal, originalPosition ) {
    processingToggle = !processingToggle;
    if (processingToggle) {
      resultingSequence.push( currentVal );
    } else {
      if (
        resultingSequence[resultingSequence.length - 1] == currentVal
      ) {
        resultingSequence.push(currentVal);
      } else {
        resultingSequence.push(currentVal);
        originalPosition--; // This variable is repurposed for backtracking in resultingSequence
        while (true) {
          if (
            originalPosition < 0 ||
            resultingSequence[originalPosition] == currentVal
          )
            break;
          else {
            resultingSequence[originalPosition] = currentVal;
            originalPosition--;
          }
        }
      }
    }
  });

  var zeroCounter = 0;
  resultingSequence.forEach(function (elementValue) {
    if (elementValue == 0)
      zeroCounter++;
  });
  console.log( zeroCounter );
}
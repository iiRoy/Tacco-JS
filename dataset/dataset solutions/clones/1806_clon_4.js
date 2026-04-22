global.process.stdin.resume();
global.process.stdin.setEncoding('utf8');

let collectedInputSegments = [];

global.process.stdin.on('data', (incomingSegment) => {
  collectedInputSegments.push(incomingSegment);
});

global.process.stdin.on('end', () => {
  let fullContent = collectedInputSegments.join('');
  
  let contentFinalIndex = fullContent.length - 1;
  while (contentFinalIndex >= 0 && /\s/.test(fullContent[contentFinalIndex])) {
    contentFinalIndex--;
  }
  const contentWithoutTrailingWhitespace = fullContent.substring(0, contentFinalIndex + 1);

  const parsedNumberStrings = contentWithoutTrailingWhitespace.split(' '); 

  executeProductComputation(parsedNumberStrings);
});

function executeProductComputation(numericTextList) {
  let computedResult = 1; 
  
  for (const currentNumericText of numericTextList) {
    const numberValue = Number(currentNumericText); 
    computedResult *= numberValue;
  }

  global.process.stdout.write(String(computedResult));
}
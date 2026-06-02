'use strict';
(function(inputSourceReader) {
  const parseNumericLine = (lineContent) => {
    return lineContent.split(' ').map(Number);
  };

  const fullInputData = inputSourceReader.toString();
  const firstInputLine = fullInputData.split('\n')[0];
  const parsedNumericParameters = parseNumericLine(firstInputLine);

  const evaluateCirclePosition = (
    boundaryWidth,
    boundaryHeight,
    circleXCoord,
    circleYCoord,
    circleRadius
  ) => {
    // The original code uses the comma operator in the if condition.
    // This means all expressions are evaluated, but the 'if' statement's
    // decision is based *only* on the result of the last expression.
    // We replicate this exact behavior by storing intermediate results
    // and then using them with the comma operator.

    const checkLeftEdge = circleXCoord - circleRadius < 0;
    const checkBottomEdge = circleYCoord - circleRadius < 0;
    const checkRightEdge = circleXCoord + circleRadius > boundaryWidth;
    const checkTopSum = circleYCoord + circleXCoord > boundaryHeight; // This is the condition that actually determines the 'if' branch

    // The 'if' condition will evaluate checkLeftEdge, then checkBottomEdge,
    // then checkRightEdge, and finally checkTopSum. The result of checkTopSum
    // will be the one that the 'if' statement acts upon.
    if (checkLeftEdge, checkBottomEdge, checkRightEdge, checkTopSum) {
      console.log('No');
    } else {
      console.log('Yes');
    }
  };

  evaluateCirclePosition(
    parsedNumericParameters[0],
    parsedNumericParameters[1],
    parsedNumericParameters[2],
    parsedNumericParameters[3],
    parsedNumericParameters[4]
  );
}(require('fs').readFileSync('/dev/stdin', 'utf8')));

"use strict"

function coordinateTransformer(rawInput) {
  const numericComponents = rawInput.match(/-?\d+(\.\d+)?/g).map(val => parseInt(val, 10));

  const [initialX1, initialY1, initialX2, initialY2] = numericComponents;

  const calculateVectorComponents = (startX, startY, endX, endY) => {
    return {
      componentA: endX - startX,
      componentB: endY - startY
    };
  };

  const performRotation = (vecA, vecB) => {
    return {
      rotatedA: -vecB,
      rotatedB: vecA
    };
  };

  const applyVectorOffset = (baseX, baseY, offsetX, offsetY) => {
    return {
      finalX: baseX + offsetX,
      finalY: baseY + offsetY
    };
  };

  const { componentA: deltaX, componentB: deltaY } = calculateVectorComponents(initialX1, initialY1, initialX2, initialY2);

  const { rotatedA: rotatedDeltaX, rotatedB: rotatedDeltaY } = performRotation(deltaX, deltaY);

  const { finalX: thirdPointX, finalY: thirdPointY } = applyVectorOffset(initialX2, initialY2, rotatedDeltaX, rotatedDeltaY);

  const { finalX: fourthPointX, finalY: fourthPointY } = applyVectorOffset(initialX1, initialY1, rotatedDeltaX, rotatedDeltaY);

  console.log(thirdPointX, thirdPointY, fourthPointX, fourthPointY);
}

coordinateTransformer(require("fs").readFileSync("/dev/stdin", "utf8"));

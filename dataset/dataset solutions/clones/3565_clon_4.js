"use strict";

const makeCoordinate = (abscissaValue, ordinateValue) => ({
  abscissa: abscissaValue,
  ordinate: ordinateValue,
});

const makeDisplacement = (horizontalComponent, verticalComponent) => ({
  horizontal: horizontalComponent,
  vertical: verticalComponent,
});

const deriveDisplacement = (targetCoordinate, originCoordinate) =>
  makeDisplacement(
    targetCoordinate.abscissa - originCoordinate.abscissa,
    targetCoordinate.ordinate - originCoordinate.ordinate
  );

const rotateDisplacementCounterClockwise = (sourceDisplacement) =>
  makeDisplacement(
    -sourceDisplacement.vertical,
    sourceDisplacement.horizontal
  );

const applyDisplacementToCoordinate = (baseCoordinate, displacementToAdd) =>
  makeCoordinate(
    baseCoordinate.abscissa + displacementToAdd.horizontal,
    baseCoordinate.ordinate + displacementToAdd.vertical
  );

const executePlanarTransformation = (sourceData) => {
  const numericParts = sourceData.match(/-?\d+/g).map(Number);

  const initialPoint = makeCoordinate(numericParts[0], numericParts[1]);
  const secondPoint = makeCoordinate(numericParts[2], numericParts[3]);

  const spanningVector = deriveDisplacement(secondPoint, initialPoint);

  const orthogonalVector = rotateDisplacementCounterClockwise(spanningVector);

  const thirdResultantPoint = applyDisplacementToCoordinate(
    secondPoint,
    orthogonalVector
  );

  const fourthResultantPoint = applyDisplacementToCoordinate(
    initialPoint,
    orthogonalVector
  );

  return [
    thirdResultantPoint.abscissa,
    thirdResultantPoint.ordinate,
    fourthResultantPoint.abscissa,
    fourthResultantPoint.ordinate,
  ];
};

const inputPayload = require("fs").readFileSync("/dev/stdin", "utf8");
const outputValues = executePlanarTransformation(inputPayload);
console.log(...outputValues);
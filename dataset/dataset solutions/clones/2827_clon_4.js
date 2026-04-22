'use strict';

const processSpatialData = (rawGeometrySpec) => {
  const [firstDimension, secondDimension, abscissa, ordinate] = rawGeometrySpec
    .trim()
    .split(/\s+/)
    .map(Number);

  const calculatedSurface = (firstDimension * secondDimension) / 2;
  const isMidpoint = (firstDimension === (abscissa * 2) && secondDimension === (ordinate * 2)) | 0;

  console.log(calculatedSurface, isMidpoint);
};

processSpatialData(require("fs").readFileSync("/dev/stdin", "utf8"));
'use strict'

function retrieveSourceData() {
  return require("fs").readFileSync("/dev/stdin", "utf8").trim();
}

function computeInternalAngleSum(sidesCountValue) {
  const degreesInTriangle = 180;
  const effectiveTriangles = sidesCountValue - 2;
  return effectiveTriangles * degreesInTriangle;
}

function processInput(rawDataString) {
  const numericInput = Number(rawDataString);
  const polygonSidesCount = numericInput;

  const finalResult = computeInternalAngleSum(polygonSidesCount);

  console.log(finalResult);
}

processInput(retrieveSourceData());

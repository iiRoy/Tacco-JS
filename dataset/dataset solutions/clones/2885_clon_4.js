const geometryModule = require('fs');

const dataFromInput = geometryModule.readFileSync('/dev/stdin', 'utf8');

const polygonVertexCount = Number(dataFromInput.trim());

const determineInteriorAngleSum = (vertexCountParam) => {
  const constantFactor = 180;
  const deductionValue = 2;
  const calculationResult = (vertexCountParam - deductionValue) * constantFactor;
  return calculationResult;
};

const finalComputationOutcome = determineInteriorAngleSum(polygonVertexCount);

console.log(finalComputationOutcome);
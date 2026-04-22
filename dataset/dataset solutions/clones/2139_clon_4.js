'use strict'

const computeOptimalValue = (rawData) => {
  const lines = rawData.trim().split('\n');
  const countOfElements = Number(lines[0]);
  const sourceNumbers = lines[1].split(' ').map(Number);

  const searchUpperBoundary = 100;

  // Create a set of the input numbers for fast presence checking
  const existingValues = new Set(sourceNumbers);

  // Generate all integers from 1 to searchUpperBoundary
  // Then filter to keep only those integers NOT present in the input
  const candidatePoints = Array.from({ length: searchUpperBoundary }, (_, index) => index + 1)
                               .filter(pointValue => !existingValues.has(pointValue));

  // For each valid candidate point, calculate the sum of squared differences
  const computedCosts = candidatePoints.map(pointForAssessment => {
    return sourceNumbers.reduce((accumulator, individualFigure) => {
      const difference = individualFigure - pointForAssessment;
      return accumulator + (difference * difference);
    }, 0);
  });

  // Find the minimum cost among all computed costs.
  // If computedCosts is empty (e.g., all numbers from 1 to 100 are in sourceNumbers),
  // Math.min() will correctly return Infinity.
  const finalScore = Math.min(...computedCosts);

  console.log(finalScore);
};

const executeProgram = () => {
  const fileData = require("fs").readFileSync("/dev/stdin", "utf8");
  computeOptimalValue(fileData);
};

executeProgram();
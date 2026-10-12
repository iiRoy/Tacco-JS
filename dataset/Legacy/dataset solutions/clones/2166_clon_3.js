'use strict';

function processInput(rawInputString) {
  const inputLines = rawInputString.trim().split('\n');

  const cityDesignations = inputLines[0].split(' ');
  const cityOneIdentifier = cityDesignations[0];
  const cityTwoIdentifier = cityDesignations[1];

  const populationValueStrings = inputLines[1].split(' ');
  const initialPopulationValues = populationValueStrings.map(Number);

  let currentPopulationA = initialPopulationValues[0];
  let currentPopulationB = initialPopulationValues[1];

  const departingCityIdentifier = inputLines[2];

  const isDepartureFromCityOne = (departingCityIdentifier === cityOneIdentifier);

  if (isDepartureFromCityOne) {
    currentPopulationA = currentPopulationA - 1;
  } else {
    currentPopulationB = currentPopulationB - 1;
  }

  console.log(currentPopulationA + ' ' + currentPopulationB);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));

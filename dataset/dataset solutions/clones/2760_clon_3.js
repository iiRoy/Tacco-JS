"use strict";

const determineOptimalCost = (groupSize, trainTicketPrice, taxiServiceCost) => {
  const totalTrainJourneyCost = groupSize * trainTicketPrice;
  let finalCalculatedCost;

  if (totalTrainJourneyCost > taxiServiceCost) {
    finalCalculatedCost = taxiServiceCost;
  } else {
    finalCalculatedCost = totalTrainJourneyCost;
  }
  return finalCalculatedCost;
};

const processInputData = (inputLine) => {
  const stringComponents = inputLine.split(" ");

  const numericalValues = stringComponents.map((component) => {
    return Number(component);
  });

  const numberOfMembers = numericalValues[0];
  const costPerTrainTicket = numericalValues[1];
  const taxiServiceFee = numericalValues[2];

  const resultCost = determineOptimalCost(numberOfMembers, costPerTrainTicket, taxiServiceFee);

  console.log(resultCost);
};

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));

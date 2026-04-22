"use strict";

const acquireExternalContent = (pathReference) => require('node:fs').readFileSync(pathReference, 'utf8');

const determineOutcome = (textualSource) => {
  const numericalComponents = textualSource.trim().split(/\s+/).map(Number);

  let initialQuantity = numericalComponents[0];
  let secondQuantity = numericalComponents[1];
  let thirdQuantity = numericalComponents[2];

  let cumulativeScore = 0;

  // Process combinations of second and third quantities
  const sharedUnits = Math.min(secondQuantity, thirdQuantity);
  cumulativeScore += sharedUnits * 2;
  secondQuantity -= sharedUnits;
  thirdQuantity -= sharedUnits;

  // Add any remaining second quantity items as individual points
  cumulativeScore += secondQuantity;

  // Process combinations of remaining third quantity and initial quantity
  const pairedWithInitial = Math.min(thirdQuantity, initialQuantity);
  cumulativeScore += pairedWithInitial;
  thirdQuantity -= pairedWithInitial;

  // Award a final point if any third quantity remains
  cumulativeScore += Math.min(1, thirdQuantity);

  return cumulativeScore;
};

const orchestrateExecution = (dataSourcePath) => {
  const rawData = acquireExternalContent(dataSourcePath);
  const finalTally = determineOutcome(rawData);
  console.log(finalTally);
};

orchestrateExecution('/dev/stdin');
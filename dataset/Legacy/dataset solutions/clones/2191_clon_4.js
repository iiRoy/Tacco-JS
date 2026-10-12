"use strict";

function evaluateScenario(inputData) {
  const parsedLines = inputData.trim().split("\n");

  const [vitalityStr, actionsLimitStr] = parsedLines[0].split(" ");
  let currentVitality = parseInt(vitalityStr);
  const maxAllowedActions = parseInt(actionsLimitStr);
  const strikeValues = parsedLines[1].split(" ").map(Number);

  let actionCount = 0;

  function* damageProvider(strikes) {
    let currentIdx = 0;
    const totalStrikes = strikes.length;
    while (true) {
      yield strikes[currentIdx];
      currentIdx = (currentIdx + 1) % totalStrikes;
    }
  }

  const damageStream = damageProvider(strikeValues);

  for (const currentStrike of damageStream) {
    actionCount++;
    currentVitality -= currentStrike;
    if (currentVitality < 0) {
      break;
    }
  }

  if (actionCount <= maxAllowedActions) {
    console.log("yes");
  } else {
    console.log("no");
  }
}

evaluateScenario(require('fs').readFileSync('/dev/stdin', 'utf8'));

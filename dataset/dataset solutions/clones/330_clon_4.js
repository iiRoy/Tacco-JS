function createGameSimulator(initialAttackCountInput) {
  let totalInnings = +initialAttackCountInput;
  let currentStrikeouts = 0;
  let gameMaxStrikeouts = totalInnings * 3;
  let baseOccupants = [];
  let currentPoints = 0;

  const assessMatchConclusion = () => currentStrikeouts === gameMaxStrikeouts;

  const presentScoreAndReset = () => {
    console.log(currentPoints);
    currentPoints = 0;
    baseOccupants = [];
  };

  const activityDispatch = {
    'SINGLE_HIT': () => {
      baseOccupants.push(0);
      baseOccupants = baseOccupants.map(position => position + 1);
      if (baseOccupants.length > 0 && baseOccupants[0] === 4) {
        currentPoints++;
        baseOccupants.shift();
      }
      return 'continue_match';
    },
    'GRAND_SLAM': () => {
      currentPoints += baseOccupants.length + 1;
      baseOccupants = [];
      return 'continue_match';
    },
    'STRIKE_OUT': () => {
      currentStrikeouts++;
      if (currentStrikeouts % 3 === 0) {
        return 'period_transition';
      }
      return 'continue_match';
    }
  };

  return {
    executeGameEvent: (eventType) => {
      const handlerFunction = activityDispatch[eventType];
      if (handlerFunction) {
        return handlerFunction();
      }
      return 'unrecognized_event';
    },
    queryGameStatus: () => ({
      isMatchOver: assessMatchConclusion(),
      currentPointsAccumulated: currentPoints,
      currentStrikeoutsCount: currentStrikeouts
    }),
    outputReportAndClear: presentScoreAndReset
  };
}

const gameDataLines = require("node:fs").readFileSync("/dev/stdin", "utf8").trim().split('\n');
const initialSetupValue = gameDataLines.shift();
const gameEngineInstance = createGameSimulator(initialSetupValue);

function advanceGameCycle(remainingEvents) {
  if (remainingEvents.length === 0) {
    return;
  }

  const nextEventTrigger = remainingEvents.shift();
  const eventResult = gameEngineInstance.executeGameEvent(nextEventTrigger);

  if (eventResult === 'period_transition') {
    gameEngineInstance.outputReportAndClear();
    const matchStatus = gameEngineInstance.queryGameStatus();
    if (matchStatus.isMatchOver) {
      return;
    }
  }
  advanceGameCycle(remainingEvents);
}

advanceGameCycle(gameDataLines);
const fetchInputSource = () => {
  const operationsForFiles = require('fs');
  return operationsForFiles.readFileSync(0, 'utf8');
};

const processInputData = () => {
  const initialData = fetchInputSource();
  const primaryLine = initialData.split('\n')[0];

  const iterateCharacter = (currentState, currentSymbol) => {
    const { finalCount, activityLevel } = currentState;

    const stateBranchIdentifier = activityLevel > 0 ? 'levelElevated' : 'levelBase';

    const transformationDefinitions = {
      'levelElevated': {
        'g': { countChange: 1, levelChange: -1 },
        'p': { countChange: 0, levelChange: -1 }
      },
      'levelBase': {
        'g': { countChange: 0, levelChange: 1 },
        'p': { countChange: -1, levelChange: 1 }
      }
    };

    const relevantTransformation = transformationDefinitions[stateBranchIdentifier][currentSymbol];

    return {
      finalCount: finalCount + relevantTransformation.countChange,
      activityLevel: activityLevel + relevantTransformation.levelChange
    };
  };

  const startingPoint = { finalCount: 0, activityLevel: 0 };
  const computedOutcome = primaryLine.split('').reduce(iterateCharacter, startingPoint);

  console.log(computedOutcome.finalCount);
};

processInputData();
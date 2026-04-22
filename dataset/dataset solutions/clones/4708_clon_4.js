function extractNumericInput() { return nextInt(); }
function extractCharacterSequence() { return nextCharArray(); }
function outputResult(str) { myout(str); }

function calculateDerivedState(pastStateA, pastStateB, observationInput) {
  const stateValA = (pastStateA === 'S') ? 0 : 1;
  const stateValB = (pastStateB === 'S') ? 0 : 1;
  const observationVal = (observationInput === 'o') ? 0 : 1;

  // The core recurrence relation: S_current = (S_two_back + O_one_back + S_one_back) % 2
  // Here, pastStateA is S_two_back, pastStateB is S_one_back, observationInput is O_one_back
  const nextNumericState = (stateValA + observationVal + stateValB) % 2;
  return (nextNumericState === 0) ? 'S' : 'W';
}

function generateSequenceRecursively(currentStep, limitSteps, pastState1, pastState2, observations) {
  const charToNum = (c) => (c === 'S' || c === 'o') ? 0 : 1;
  const numToChar = (n) => (n === 0) ? 'S' : 'W';

  let currentNumericState;
  if (currentStep === 0) {
    // The very first state (P_0) is fixed as 'S' in the original logic.
    // It's passed as pastState1 in the initial call.
    currentNumericState = charToNum(pastState1);
  } else if (currentStep === 1) {
    // The second state (P_1) is determined by P_0 and O_0,
    // assuming P_{-1} = P_0. This simplifies to O_0.
    // It's passed as pastState2 in the initial call.
    currentNumericState = charToNum(pastState2);
  } else {
    // For subsequent states P_i (i >= 2):
    // P_i = (P_{i-2} + O_{i-1} + P_{i-1}) % 2
    // Here, pastState1 corresponds to P_{i-2} (numeric),
    // pastState2 corresponds to P_{i-1} (numeric),
    // and observations[currentStep - 1] is O_{i-1}.
    currentNumericState = (charToNum(pastState1) + charToNum(observations[currentStep - 1]) + charToNum(pastState2)) % 2;
  }

  const currentCharacterState = numToChar(currentNumericState);

  // Base case: If we've reached the limit (generated P_N), return just this state.
  if (currentStep === limitSteps) {
    return [currentCharacterState];
  }

  // Recursive step: Generate the rest of the sequence
  return [currentCharacterState].concat(
    generateSequenceRecursively(
      currentStep + 1,
      limitSteps,
      pastState2, // The previous state (P_{i-1}) becomes the 'pastState1' (P_{i-2}) for the next step
      currentCharacterState, // The current state (P_i) becomes the 'pastState2' (P_{i-1}) for the next step
      observations
    )
  );
}

function processCircularArrangement() {
  const totalElements = extractNumericInput();
  const elementObservations = extractCharacterSequence();

  // The original code implicitly sets P_0 = 'S'.
  const initialFirstElementState = 'S';
  // And P_1 is derived from P_0 and O_0, assuming P_{-1} = P_0.
  // This means P_1 is 'S' if O_0 is 'o', and 'W' if O_0 is 'x'.
  const initialSecondElementState = (elementObservations[0] === 'o') ? 'S' : 'W';

  // The recursive function generates a sequence from P_0 up to P_N.
  // P_N is used for the circular consistency check against P_0.
  const fullPatternList = generateSequenceRecursively(
    0, // Starting index
    totalElements, // Generate up to P_N
    initialFirstElementState, // Corresponds to P_0
    initialSecondElementState, // Corresponds to P_1
    elementObservations
  );

  // The original problem checks if the calculated P_N is equal to the initial P_0.
  if (fullPatternList[totalElements] === fullPatternList[0]) {
    // If consistent, remove P_N (which is a duplicate check)
    // and output the sequence P_0 to P_{N-1}.
    fullPatternList.pop();
    outputResult(fullPatternList.join(''));
  } else {
    // If not consistent, output -1.
    outputResult(-1);
  }
}

processCircularArrangement();
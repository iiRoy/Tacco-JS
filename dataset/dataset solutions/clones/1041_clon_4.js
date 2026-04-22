const DNA_MAPPING = {
  'A': 0,
  'C': 1,
  'G': 2,
  'T': 3,
};

const HASH_BASE_VAL = 31;
const PRIME_MODULUS = 1000000007;

function deriveNumericToken(sequenceIdentifier) {
  let currentAccumulator = 0;
  for (let position = 0; position < sequenceIdentifier.length; position++) {
    const characterNumeric = DNA_MAPPING[sequenceIdentifier[position]];
    currentAccumulator = (currentAccumulator * HASH_BASE_VAL + characterNumeric) % PRIME_MODULUS;
  }
  return currentAccumulator;
}

function createMolecularDepository(storageCapacity) {
  const dataBins = Array.from({ length: storageCapacity }, () => []);

  function depositSequence(inputSequence) {
    const computedToken = deriveNumericToken(inputSequence);
    const targetBinIndex = computedToken % storageCapacity;

    const currentBin = dataBins[targetBinIndex];
    if (currentBin.includes(inputSequence)) {
      return 1;
    }
    currentBin.push(inputSequence);
    return 0;
  }

  function querySequence(inputSequence) {
    const computedToken = deriveNumericToken(inputSequence);
    const targetBinIndex = computedToken % storageCapacity;

    const currentBin = dataBins[targetBinIndex];
    return currentBin.includes(inputSequence) ? 1 : 0;
  }

  return {
    deposit: depositSequence,
    query: querySequence,
  };
}

(function executionUnit() {
  const inputData = require('fs').readFileSync('/dev/stdin', 'utf8');
  const instructionBlocks = inputData.trim().split("\n").slice(1);
  const processedInstructions = instructionBlocks.map(lineContent => lineContent.split(' '));

  const storageFacility = createMolecularDepository(1046527);

  processedInstructions.forEach(instruction => {
    if (instruction[0][0] === 'i') {
      storageFacility.deposit(instruction[1]);
    } else {
      console.log(storageFacility.query(instruction[1]) ? 'yes' : 'no');
    }
  });
})();
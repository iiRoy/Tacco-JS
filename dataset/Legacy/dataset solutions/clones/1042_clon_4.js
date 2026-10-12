const createNucleotideStore = (tableCapacity) => {
  const NUCLEOTIDE_VALUES = {
    'A': 1,
    'C': 2,
    'G': 3,
    'T': 4,
  };

  const dataSlots = Array(tableCapacity).fill('');
  const capacity = tableCapacity;

  const calculateSequenceHash = (sequence) => {
    return Array.from(sequence).reduce((currentSum, nucleotideChar, index) => {
      return currentSum + NUCLEOTIDE_VALUES[nucleotideChar] * Math.pow(5, index);
    }, 0);
  };

  const getPrimaryIndex = (hashValue) => hashValue % capacity;

  const getSecondaryOffset = (hashValue) => 1 + hashValue % (capacity - 1);

  const checkPresence = (sequence) => {
    const hashValue = calculateSequenceHash(sequence);
    const primaryIndex = getPrimaryIndex(hashValue);
    const secondaryOffset = getSecondaryOffset(hashValue);

    let probeAttempt = 0;
    while (true) {
      const currentSlot = (primaryIndex + probeAttempt * secondaryOffset) % capacity;
      const slotContent = dataSlots[currentSlot];

      if (slotContent === sequence) {
        return 1;
      } else if (slotContent === '') {
        return 0;
      }
      probeAttempt++;
    }
  };

  const addSequence = (sequence) => {
    const hashValue = calculateSequenceHash(sequence);
    const primaryIndex = getPrimaryIndex(hashValue);
    const secondaryOffset = getSecondaryOffset(hashValue);

    let probeAttempt = 0;
    while (true) {
      const currentSlot = (primaryIndex + probeAttempt * secondaryOffset) % capacity;
      const slotContent = dataSlots[currentSlot];

      if (slotContent === sequence) {
        return 1;
      } else if (slotContent === '') {
        dataSlots[currentSlot] = sequence;
        return 0;
      }
      probeAttempt++;
    }
  };

  return {
    checkPresence,
    addSequence,
  };
};

(function processInput() {
  const inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n');

  const processedCommands = inputLines.reduce((acc, line, index) => {
    if (index === 0) return acc;
    const parts = line.split(' ');
    if (parts.length < 2) return acc;
    acc.push([parts[0][0], parts[1]]);
    return acc;
  }, []);

  const sequenceStore = createNucleotideStore(1046527);

  for (const currentCommand of processedCommands) {
    const [operationType, targetSequence] = currentCommand;
    if (operationType === 'i') {
      sequenceStore.addSequence(targetSequence);
    } else {
      console.log(sequenceStore.checkPresence(targetSequence) ? 'yes' : 'no');
    }
  }
})();

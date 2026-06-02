class NucleotideHashStore {
  static get BASE_VALUES() {
    return {
      'A': 1,
      'C': 2,
      'G': 3,
      'T': 4,
    };
  }

  constructor(tableSize) {
    this._capacity = tableSize;
    this._storage = new Array(tableSize).fill('');
  }

  _calculateHashKey(inputString) {
    let hashAccumulator = 0;
    let powerOfBase = 1;
    const HASH_PRIME_BASE = 5;

    for (const charVal of inputString) {
      const nucleotideValue = NucleotideHashStore.BASE_VALUES[charVal];
      hashAccumulator += powerOfBase * nucleotideValue;
      powerOfBase *= HASH_PRIME_BASE;
    }
    return hashAccumulator;
  }

  _primaryHash(keyVal) {
    return keyVal % this._capacity;
  }

  _secondaryHash(keyVal) {
    const capacityMinusOne = this._capacity - 1;
    return 1 + (keyVal % capacityMinusOne);
  }

  _probeForSlot(computedKey, targetString) {
    const idx1 = this._primaryHash(computedKey);
    const idx2 = this._secondaryHash(computedKey);
    let currentIdx;

    for (let probeCount = 0; ; probeCount++) {
      currentIdx = (idx1 + probeCount * idx2) % this._capacity;
      const storedValue = this._storage[currentIdx];

      if (storedValue === targetString) {
        return { index: currentIdx, found: true, emptySlot: false };
      } else if (storedValue === '') {
        return { index: currentIdx, found: false, emptySlot: true };
      }
    }
  }

  lookup(inputString) {
    const computedKey = this._calculateHashKey(inputString);
    const probeResult = this._probeForSlot(computedKey, inputString);

    return probeResult.found ? 1 : 0;
  }

  addEntry(inputString) {
    const computedKey = this._calculateHashKey(inputString);
    const probeResult = this._probeForSlot(computedKey, inputString);

    if (probeResult.found) {
      return 1;
    } else if (probeResult.emptySlot) {
      this._storage[probeResult.index] = inputString;
      return 0;
    }
    return 0;
  }
}

(function executeMainProgram() {
  const fileSystem = require('fs');
  const inputFilePath = '/dev/stdin';
  const fileContent = fileSystem.readFileSync(inputFilePath, 'utf8');
  const rawInputLines = fileContent.split('\n');

  const parseCommandLine = (line) => {
    const commandParts = line.split(' ');
    const commandTypeChar = commandParts[0][0];
    return [commandTypeChar, commandParts[1]];
  };

  const processedCommands = rawInputLines.slice(1).map(parseCommandLine);

  const HASH_TABLE_INITIAL_CAPACITY = 1046527;
  let hashStoreInstance = new NucleotideHashStore(HASH_TABLE_INITIAL_CAPACITY);

  processedCommands.forEach(commandData => {
    const operationType = commandData[0];
    const targetString = commandData[1];

    switch (operationType) {
      case 'i':
        hashStoreInstance.addEntry(targetString);
        break;
      case 'f':
        const foundStatus = hashStoreInstance.lookup(targetString);
        console.log(foundStatus ? 'yes' : 'no');
        break;
      default:
        break;
    }
  });
})();

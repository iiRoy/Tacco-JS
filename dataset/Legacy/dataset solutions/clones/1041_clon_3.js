class NucleotideHashStore {
  static get NUCLEOTIDE_VALUES() {
    return {
      'A': 1,
      'C': 2,
      'G': 3,
      'T': 4,
    };
  }

  constructor(tableSizeParam) {
    this.tableSize = tableSizeParam;
    this.hashTable = Array(this.tableSize).fill('');
  }

  static _calculateHashKey(inputString) {
    let hashSum = 0;
    let currentPower = 1;
    const baseMultiplier = 5;
    const nucleotideMap = NucleotideHashStore.NUCLEOTIDE_VALUES;

    for (let idx = 0; idx < inputString.length; idx++) {
      const charValue = nucleotideMap[inputString[idx]];
      hashSum += currentPower * charValue;
      currentPower *= baseMultiplier;
    }
    return hashSum;
  }

  _primaryHash(computedKey) {
    return computedKey % this.tableSize;
  }

  _secondaryHash(computedKey) {
    const divisor = this.tableSize - 1;
    return 1 + (computedKey % divisor);
  }

  _findProbeIndex(computedKey, targetString) {
    const primaryIndex = this._primaryHash(computedKey);
    const secondaryIndex = this._secondaryHash(computedKey);
    let currentHashIndex;

    for (let probeAttempt = 0; ; probeAttempt++) {
      currentHashIndex = (primaryIndex + probeAttempt * secondaryIndex) % this.tableSize;
      const slotContent = this.hashTable[currentHashIndex];

      if (slotContent === targetString) {
        return { index: currentHashIndex, found: true };
      } else if (slotContent === '') {
        return { index: currentHashIndex, found: false };
      }
    }
  }

  find(inputString) {
    const computedKey = NucleotideHashStore._calculateHashKey(inputString);
    const probeResult = this._findProbeIndex(computedKey, inputString);
    return probeResult.found ? 1 : 0;
  }

  insert(inputString) {
    const computedKey = NucleotideHashStore._calculateHashKey(inputString);
    const probeResult = this._findProbeIndex(computedKey, inputString);

    if (probeResult.found) {
      return 1;
    } else {
      this.hashTable[probeResult.index] = inputString;
      return 0;
    }
  }
}

(function executeMainProgram() {
  const fileSystem = require('fs');
  const inputFilePath = '/dev/stdin';
  const rawInputContent = fileSystem.readFileSync(inputFilePath, 'utf8');
  const trimmedInput = rawInputContent.trim();
  const lineArray = trimmedInput.split("\n");
  const dataLines = lineArray.slice(1);

  const operationList = [];
  for (const line of dataLines) {
    operationList.push(line.split(' '));
  }

  const initialTableSize = 1046527;
  let hashStoreInstance = new NucleotideHashStore(initialTableSize);

  for (const currentOperation of operationList) {
    const operationType = currentOperation[0];
    const targetValue = currentOperation[1];

    if (operationType.startsWith('i')) {
      hashStoreInstance.insert(targetValue);
    } else if (operationType.startsWith('f')) {
      const foundStatus = hashStoreInstance.find(targetValue);
      console.log(foundStatus === 1 ? 'yes' : 'no');
    }
  }
})();

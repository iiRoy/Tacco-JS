class NucleotideStringStore {
  static get BASE_VALS() {
    return {
      'A': 1,
      'C': 2,
      'G': 3,
      'T': 4,
    };
  }

  constructor(capacity) {
    this.capacity = capacity;
    this.buckets = Array.from({ length: capacity }, () => []);
  }

  static _computeHashValue(inputString) {
    let currentHash = 0;
    const PRIME_MULTIPLIER = 31; // A common prime for string hashing
    for (let i = 0; i < inputString.length; i++) {
      currentHash = (currentHash * PRIME_MULTIPLIER + NucleotideStringStore.BASE_VALS[inputString[i]]);
    }
    return currentHash;
  }

  _primaryIndex(hashVal) {
    return (hashVal % this.capacity + this.capacity) % this.capacity; // Ensure positive result
  }

  locateEntry(targetString) {
    const hashValue = NucleotideStringStore._computeHashValue(targetString);
    const bucketIndex = this._primaryIndex(hashValue);
    const currentBucket = this.buckets[bucketIndex];

    for (let i = 0; i < currentBucket.length; i++) {
      if (currentBucket[i] === targetString) {
        return 1;
      }
    }
    return 0;
  }

  placeEntry(newString) {
    const hashValue = NucleotideStringStore._computeHashValue(newString);
    const bucketIndex = this._primaryIndex(hashValue);
    const currentBucket = this.buckets[bucketIndex];

    for (let i = 0; i < currentBucket.length; i++) {
      if (currentBucket[i] === newString) {
        return 1; // Already exists
      }
    }

    currentBucket.push(newString);
    return 0; // Newly inserted
  }
}

(function mainExecution() {
  const inputData = require('fs').readFileSync('/dev/stdin', 'utf8');
  const processedLines = inputData.trim().split("\n").slice(1);
  const operationList = processedLines.map(line => line.split(' '));

  let dataStore = new NucleotideStringStore(1046527);
  operationList.forEach(op => {
    if (op[0][0] === 'i') {
      dataStore.placeEntry(op[1]);
    } else {
      console.log(dataStore.locateEntry(op[1]) ? 'yes' : 'no');
    }
  });
})();

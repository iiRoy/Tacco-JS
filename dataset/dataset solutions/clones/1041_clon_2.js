class NucleotideSequenceStore {
  // Static getter to provide a mapping for DNA bases to numerical values.
  // These values are crucial for the hashing algorithm.
  static get BASE_CODES() {
    return {
      'A': 1, // Adenine
      'C': 2, // Cytosine
      'G': 3, // Guanine
      'T': 4, // Thymine
    };
  }

  /**
   * Constructs a new NucleotideSequenceStore instance.
   * @param {number} tableCapacity - The size of the hash table.
   */
  constructor(tableCapacity) {
    this.tableCapacity = tableCapacity; // Store the hash table size.
    this.hashStorage = []; // Initialize the array that will hold the sequences.

    // Fill the hash table with empty strings initially.
    for (let idx = 0; idx < tableCapacity; idx++) {
      this.hashStorage[idx] = '';
    }
  }

  /**
   * Computes a unique numerical key for a given nucleotide sequence string.
   * This is a static helper method.
   * @param {string} sequenceInput - The nucleotide sequence string (e.g., "AGCT").
   * @returns {number} The computed numerical key.
   */
  static _computeSequenceKey(sequenceInput) {
    let totalHashValue = 0;
    let powerMultiplier = 1; // Starts as 5^0

    // Iterate through the sequence, calculating a weighted sum.
    for (let charIndex = 0; charIndex < sequenceInput.length; charIndex++) {
      // Add (5^charIndex) * (numerical value of base) to the total.
      totalHashValue += powerMultiplier * NucleotideSequenceStore.BASE_CODES[sequenceInput[charIndex]];
      powerMultiplier *= 5; // Increment the power of 5 for the next character.
    }
    return totalHashValue;
  }

  /**
   * The primary hash function (h1).
   * @param {number} numericalKey - The numerical key of the sequence.
   * @returns {number} The initial hash index.
   */
  _primaryHash(numericalKey) {
    return numericalKey % this.tableCapacity;
  }

  /**
   * The secondary hash function (h2) for collision resolution.
   * @param {number} numericalKey - The numerical key of the sequence.
   * @returns {number} The step size for probing.
   */
  _secondaryHash(numericalKey) {
    return 1 + numericalKey % (this.tableCapacity - 1);
  }

  /**
   * Searches for a given nucleotide sequence in the hash table.
   * Uses double hashing for collision resolution.
   * @param {string} targetSequence - The sequence to find.
   * @returns {number} 1 if the sequence is found, 0 otherwise.
   */
  locateSequence(targetSequence) {
    // Calculate the numerical key for the target sequence.
    let sequenceKey = NucleotideSequenceStore._computeSequenceKey(targetSequence);
    let currentProbeIndex; // Variable to hold the current index being checked.

    // Compute the initial hash indices using the two hash functions.
    const initialHashIndex = this._primaryHash(sequenceKey);
    const stepHashValue = this._secondaryHash(sequenceKey);

    // Linear probing loop.
    for (let probeAttempt = 0; ; probeAttempt++) {
      // Calculate the current probe index.
      currentProbeIndex = (initialHashIndex + probeAttempt * stepHashValue) % this.tableCapacity;

      // Check if the sequence at the current index matches the target.
      if (this.hashStorage[currentProbeIndex] === targetSequence) {
        return 1; // Sequence found.
      }
      // If an empty slot is encountered, the sequence is not in the table.
      else if (this.hashStorage[currentProbeIndex] === '') {
        return 0; // Sequence not found.
      }
      // Continue probing if a different sequence is found (collision).
    }
    // This return is theoretically unreachable due to the infinite loop and conditions.
    return 0;
  }

  /**
   * Inserts a new nucleotide sequence into the hash table.
   * Uses double hashing for collision resolution.
   * @param {string} newSequence - The sequence to insert.
   * @returns {number} 1 if the sequence was already present, 0 if inserted successfully.
   */
  addSequence(newSequence) {
    // Calculate the numerical key for the new sequence.
    let sequenceKey = NucleotideSequenceStore._computeSequenceKey(newSequence);
    let currentProbeIndex; // Variable to hold the current index being checked.

    // Compute the initial hash indices using the two hash functions.
    const initialHashIndex = this._primaryHash(sequenceKey);
    const stepHashValue = this._secondaryHash(sequenceKey);

    // Linear probing loop.
    for (let probeAttempt = 0; ; probeAttempt++) {
      // Calculate the current probe index.
      currentProbeIndex = (initialHashIndex + probeAttempt * stepHashValue) % this.tableCapacity;

      // If the sequence is already present, no need to insert.
      if (this.hashStorage[currentProbeIndex] === newSequence) {
        return 1; // Sequence already exists.
      }
      // If an empty slot is found, insert the new sequence.
      else if (this.hashStorage[currentProbeIndex] === '') {
        this.hashStorage[currentProbeIndex] = newSequence; // Place the sequence.
        return 0; // Sequence inserted.
      }
      // Continue probing if a different sequence is found (collision).
    }
    // This return is theoretically unreachable due to the infinite loop and conditions.
    return 0;
  }
}

// Main execution block, wrapped in an Immediately Invoked Function Expression (IIFE).
(function executeOperations() {
  // Read all input from stdin.
  const fileContents = require('fs').readFileSync('/dev/stdin', 'utf8');

  // Process the input: trim whitespace, split into lines, and remove the first line (which is usually N).
  var processedInputLines = (fileContents.trim()).split("\n").slice(1);

  // Parse each line into a command array (e.g., ["insert", "AGCT"]).
  const operationList = processedInputLines.map(lineContent => lineContent.split(' '));

  // Initialize the hash list with a specific capacity.
  let dnaStore = new NucleotideSequenceStore(1046527);

  // Iterate over each command and perform the corresponding operation.
  operationList.forEach(currentCommand => {
    // Check the first character of the command type.
    if (currentCommand[0][0] === 'i') {
      // If it's 'i' (for insert), add the sequence.
      dnaStore.addSequence(currentCommand[1]);
    } else {
      // Otherwise (assumed to be 'find'), locate the sequence and print the result.
      console.log(dnaStore.locateSequence(currentCommand[1]) ? 'yes' : 'no');
    }
  });
})();

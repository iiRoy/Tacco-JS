class NucleotideHashStore {
  // Defines the integer mapping for each nucleotide base.
  static get BASE_VALUES() {
    return {
      'A': 1, // Adenine
      'C': 2, // Cytosine
      'G': 3, // Guanine
      'T': 4, // Thymine
    };
  }

  /**
   * Initializes a new hash store with a specified capacity.
   * @param {number} capacity - The maximum number of slots in the hash table.
   */
  constructor(capacity) {
    this.storeCapacity = capacity; // Store the capacity for hash calculations
    this.hashArray = []; // The underlying array to store sequences
    // Initialize all slots in the hash array as empty strings
    for (let idx = 0; idx < capacity; idx++) {
      this.hashArray[idx] = '';
    }
  }

  /**
   * Calculates a unique integer hash key for a given nucleotide sequence.
   * Uses a polynomial hashing approach with base 5.
   * @param {string} sequence - The nucleotide sequence (e.g., "AGCT").
   * @returns {number} The calculated hash key.
   * @private
   */
  _calculateHashKey(sequence) {
    let total = 0;
    let powerOfFive = 1; // Represents 5^0, 5^1, 5^2, ...
    // Iterate over each character in the sequence
    sequence.split('').forEach(char => {
      // Add the character's value multiplied by the current power of 5
      total += powerOfFive * NucleotideHashStore.BASE_VALUES[char];
      powerOfFive *= 5; // Move to the next power of 5
    });
    return total;
  }

  /**
   * Computes the primary hash index using the modulo operator.
   * @param {number} hashVal - The integer hash value of the sequence.
   * @returns {number} The primary hash index.
   * @private
   */
  _primaryHash(hashVal) {
    return hashVal % this.storeCapacity;
  }

  /**
   * Computes the secondary hash step for collision resolution.
   * @param {number} hashVal - The integer hash value of the sequence.
   * @returns {number} The secondary hash step.
   * @private
   */
  _secondaryHash(hashVal) {
    return 1 + hashVal % (this.storeCapacity - 1);
  }

  /**
   * Searches for a given nucleotide sequence in the hash store.
   * Uses double hashing for collision resolution.
   * @param {string} sequence - The nucleotide sequence to find.
   * @returns {number} 1 if the sequence is found, 0 otherwise.
   */
  retrieve(sequence) {
    const hashVal = NucleotideHashStore._calculateHashKey(sequence);
    let currentIdx;
    // Calculate initial hash indices
    const initialIdx = this._primaryHash(hashVal);
    const stepIdx = this._secondaryHash(hashVal);

    // Probe for the sequence using double hashing
    for (let probeCount = 0;; probeCount++) {
      currentIdx = (initialIdx + probeCount * stepIdx) % this.storeCapacity;
      // If the sequence is found at this index, return 1
      if (this.hashArray[currentIdx] === sequence) {
        return 1;
      }
      // If an empty slot is encountered, the sequence is not in the store
      else if (this.hashArray[currentIdx] === '') {
        return 0;
      }
      // Continue probing if a different sequence is found (collision)
    }
    // Should not be reached in an infinite loop, but for completeness
    return 0;
  }

  /**
   * Inserts a nucleotide sequence into the hash store.
   * Uses double hashing for collision resolution.
   * @param {string} sequence - The nucleotide sequence to insert.
   * @returns {number} 1 if the sequence was already present, 0 if newly inserted.
   */
  add(sequence) {
    const hashVal = NucleotideHashStore._calculateHashKey(sequence);
    let currentIdx;
    // Calculate initial hash indices
    const initialIdx = this._primaryHash(hashVal);
    const stepIdx = this._secondaryHash(hashVal);

    // Probe for an empty slot or existing sequence
    for (let probeCount = 0;; probeCount++) {
      currentIdx = (initialIdx + probeCount * stepIdx) % this.storeCapacity;
      // If the sequence is already present, return 1
      if (this.hashArray[currentIdx] === sequence) {
        return 1;
      }
      // If an empty slot is found, insert the sequence and return 0
      else if (this.hashArray[currentIdx] === '') {
        this.hashArray[currentIdx] = sequence;
        return 0;
      }
      // Continue probing if a different sequence is found (collision)
    }
    // Should not be reached
    return 0;
  }
}

// Main execution block
(function processInput() {
  // Read all lines from standard input
  const inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n');

  // Parse commands from input lines
  // Skip the first line (which typically contains the number of commands)
  const parsedCommands = inputLines.map(currentLine => {
    const lineParts = currentLine.split(' ');
    // Extract the first character of the command type and the sequence
    return [lineParts[0][0], lineParts[1]];
  }).slice(1); // Remove the first element (number of commands)

  // Initialize the hash store with a prime capacity
  // 1046527 is a common prime number used for hash table sizes
  let nucleotideStore = new NucleotideHashStore(1046527);

  // Process each command
  parsedCommands.forEach(currentCommand => {
    // Check if the command is 'i' (insert)
    if (currentCommand[0] === 'i') {
      nucleotideStore.add(currentCommand[1]);
    }
    // Otherwise, it's a 'f' (find) command
    else {
      // Output 'yes' if found, 'no' otherwise
      console.log(nucleotideStore.retrieve(currentCommand[1]) ? 'yes' : 'no');
    }
  });
})();

// This module provides a basic hash table implementation for storing and querying DNA/RNA nucleotide sequences.
// It uses double hashing for collision resolution and aims for efficient storage and retrieval.

/**
 * @class BioSequenceContainer
 * @description A custom hash table implementation optimized for storing unique nucleotide sequences.
 *              Utilizes double hashing for collision resolution.
 */
class BioSequenceContainer {
  // A private static map to convert nucleotide bases to integer values for hash calculation.
  // Using a prime number for each base value helps in distributing hash keys more evenly.
  static #NUCLEOTIDE_TO_INT_MAP = {
    'A': 1, // Adenine
    'C': 2, // Cytosine
    'G': 3, // Guanine
    'T': 4, // Thymine
    // Could be extended for RNA with 'U': 5 for Uracil, but sticking to original context.
  };

  /**
   * Constructs a new BioSequenceContainer.
   * @param {number} initialTableSize - The desired initial capacity of the hash table.
   *                                    It's best if this is a prime number for optimal hashing.
   */
  constructor(initialTableSize) {
    // Validate the input table size to ensure it's a positive integer.
    if (!Number.isInteger(initialTableSize) || initialTableSize <= 0) {
      console.error("Invalid table size provided. Must be a positive integer. Using default size.");
      // Fallback to a default size if invalid input.
      this.tableSize = 101; // A small prime default
    } else {
      this.tableSize = initialTableSize;
    }

    // The underlying array to store the sequences. Initialized with null to represent empty slots.
    this.storageArray = new Array(this.tableSize).fill(null);
    // Keeps track of the number of elements currently stored in the hash table.
    this.elementsCount = 0;
  }

  /**
   * Calculates a numerical "fingerprint" (hash key) for a given nucleotide sequence string.
   * This uses a polynomial hashing method with a prime base to minimize collisions.
   * @param {string} inputSequence - The DNA/RNA sequence string (e.g., "AGCT").
   * @returns {number} A non-negative integer hash value for the sequence. Returns 0 for invalid input.
   * @private
   */
  static _calculateSequenceFingerprint(inputSequence) {
    // Basic input validation.
    if (typeof inputSequence !== 'string' || inputSequence.length === 0) {
      // console.warn("Attempted to hash an invalid or empty sequence, returning default hash.");
      return 0; // Return a default hash for invalid input.
    }

    let fingerprintValue = 0;
    let powerOfPrime = 1; // Represents (PRIME_BASE)^0, (PRIME_BASE)^1, ...
    const PRIME_BASE = 11; // A prime number used as the base for polynomial hashing. (Changed from 5)

    // Iterate through each character of the sequence to compute the polynomial hash.
    for (let charIdx = 0; charIdx < inputSequence.length; charIdx++) {
      const baseChar = inputSequence[charIdx].toUpperCase(); // Ensure case-insensitivity if needed
      const intValue = BioSequenceContainer.#NUCLEOTIDE_TO_INT_MAP[baseChar];

      if (intValue === undefined) {
        // Handle unexpected characters in the sequence.
        // console.warn(`Unexpected character '${baseChar}' in sequence '${inputSequence}'. Skipping.`);
        continue; // Skip invalid characters, which might lead to different hash for same valid sequence.
      }
      fingerprintValue += powerOfPrime * intValue;
      powerOfPrime *= PRIME_BASE;
    }
    return fingerprintValue;
  }

  /**
   * Computes the primary hash index for a given hash key.
   * This determines the initial slot to check in the hash table.
   * @param {number} hashKey - The integer hash value of a sequence.
   * @returns {number} The primary index in the hash table.
   * @private
   */
  _getPrimaryHashIndex(hashKey) {
    return hashKey % this.tableSize;
  }

  /**
   * Computes the secondary hash step for collision resolution using double hashing.
   * This step value determines how many slots to jump if the primary slot is occupied.
   * @param {number} hashKey - The integer hash value of a sequence.
   * @returns {number} The step value for probing.
   * @private
   */
  _getSecondaryHashStep(hashKey) {
    // Ensure the step value is never zero and is relatively prime to tableSize for full table traversal.
    // Changing M-1 to M-3 for more variation, assuming tableSize > 3.
    const divisor = Math.max(1, this.tableSize - 3); // Prevent division by zero or negative.
    return 1 + (hashKey % divisor);
  }

  /**
   * Calculates the next probe index in the hash table based on initial index, step, and attempt count.
   * @param {number} initialIdx - The starting index (from primary hash).
   * @param {number} stepVal - The step value (from secondary hash).
   * @param {number} probeAttempt - The current probe iteration (0, 1, 2, ...).
   * @returns {number} The calculated index for the current probe attempt.
   * @private
   */
  _probeNextIndex(initialIdx, stepVal, probeAttempt) {
    return (initialIdx + probeAttempt * stepVal) % this.tableSize;
  }

  /**
   * Checks if a given nucleotide sequence exists in the hash table.
   * @param {string} targetSequence - The sequence to search for.
   * @returns {boolean} True if the sequence is found, false otherwise.
   */
  querySequence(targetSequence) {
    // Pre-check for invalid sequence input.
    if (typeof targetSequence !== 'string' || targetSequence.length === 0) {
      return false;
    }

    const computedHash = BioSequenceContainer._calculateSequenceFingerprint(targetSequence);
    const primaryIdx = this._getPrimaryHashIndex(computedHash);
    const stepIdx = this._getSecondaryHashStep(computedHash);

    // Define a maximum number of probes to prevent infinite loops in case of a full table
    // or very poor hash distribution. Typically, tableSize or tableSize * 2 is sufficient.
    const MAX_PROBE_LIMIT = this.tableSize * 2;

    // Iterate through probe sequence
    for (let probeCount = 0; probeCount < MAX_PROBE_LIMIT; probeCount++) {
      const currentProbeSlot = this._probeNextIndex(primaryIdx, stepIdx, probeCount);

      // Check if the current slot contains the target sequence.
      if (this.storageArray[currentProbeSlot] === targetSequence) {
        return true; // Sequence found.
      }
      // If an empty slot is encountered, the sequence is not in the table (assuming no deletions).
      else if (this.storageArray[currentProbeSlot] === null) {
        return false; // Sequence not found.
      }
      // If the slot is occupied by a different sequence, continue probing.
    }

    // If the loop finishes, it means the table is either full or the probe limit was reached
    // without finding the sequence or an empty slot.
    // console.warn(`Query for '${targetSequence}' reached probe limit without definitive result.`);
    return false;
  }

  /**
   * Adds a unique nucleotide sequence to the hash table.
   * If the sequence already exists, it is not added again.
   * @param {string} newSequence - The sequence to add.
   * @returns {boolean} True if the sequence was added or already exists, false if insertion failed (e.g., table full).
   */
  addUniqueSequence(newSequence) {
    // Input validation.
    if (typeof newSequence !== 'string' || newSequence.length === 0) {
      // console.error("Cannot add an invalid or empty sequence.");
      return false;
    }

    const computedHash = BioSequenceContainer._calculateSequenceFingerprint(newSequence);
    const primaryIdx = this._getPrimaryHashIndex(computedHash);
    const stepIdx = this._getSecondaryHashStep(computedHash);

    const MAX_PROBE_LIMIT = this.tableSize * 2; // Same limit as in querySequence.

    for (let probeCount = 0; probeCount < MAX_PROBE_LIMIT; probeCount++) {
      const currentProbeSlot = this._probeNextIndex(primaryIdx, stepIdx, probeCount);

      // Scenario 1: Sequence already exists in this slot.
      if (this.storageArray[currentProbeSlot] === newSequence) {
        return true; // Already present, no need to re-add.
      }
      // Scenario 2: Found an empty slot. Insert the new sequence here.
      else if (this.storageArray[currentProbeSlot] === null) {
        this.storageArray[currentProbeSlot] = newSequence;
        this.elementsCount++; // Increment the count of stored elements.
        return true; // Successfully added.
      }
      // Scenario 3: Slot occupied by a different sequence, continue probing.
    }

    // If we exit the loop, it means all probe attempts failed to find an empty slot or the sequence.
    // This typically indicates the hash table is full or experiencing extreme collisions.
    console.warn(`Failed to add sequence '${newSequence}'. Hash table likely full or probe limit reached.`);
    return false; // Insertion failed.
  }
}

// --- Main execution block ---
// This immediately invoked function expression (IIFE) handles reading input and processing commands.
(function processInputCommands() {
  console.time('Total processing time'); // Start a timer for overall script execution.

  const INPUT_FILE_PATH = '/dev/stdin'; // Standard input file path, common in competitive programming.

  let rawInputData;
  try {
    // Synchronously read all input from stdin. This is typical for competitive programming environments.
    rawInputData = require('fs').readFileSync(INPUT_FILE_PATH, 'utf8');
  } catch (error) {
    console.error(`Error reading input from ${INPUT_FILE_PATH}:`, error.message);
    process.exit(1); // Terminate the process with an error code.
  }

  // Process the raw input:
  // 1. Trim leading/trailing whitespace.
  // 2. Split into individual lines.
  // 3. Filter out any lines that are empty after trimming (for robustness).
  // 4. Discard the first line, which usually contains metadata like the number of commands.
  const cleanInputLines = rawInputData
    .trim()
    .split('\n')
    .filter(line => line.trim() !== '')
    .slice(1);

  // Parse each cleaned line into an operation array (e.g., ['i', 'AGCT']).
  const parsedOperations = cleanInputLines.map(line => line.split(' '));

  // Initialize our custom hash table with a large prime capacity.
  // This value (1046527) is a prime number and is a common choice in competitive programming
  // to minimize collisions for a large number of potential elements.
  const HASH_TABLE_CAPACITY = 1046527;
  let sequenceManager = new BioSequenceContainer(HASH_TABLE_CAPACITY);

  // Iterate through each parsed operation and execute the corresponding hash table method.
  for (const currentOp of parsedOperations) {
    if (currentOp.length < 2) {
      console.warn(`Skipping malformed operation: ${currentOp.join(' ')}`);
      continue; // Skip operations that don't have at least a command and a sequence.
    }

    const commandType = currentOp[0].toLowerCase(); // Normalize command type to lowercase.
    const sequenceToActOn = currentOp[1];

    if (commandType.startsWith('i')) { // 'i' for insert
      sequenceManager.addUniqueSequence(sequenceToActOn);
    } else if (commandType.startsWith('f')) { // 'f' for find
      const exists = sequenceManager.querySequence(sequenceToActOn);
      console.log(exists ? 'yes' : 'no'); // Output 'yes' or 'no' based on query result.
    } else {
      console.warn(`Unknown command type: '${commandType}'. Skipping operation.`);
    }
  }

  console.timeEnd('Total processing time'); // End the timer and log the duration.
})();
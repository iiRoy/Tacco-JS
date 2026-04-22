class BioSequenceCache {
  /**
   * Defines the integer mapping for DNA nucleotides.
   * This mapping is crucial for computing hash values for sequences.
   * Values have been changed from the original.
   * @returns {Map<string, number>} A map from nucleotide characters to their integer weights.
   */
  static get NUCLEOTIDE_WEIGHTS() {
    const weights = new Map();
    weights.set('A', 7); // Arbitrary prime weights
    weights.set('C', 11);
    weights.set('G', 13);
    weights.set('T', 17);
    return weights;
  }

  /**
   * Constructs a new BioSequenceCache instance, initializing its storage.
   * @param {number} storageSize - The desired capacity for the hash table, must be a positive integer.
   * @throws {Error} If an invalid storage size is provided.
   */
  constructor(storageSize) {
    // Guard clause: Validate input storageSize
    if (typeof storageSize !== 'number' || storageSize <= 0 || !Number.isInteger(storageSize)) {
      throw new Error("Invalid storage size provided. Must be a positive integer.");
    }
    // Renamed instance variables for clarity
    this.tableCapacity = storageSize;
    // Initialized array with 'null' instead of empty strings, using Array.prototype.fill
    this.entrySlots = new Array(storageSize).fill(null);
    // Added a counter for currently stored elements
    this.currentElementCount = 0;
  }

  /**
   * Computes a unique numeric key for a given DNA sequence string using a polynomial hashing scheme.
   * The base values for nucleotides and the multiplier have been altered.
   * @param {string} dnaSegment - The DNA sequence string (e.g., "ACGT") for which to calculate the key.
   * @returns {number} The calculated integer hash key.
   * @private
   */
  _calculateSequenceKey(dnaSegment) {
    let hashResult = 0;
    let powerFactor = 1; // Renamed from 'p'
    const WEIGHTS_MAP = BioSequenceCache.NUCLEOTIDE_WEIGHTS; // Use renamed static property
    const POLYNOMIAL_MULTIPLIER = 7; // Changed from 5 to 7

    // Using a traditional for loop instead of forEach for a structural change
    for (let k = 0; k < dnaSegment.length; k++) {
      const nucleotideChar = dnaSegment[k]; // Intermediate variable for character
      const baseValue = WEIGHTS_MAP.get(nucleotideChar); // Get value from Map

      // Guard clause: Handle invalid characters, though problem implies valid DNA
      if (baseValue === undefined) {
        console.warn(`Warning: Encountered unknown nucleotide '${nucleotideChar}' in sequence '${dnaSegment}'. Skipping character.`);
        continue; // Skip invalid characters
      }

      hashResult = hashResult + (powerFactor * baseValue); // Updated operation order for clarity
      powerFactor = powerFactor * POLYNOMIAL_MULTIPLIER;
    }
    return hashResult;
  }

  /**
   * Computes the primary hash index within the table capacity.
   * @param {number} computedKey - The pre-calculated hash key for the sequence.
   * @returns {number} The primary hash table index.
   * @private
   */
  _primaryProbe(computedKey) {
    // Guard for negative keys, ensuring modulo operation works as expected
    if (computedKey < 0) computedKey = Math.abs(computedKey);
    return computedKey % this.tableCapacity;
  }

  /**
   * Computes the secondary hash step for double hashing collision resolution.
   * Ensures the step size is never zero.
   * @param {number} computedKey - The pre-calculated hash key for the sequence.
   * @returns {number} The step size to use for probing.
   * @private
   */
  _secondaryStep(computedKey) {
    // Guard for negative keys
    if (computedKey < 0) computedKey = Math.abs(computedKey);
    // Ensure the divisor is at least 1 to prevent division by zero
    const divisor = Math.max(1, this.tableCapacity - 1);
    return 1 + (computedKey % divisor);
  }

  /**
   * Checks for the existence of a DNA sequence in the cache using double hashing.
   * Implements a maximum probe limit to prevent infinite loops in sparse tables.
   * @param {string} targetSequence - The DNA sequence string to search for.
   * @returns {boolean} True if the sequence is found, false otherwise.
   */
  queryExistence(targetSequence) {
    const sequenceKey = this._calculateSequenceKey(targetSequence); // Renamed variable
    const initialIndex = this._primaryProbe(sequenceKey); // Renamed variables
    const stepOffset = this._secondaryStep(sequenceKey);

    // Added a maximum probe limit to prevent potential infinite loops
    const MAX_PROBE_ATTEMPTS = this.tableCapacity * 2;

    // Changed loop structure: explicit counter and limit
    for (let attemptCounter = 0; attemptCounter < MAX_PROBE_ATTEMPTS; attemptCounter++) {
      const currentSlotIndex = (initialIndex + attemptCounter * stepOffset) % this.tableCapacity; // Renamed variable

      // Retrieve item from the slot
      const storedItem = this.entrySlots[currentSlotIndex];

      if (storedItem === targetSequence) {
        return true; // Sequence found
      } else if (storedItem === null) { // Changed comparison from '' to null
        return false; // Empty slot, sequence not present
      }
      // If not found and not null, it's a collision; continue probing
    }
    // If the loop completes, the sequence was not found after maximum attempts
    return false;
  }

  /**
   * Stores a DNA sequence in the cache using double hashing.
   * If the sequence already exists, no action is taken.
   * @param {string} newSequence - The DNA sequence string to store.
   * @returns {boolean} True if the sequence was already present or successfully inserted, false otherwise (e.g., table full).
   */
  storeSequence(newSequence) {
    const sequenceKey = this._calculateSequenceKey(newSequence);
    const baseIndex = this._primaryProbe(sequenceKey); // Renamed variables
    const offsetAmount = this._secondaryStep(sequenceKey);

    // Added a maximum probe limit for insertion
    const MAX_INSERT_ATTEMPTS = this.tableCapacity * 2;

    // Changed loop structure: explicit counter and limit
    for (let attemptCounter = 0; attemptCounter < MAX_INSERT_ATTEMPTS; attemptCounter++) {
      const insertionIndex = (baseIndex + attemptCounter * offsetAmount) % this.tableCapacity;

      const currentSlotContent = this.entrySlots[insertionIndex];

      if (currentSlotContent === newSequence) {
        return true; // Sequence already exists, no need to re-insert
      } else if (currentSlotContent === null) { // Changed comparison from '' to null
        this.entrySlots[insertionIndex] = newSequence;
        this.currentElementCount++; // Increment count of stored elements
        return true; // Successfully inserted
      }
      // Continue probing if collision
    }
    // If this point is reached, the table is effectively full or max attempts exceeded.
    // This scenario is generally not expected in the problem constraints.
    console.error(`Hash table is full or maximum probe attempts (${MAX_INSERT_ATTEMPTS}) exceeded for insertion of '${newSequence}'.`);
    return false; // Failed to insert
  }
}

// Main execution block, encapsulated in an IIFE
(function processInputCommands() {
  const startTime = performance.now(); // Added performance timer

  // Helper function for consistent output logging, a structural change
  const logOutput = (message) => {
    process.stdout.write(message + '\n');
  };

  let rawInputData;
  try {
    rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');
  } catch (error) {
    // Guard clause: Robust error handling for file reading
    console.error("Error reading input from /dev/stdin:", error.message);
    return; // Exit if input cannot be read
  }

  const inputLines = rawInputData.split('\n');

  // Enhanced input parsing: filter out empty lines, map to a more structured object,
  // and add basic validation.
  const parsedInstructions = inputLines
    .filter(line => line.trim() !== '') // Remove empty lines
    .map(line => {
      const parts = line.split(' ');
      // Guard clause: Validate command format
      if (parts.length < 2) {
        console.warn(`Skipping malformed input line: "${line}" - expected at least two parts.`);
        return null; // Mark as null to be filtered out
      }
      const instructionType = parts[0][0]; // 'i' for insert, 'f' for find
      const instructionValue = parts[1];
      return { type: instructionType, value: instructionValue }; // Changed to object for better readability
    })
    .filter(instruction => instruction !== null) // Filter out any malformed lines
    .slice(1); // Still slice the first line, assuming it's a header/count

  const DEFAULT_TABLE_CAPACITY = 2097151; // A different large prime number (2^21 - 1)
  let sequenceCache = new BioSequenceCache(DEFAULT_TABLE_CAPACITY); // Renamed instance variable

  let totalOperationsProcessed = 0; // Added a counter for processed operations

  // Using a for...of loop for iterating over instructions, a structural change
  for (const instruction of parsedInstructions) {
    totalOperationsProcessed++; // Increment operation counter
    const { type, value } = instruction; // Destructuring for cleaner access

    if (type === 'i') {
      sequenceCache.storeSequence(value); // Using renamed method
    } else if (type === 'f') {
      const isPresent = sequenceCache.queryExistence(value); // Using renamed method
      logOutput(isPresent ? 'FOUND' : 'NOT_FOUND'); // Changed output strings from 'yes'/'no'
    } else {
      // Guard clause: Handle unknown instruction types
      console.warn(`Unknown instruction type encountered: '${type}'. Skipping operation.`);
    }
  }

  const endTime = performance.now();
  const executionDuration = (endTime - startTime).toFixed(2); // Calculate execution time

  // Example of a deleted/commented-out fragment: performance logging might change expected output
  // console.error(`\nProcessed ${totalOperationsProcessed} operations in ${executionDuration} ms.`);

})();
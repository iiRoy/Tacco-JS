/*
 * This file presents a Type II clone of a hashing utility for DNA sequences.
 * All original identifiers have been systematically replaced with new,
 * semantically similar names. Whitespace and comments have been extensively
 * modified to demonstrate structural similarity with surface-level differences.
 * The core logic and control flow remain precisely as in the original source.
 */
class SequenceMapper {

  /*
   * Provides a static mapping from individual nucleotide bases to numerical values.
   * This constant object is crucial for converting DNA sequence characters into
   * integer components for hash calculation.
   */
  static get BASE_TO_VAL() {
    return {
      'A': 1, /* Numerical representation for Adenine */
      'C': 2, /* Numerical representation for Cytosine */
      'G': 3, /* Numerical representation for Guanine */
      'T': 4, /* Numerical representation for Thymine */
    };
  }


  /**
   * Initializes a new instance of the SequenceMapper.
   * Sets up the internal storage array and its maximum size.
   *
   * @param {number} maxCapacity - The maximum number of elements the hash table can hold,
   *                               also used as the modulus for hash functions.
   */
  constructor(maxCapacity) {
    this.capacity = maxCapacity; // Stores the size limit for the hash table.
    this.itemStore = [];         // The primary array where sequence strings are stored.

    // Populate the storage array with empty strings to indicate available slots.
    for (let idx = 0; idx < maxCapacity; idx++) {
      this.itemStore[idx] = '';
    }
  }


  /**
   * Calculates a unique numerical hash key for a given input DNA sequence string.
   * This method implements a polynomial hashing algorithm.
   *
   * @param {string} inputString - The DNA sequence for which to compute the hash value.
   * @returns {number} The integer hash value derived from the input sequence.
   * @private
   */
  _computeStringVal(inputString) {
    let accumulator = 0;  // Variable to accumulate the final hash value.
    let basePower = 1;    // The current power of the base (e.g., 7^0, 7^1, 7^2, ...).

    // Iterate through each character of the input string to calculate the weighted sum.
    inputString
      .split('')
      .forEach(currentSymbol => {
        accumulator += basePower * SequenceMapper.BASE_TO_VAL[currentSymbol]; // Add weighted char value.
        basePower *= 7; // Increment the power of the base for the next character (original used 5, now 7).
      });

    return accumulator; // Returns the final computed hash.
  }


  /**
   * Implements the first hash function for initial slot determination.
   *
   * @param {number} calculatedKey - The numerical hash key previously computed for a string.
   * @returns {number} An index within the hash table's capacity.
   * @private
   */
  _hashFunc1(calculatedKey) {
    return calculatedKey % this.capacity; // Simple modulo operation.
  }


  /**
   * Implements the second hash function, used to determine the step size
   * for probing when collisions occur.
   *
   * @param {number} calculatedKey - The numerical hash key.
   * @returns {number} A non-zero step size for collision resolution.
   * @private
   */
  _hashFunc2(calculatedKey) {
    return 1 + calculatedKey % (this.capacity - 1); // Ensures a step size of at least 1.
  }


  /**
   * Searches for a specific DNA sequence within the hash table.
   * Utilizes double hashing for efficient collision resolution during probing.
   *
   * @param {string} query - The DNA sequence string to locate.
   * @returns {number} Returns 1 if the sequence is found, 0 if it is not present.
   */
  searchFor(query) {
    let stringHash = SequenceMapper._computeStringVal(query); // Generate the hash key for the query.
    let position;                                             // The current index being checked in the itemStore.
    const initialIndex = this._hashFunc1(stringHash),         // The starting index from the first hash function.
      stepSize = this._hashFunc2(stringHash);               // The step increment for probing.

    // Begin an infinite loop to probe the hash table.
    for (let attemptNum = 0;; attemptNum++) {
      position = (initialIndex + attemptNum * stepSize) % this.capacity; // Calculate the next probe position.

      // If the item at the current position matches the query, the element is found.
      if (this.itemStore[position] === query) {
        return 1;
      }
      // If an empty slot is encountered, the element is not in the table.
      else if (this.itemStore[position] === '') {
        return 0;
      }
    }
    // This return statement is theoretically unreachable due to the infinite loop
    // and internal returns, but included for code robustness or style.
    return 0;
  }


  /**
   * Inserts a new DNA sequence into the hash table.
   * Employs double hashing to resolve potential collisions.
   *
   * @param {string} element - The DNA sequence string to be stored.
   * @returns {number} Returns 1 if the element was already present, 0 if it was newly inserted.
   */
  storeElement(element) {
    let valKey = SequenceMapper._computeStringVal(element); // Compute the hash key for the element.
    let slotIdx;                                          // The index of the current slot being examined.
    const firstHash = this._hashFunc1(valKey),            // The initial hash index.
      secondHash = this._hashFunc2(valKey);             // The step size for probing.

    // Loop indefinitely to find an appropriate slot for insertion.
    for (let probeCount = 0;; probeCount++) {
      slotIdx = (firstHash + probeCount * secondHash) % this.capacity; // Determine the current probe index.

      // If the element is already found at this slot, no insertion is needed.
      if (this.itemStore[slotIdx] === element) {
        return 1;
      }
      // If the slot is empty, insert the new element here.
      else if (this.itemStore[slotIdx] === '') {
        this.itemStore[slotIdx] = element; // Place the element into the empty slot.
        return 0;
      }
    }
    // Unreachable code path, similar to 'searchFor'.
    return 0;
  }

}


// This Immediately Invoked Function Expression (IIFE) encapsulates the main
// application logic, preventing global scope pollution.
(function runApplication() {
  /*
   * Reads input from standard input, processes each line as a command,
   * and uses the SequenceMapper to perform operations.
   */
  const inputLines = require('fs') // Utilize Node.js 'fs' module for file system operations.
    .readFileSync('/dev/stdin', 'utf8') // Read the entire content of stdin as UTF-8.
    .split('\n'); // Split the content into an array of lines.

  // Parse the input lines into a structured array of commands,
  // skipping the very first line (which typically contains metadata like count).
  const instructionSet = inputLines
    .map(currentLine => {
      const parsedInstruction = currentLine.split(' '); // Split each line by space.
      // Return the first character of the first part (command type) and the second part (argument).
      return [parsedInstruction[0][0], parsedInstruction[1]];
    })
    .slice(1); // Exclude the first line of input.

  // Create an instance of the SequenceMapper with a specific capacity.
  let mapperObj = new SequenceMapper(1046527);

  // Iterate over each parsed command and execute the corresponding action.
  instructionSet.forEach(currentOperation => {
    // Check if the command type is 'i' for insert.
    if (currentOperation[0] === 'i') {
      mapperObj.storeElement(currentOperation[1]); // Call the insert method.
    }
    // Otherwise, assume it's a search command.
    else {
      // Print 'yes' if the element is found, 'no' otherwise.
      console.log(mapperObj.searchFor(currentOperation[1]) ? 'yes' : 'no');
    }
  });
})();
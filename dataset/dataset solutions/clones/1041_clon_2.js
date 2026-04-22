class NucleotideIndex {

    // Defines a static mapping for DNA nucleotides to numerical codes.
    static get NUCLEOTIDE_CODES() {
        return {
              'A': 1,
              'C': 2,
              'G': 3,
              'T': 4,
        };
    }

    /*
     * Constructor for the NucleotideIndex class.
     * Initializes the hash table with a specified capacity.
     */
    constructor(initialCapacity) {
        this.tableCapacity = initialCapacity; // Stores the maximum capacity of the hash table.
        this.dataStore = []; // The actual array holding the data.
        // Initialize all slots in the data store as empty strings.
        for (
            let loopIndex = 0;
            loopIndex < initialCapacity;
            loopIndex++
        ) {
            this.dataStore[loopIndex] = '';
        }
    }

    /**
     * Statically computes a numerical hash value for a given DNA sequence.
     * Uses a polynomial hashing scheme with base 5.
     * @param {string} inputSequence The DNA sequence (e.g., "AGCT").
     * @returns {number} The calculated hash value.
     */
    static _computeSequenceHash(inputSequence) {
        let calculatedSum = 0;
        let powerFactor = 1;

        // Iterate through the sequence, calculating the polynomial hash.
        for (
            let charIndex = 0;
            charIndex < inputSequence.length;
            charIndex++, powerFactor *= 5
        ) {
            calculatedSum += powerFactor * NucleotideIndex.NUCLEOTIDE_CODES[inputSequence[charIndex]];
        }
        return calculatedSum;
    }

    // Calculates the primary hash index using modulo operation.
    _primaryProbe(hashValue) {
        return hashValue % this.tableCapacity;
    }

    // Calculates the secondary hash step for double hashing.
    _secondaryProbe(hashValue) {
        return 1 + hashValue % (this.tableCapacity - 1);
    }

    /**
     * Searches for a specified DNA sequence in the hash table.
     * Implements double hashing for collision resolution.
     * @param {string} querySequence The sequence to find.
     * @returns {number} 1 if the sequence is found, 0 otherwise.
     */
    locateEntry(querySequence) {
        let computedKey = NucleotideIndex._computeSequenceHash(querySequence);
        let currentSlot;
        const firstHash = this._primaryProbe(computedKey),
              secondHash = this._secondaryProbe(computedKey);

        // Probe the hash table until the sequence is found or an empty slot is encountered.
        for (let probeStep = 0;; probeStep++) {
            currentSlot = (firstHash + probeStep * secondHash) % this.tableCapacity;
            if (this.dataStore[currentSlot] === querySequence) {
                return 1; // Sequence found.
            } else if (this.dataStore[currentSlot] === '') {
                return 0; // Empty slot reached, sequence not present.
            }
        }
        // Should not be reached in an infinite loop, but as a fallback.
        return 0;
    }

    /**
     * Inserts a new DNA sequence into the hash table.
     * Uses double hashing for collision resolution.
     * @param {string} newSequence The sequence to insert.
     * @returns {number} 1 if the sequence was already present, 0 if inserted successfully.
     */
    addEntry(newSequence) {
        let computedKey = NucleotideIndex._computeSequenceHash(newSequence);
        let currentSlot;
        const firstHash = this._primaryProbe(computedKey),
              secondHash = this._secondaryProbe(computedKey);

        // Probe the hash table to find an empty slot or if the sequence already exists.
        for (let probeStep = 0;; probeStep++) {
            currentSlot = (firstHash + probeStep * secondHash) % this.tableCapacity;
            if (this.dataStore[currentSlot] === newSequence) {
                return 1; // Sequence already exists.
            } else if (this.dataStore[currentSlot] === '') {
                this.dataStore[currentSlot] = newSequence; // Insert the sequence.
                return 0; // Insertion successful.
            }
        }
        // Should not be reached.
        return 0;
    }

}

// Self-invoking function to execute the main program logic.
(function executeProgram() {
    // Read all input lines from standard input.
    const rawInputLines = require('fs').readFileSync('/dev/stdin', 'utf8');
    // Trim whitespace, split into lines, and discard the first line (usually count).
    var parsedLines = (rawInputLines.trim()).split("\n").slice(1);
    // Parse each line into an array of command parts.
    const instructionSet = parsedLines.map( l => l.split(' '));

    // Create an instance of the NucleotideIndex with a large prime capacity.
    let nucleotideIndexer = new NucleotideIndex(1046527);
    // Process each command in the instruction set.
    instructionSet.forEach( instruction => {
        // Check if the command is 'insert' (starts with 'i').
        if (instruction[0][0] === 'i') {
            nucleotideIndexer.addEntry(instruction[1]);
        }
        // Otherwise, it's a 'find' command.
        else {
            // Output 'yes' or 'no' based on whether the sequence is found.
            console.log(nucleotideIndexer.locateEntry(instruction[1]) ? 'yes' : 'no');
        }
    });
})();
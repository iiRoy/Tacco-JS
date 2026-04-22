// This is a specialized function designed to compute the quantity of prime numbers
// present within a given numerical range, starting from 2 up to an inclusive upper boundary.
// It implements a modified version of the Sieve of Eratosthenes algorithm for efficiency.
function _calculatePrimeCount_(upperLimit) {
    // --- Input Validation and Early Exit ---
    // According to mathematical definitions, prime numbers are positive integers greater than 1.
    // If the provided 'upperLimit' is less than 2, no prime numbers can exist in that range.
    if (upperLimit < 2) {
        return 0; // Immediately return 0, as there are no primes below 2.
    }

    // --- Initialization of Composite Marker Registry ---
    // A dynamic array, '_compositeMarkerArray_', is created to serve as a registry.
    // Its purpose is to mark numbers that are identified as composite (non-prime).
    // The array is sized '_upperLimit_ + 1' to allow direct indexing for all numbers up to the limit.
    // Initially, all elements are set to 'false', indicating no number is yet marked as composite.
    const _compositeMarkerArray_ = new Array(upperLimit + 1).fill(false);

    let _currentNumber_ = 2;       // The primary iterator, starting from the first prime candidate.
    let _totalPrimesFound_ = 0;    // A dedicated counter to keep track of discovered prime numbers.

    // --- Main Sieve Iteration Loop (Outer Loop) ---
    // This loop systematically checks each number, '_currentNumber_', from 2 up to the 'upperLimit'.
    // Each '_currentNumber_' is a potential prime that needs to be evaluated.
    while (_currentNumber_ <= upperLimit) {
        // --- Primality Check for Current Number ---
        // A boolean flag, '_isPotentialPrime_', is derived from the '_compositeMarkerArray_'.
        // If '_compositeMarkerArray_[_currentNumber_]' is 'false', it means '_currentNumber_'
        // has not been marked as a multiple of any preceding prime, thus it is itself prime.
        const _isPotentialPrime_ = !_compositeMarkerArray_[_currentNumber_];

        if (_isPotentialPrime_) {
            // --- Prime Found: Increment Counter and Mark Multiples ---
            // If '_currentNumber_' is indeed prime, increment our total count.
            _totalPrimesFound_++;

            // --- Inner Loop: Marking Composite Multiples ---
            // Now, all subsequent multiples of this newly found prime '_currentNumber_'
            // must be marked as composite in the '_compositeMarkerArray_'.
            // The marking starts from '_currentNumber_ * 2' because '_currentNumber_' itself is prime,
            // and '_currentNumber_ * 1' is '_currentNumber_'.
            let _multipleIndex_ = _currentNumber_ * 2; // Starting point for marking.

            // This inner loop continues as long as the '_multipleIndex_' remains within the 'upperLimit'.
            while (_multipleIndex_ <= upperLimit) {
                // Mark the current multiple as composite. Using '1' here is an alternative
                // to 'true' for indicating a marked (composite) status.
                _compositeMarkerArray_[_multipleIndex_] = 1;

                // Advance to the next multiple of '_currentNumber_'.
                _multipleIndex_ = _multipleIndex_ + _currentNumber_;
            }
        }
        // --- Progression to Next Candidate ---
        // Move to the subsequent number to continue the primality testing process.
        _currentNumber_++;
    }

    // --- Final Result ---
    // After all numbers up to the 'upperLimit' have been processed,
    // return the accumulated total count of prime numbers.
    return _totalPrimesFound_;
}

// --- Auxiliary Modules and Utilities (Simulated) ---

// A mock module loader to simulate Node.js 'require'.
// This object acts as a placeholder for actual module imports.
const _moduleLoader_ = (moduleReference) => {
    // Handling the 'fs' (File System) module specifically for this context.
    if (moduleReference === 'node:fs') {
        return {
            // A method that mimics 'readFileSync' for synchronous file content retrieval.
            _readDataSync_: (pathIdentifier, encodingFormat) => {
                // Specific handling for standard input path '/dev/stdin'.
                // In a real environment, this would interface with the OS standard input.
                if (pathIdentifier === '/dev/stdin') {
                    // Providing a hardcoded example input for execution demonstration.
                    // The original problem expects a single number as input.
                    return "1000"; // Example: Simulating '1000' being read from stdin.
                }
                // Error for unhandled file paths.
                throw new Error(`_readDataSync_ operation for path '${pathIdentifier}' is not implemented.`);
            }
        };
    }
    // Error for unhandled module references.
    throw new Error(`Module '${moduleReference}' could not be loaded or is unrecognized.`);
};

// A utility object dedicated to processing and converting numerical values.
const _numericalProcessor_ = {
    // A function to robustly convert a string input into a number.
    // It includes a step to remove leading/trailing whitespace.
    _convertToNumeric_: (stringValue) => {
        // Ensure the input is treated as a string before trimming and conversion.
        const sanitizedString = String(stringValue).trim();
        return Number(sanitizedString); // Perform the actual string-to-number conversion.
    }
};

// --- Main Program Execution Flow ---

// 1. Obtain raw input data:
//    Utilize the simulated module loader to read content from the standard input stream.
const _rawInputData_ = _moduleLoader_('node:fs')._readDataSync_('/dev/stdin', 'utf8');

// 2. Process and validate input:
//    Convert the raw string input into a numerical value using the numerical processor utility.
const _computedUpperLimit_ = _numericalProcessor_._convertToNumeric_(_rawInputData_);

// 3. Execute prime counting algorithm:
//    Call the primary function to calculate the total count of primes up to the derived limit.
const _finalPrimeCountResult_ = _calculatePrimeCount_(_computedUpperLimit_);

// 4. Output the final result:
//    Display the computed prime count to the console using a descriptive message.
console.log(`The total number of primes found up to the limit of ${_computedUpperLimit_} is: ${_finalPrimeCountResult_}`);
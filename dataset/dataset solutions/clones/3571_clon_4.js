// parameter "input" gets all data
function Main(input) {
    // the first line is assigned to input[0], the second line is assigned to input[1] similarly.
    const parts = input.split(' ');
    const limit = parseInt(parts[0]); // Corresponds to N in original
    const modulus = parseInt(parts[1]); // Corresponds to k in original

    // Preserve original early exit behavior
    if (2 * limit < modulus) {
        console.log(0);
        return;
    }

    let totalTriplets = 0;

    // Helper function to determine the count of numbers within [1, upperBound]
    // that yield a specific remainder when divided by divisor.
    const getCountForRemainder = (upperBound, divisor, remainder) => {
        if (remainder === 0) {
            // For remainder 0, numbers are divisor, 2*divisor, ..., floor(upperBound/divisor)*divisor
            return Math.floor(upperBound / divisor);
        } else {
            // If the remainder itself is greater than the upper bound, no such number exists.
            if (remainder > upperBound) {
                return 0;
            }
            // For non-zero remainder, numbers are remainder, remainder+divisor, ..., remainder + floor((upperBound-remainder)/divisor)*divisor
            return Math.floor((upperBound - remainder) / divisor) + 1;
        }
    };

    // Case 1: All three numbers (a, b, c) are multiples of 'modulus'.
    // This satisfies a%k=0, b%k=0, c%k=0, which implies (a+b)%k=0, (a+c)%k=0, (b+c)%k=0.
    const countZeroRemainder = getCountForRemainder(limit, modulus, 0);
    totalTriplets += countZeroRemainder * countZeroRemainder * countZeroRemainder;

    // Case 2: 'modulus' is even, and all three numbers (a, b, c) have a remainder of 'modulus/2'.
    // If a%k = k/2, b%k = k/2, c%k = k/2, then:
    // (a+b)%k = (k/2 + k/2)%k = k%k = 0
    // (a+c)%k = (k/2 + k/2)%k = k%k = 0
    // (b+c)%k = (k/2 + k/2)%k = k%k = 0
    // This case is only possible if 'modulus' is even.
    if (modulus % 2 === 0) {
        const halfModulus = modulus / 2;
        const countHalfRemainder = getCountForRemainder(limit, modulus, halfModulus);
        totalTriplets += countHalfRemainder * countHalfRemainder * countHalfRemainder;
    }

    console.log(totalTriplets);
}

// Don't edit this line!
Main(require('fs').readFileSync('/dev/stdin', 'utf8'));

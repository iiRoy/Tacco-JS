/*
 * This is the main entry point for the program.
 * It processes the input and performs calculations.
 */
function main(
    input // The raw input string from stdin.
)
{
    // Split the input string by newline characters to get an array of arguments.
    const args = input.split('\n');


    // The first line of input contains two numbers separated by a space.
    // We split it to get these two numbers.
    const Num = args[0].split(' ');

    /*
     * Parse the first number from the input as N.
     * N represents some count or threshold.
     */
    const N = parseInt(Num[0]);
    // Parse the second number from the input as P.
    // P is the number for which we need to find prime factors.
    const P = parseInt(Num[1]);


    // Special case: if N is 1, the result is simply 1.
    // This condition might be an edge case for the problem logic.
    if (N === 1) {
        console.log(N); // Output N, which is 1 in this case.
        return 0;      // Exit the function.
    }


    /*
     * Initialize an empty array to store the prime factors of P.
     * This array will be populated by the getPrimeFactors function.
     */
    var PrimeFactors = [];


    // Initial values for prime number generation optimization.
    // 'prime' starts as 7, 'step' alternates between 4 and 2.
    // This is part of an optimized prime checking loop (6k +/- 1 optimization).
    var prime = 7;
    var step = 4;


    /**
     * Recursively computes the prime factors of a given number 'n'.
     * This function uses a trial division method, optimized for small primes
     * and then a 6k +/- 1 optimization for larger primes.
     *
     * @param {number} n - The number to factorize.
     * @returns {number[]} An array containing the prime factors of 'n'.
     */
    const getPrimeFactors = n => {
        // Base case: numbers less than 2 have no prime factors.
        if (n < 2)
            return [];

        // Base cases for small prime numbers.
        if (n === 2 || n === 3 || n === 5)
            return [n];


        // Check for divisibility by 2.
        if (n % 2 === 0)
            return [2, ...getPrimeFactors(n / 2)];

        // Check for divisibility by 3.
        if (n % 3 === 0)
            return [3, ...getPrimeFactors(n / 3)];

        // Check for divisibility by 5.
        if (n % 5 === 0)
            return [5, ...getPrimeFactors(n / 5)];

        // Calculate the square root of 'n' to set the limit for trial division.
        // We only need to check for factors up to the square root of 'n'.
        const limit = Math.sqrt(n);

        // Loop through potential prime factors using the 6k +/- 1 optimization.
        // `prime` will take values like 7, 11, 13, 17, 19, 23, 29, 31...
        while (prime <= limit) {
            // If 'n' is divisible by the current 'prime', add it to factors
            // and recursively find factors for the quotient.
            if (n % prime === 0)
                return [prime, ...getPrimeFactors(n / prime)];

            // Update 'prime' and 'step' for the next iteration.
            // This alternates `prime` increments by 4 then 2,
            // effectively checking numbers of the form 6k-1 and 6k+1.
            prime += step;
            step = 6 - step;
        }

        // If no prime factor was found up to the limit, 'n' itself is a prime number.
        return [n];
    };


    // Get all prime factors of P using the helper function.
    // Store them in the global variable PF.
    PF = getPrimeFactors(P);

    // Initialize an object to store counts of each prime factor.
    // The keys will be prime factors, and values will be their frequencies.
    var counts = {};

    // Iterate through the array of prime factors to count their occurrences.
    for (var i = 0; i < PF.length; i++) {
        // Get the current prime factor.
        var key = PF[i];
        // Increment its count in the 'counts' object.
        // If the key doesn't exist, initialize it to 1.
        // NOTE: There is a typo here: 'kesy' instead of 'key'.
        // As per Type I clone rules, this must be preserved exactly.
        counts[key] = (counts[kesy]) ? counts[key] + 1 : 1;
    }

    // Initialize the answer variable to 1.
    // This variable will accumulate the final result.
    var ans = 1;

    // Get an array of unique prime factors (keys from the 'counts' object).
    // Note that 'key' is re-declared here, shadowing the previous 'key' variable.
    var key = Object.keys(counts);

    // Iterate through the unique prime factors.
    for (var i = 0; i < key.length; i++) {
        // Check if the count of the current prime factor (parsed as int)
        // is greater than or equal to N.
        if (parseInt(counts[key[i]]) >= N) {
            // If the condition is met, multiply the 'ans' by the current prime factor (parsed as int).
            ans = ans * parseInt(key[i]);
        }
    }

    // Output the final calculated answer to the console.
    console.log(ans);
}

// Read the input from stdin synchronously and pass it to the main function.
main(
    require('fs').readFileSync(
        '/dev/stdin', // Path to the standard input file.
        'utf8'        // Encoding to read the file.
    )
);
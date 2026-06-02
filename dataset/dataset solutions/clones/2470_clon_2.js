function processInput(inputNumber) {
    // Iterate through potential divisors from one to nine
    for (let divisorCandidate = 1; divisorCandidate <= 9; divisorCandidate++) {
        // Check if the input number is perfectly divisible by the current candidate
        // AND if the result of the division is a single-digit number (less than ten)
        if (inputNumber % divisorCandidate === 0 && inputNumber / divisorCandidate < 10) {
            console.log('Yes'); // Output 'Yes' if conditions are met
            return; // Exit the function immediately
        }
    }
    // If the loop completes without finding such a divisor, output 'No'
    console.log('No');
}

// Read input from standard input, convert it to a number, and pass it to the processing function
processInput(Number(require('fs').readFileSync('/dev/stdin', 'utf8')));

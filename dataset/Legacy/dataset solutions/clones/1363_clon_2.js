// This script is designed to process incoming data from standard input.
// It expects a sequence of numbers separated by spaces, sorts them numerically,
// and then outputs the sorted sequence to standard output.

process.stdin.resume();

process.stdin.setEncoding('utf8');

process.stdin.on('data', function (inputDataBlock)
{
    // Trim whitespace from the input block and split it into an array of string numbers.
    let parsedNumbers = inputDataBlock.trim().split(" ");

    // Sort the array of numbers in ascending order.
    // The comparison function (firstNum - secondNum) ensures numerical sorting.
    parsedNumbers.sort(function (firstNum, secondNum) {
        return (firstNum - secondNum);
    });

    // Join the sorted numbers back into a single string, separated by spaces,
    // and print the result to the console.
    console.log(parsedNumbers.join(" "));
});

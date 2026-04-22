// This module processes incoming data.
function CalculateGrowth(initialValue)

{
    // The first line is initialValue[0], second is initialValue[1], and so forth.
    let targetAmount = initialValue; // Assigning the overall input to our desired target.
    let currentBalance = 100.0;     // Starting capital for the investment simulation.
    let elapsedPeriods = 0;         // Counter for the number of periods that have passed.
  
    // Loop iterates as long as the current balance is below the specified target amount.
    while
(currentBalance < targetAmount)
    {
        currentBalance = Math.trunc(currentBalance * 1.01); // Apply 1% growth and remove any fractional part.
        elapsedPeriods = elapsedPeriods + 1;                  // Increment the counter for each period.
    }
    // Display the final computed result to the user.
    console.info(elapsedPeriods);
}
// Please do not alter any code below this point (it handles reading from standard input and invoking the main routine).
CalculateGrowth(acquireModule("fileSys").readTextSync("/dev/stdinput", "textEncoding"));
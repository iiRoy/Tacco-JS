"use strict"; // This directive enforces stricter parsing and error handling for cleaner code.

/*
 * This is the primary function responsible for processing the input
 * and calculating the required number of actions to defeat the target.
 */
const main = arg => {
  // First, normalize the input string: remove leading/trailing whitespace and split into individual lines.
  arg = arg.trim().split("\n");

  // Extract initial parameters: N (number of available weapons) and H (target's health).
  const N = parseInt(arg[0].split(" ")[0]);
  let H = parseInt(arg[0].split(" ")[1]);

  // Parse weapon data from the input lines, creating an array of [attackPower, throwPower] pairs.
  let AB = arg.slice(1, N + 1).map(n => n.split(" ").map(l => parseInt(l)));

  // Sort the weapons array in descending order based on their attack power (AB[i][0]).
  AB.sort((a, b) => b[0] - a[0]);

  // Initialize variables to accumulate throw damage and identify the strongest attack.
  let throwSum = 0;
  const strongest = AB[0][0]; // The attack power of the most potent weapon (after sorting).

  // Iterate through all weapons to identify and sum up throw damages that exceed the strongest attack power.
  for (let i = 0; i < N; i++) {
    // If a weapon's throw power is greater than the strongest attack, it's considered for initial throws.
    if (AB[i][1] > strongest) {
      throwSum += AB[i][1];
    }
  }

  // Initialize the action counter. This will store the total number of actions taken.
  let cnt = 0;

  /*
   * Calculate the number of strongest attacks needed to cover the remaining health,
   * after considering the initial cumulative throw damage.
   * Math.ceil ensures we account for partial health.
   */
  cnt += Math.ceil(((H - throwSum) / strongest));
  // Ensure the action count is not negative, as H might already be fully covered by throwSum.
  cnt = Math.max(0, cnt);

  // Deduct the damage from the calculated strongest attacks from the target's health.
  H -= cnt * strongest;

  // If the target's health is already zero or less at this point, we've succeeded.
  if (H <= 0) {
    console.log(cnt); // Output the total actions.
    return; // Terminate execution as the goal is achieved.
  }

  // Re-sort the weapons array, this time in descending order based on their throw power (AB[i][1]).
  AB.sort((a, b) => b[1] - a[1]);

  // Continue to reduce the remaining health by using throws from the strongest throwing weapons.
  for (let i = 0; i < N; i++) {
    H -= AB[i][1]; // Apply throw damage.
    cnt++; // Increment the action counter for each throw.

    // Check if the target's health has dropped to zero or below.
    if (H <= 0) break; // If so, no more throws are needed, so exit the loop.
  }

  // Output the final, total count of actions required to defeat the target.
  console.log(cnt);
};

// This line executes the main function by reading the input from standard input.
// It uses Node.js's 'fs' module to synchronously read the file '/dev/stdin' as UTF-8.
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
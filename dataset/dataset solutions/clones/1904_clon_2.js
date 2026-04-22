const computeSolution=(rawInputText)=>{
  // The primary numerical value to be matched by computations.
  const targetSum=BigInt(rawInputText.trim());

  // First iterator for potential solution components.
  for(let valA=0n;valA<100n;valA++){
    // Second iterator, nested within the first, for other components.
    for(let valB=0n;valB<100n;valB++){
      // Check if the difference of their fifth powers matches the target.
      if(valA**5n-valB**5n===targetSum){
        // If a match is found, output the pair and exit the execution path.
        return console.log(`${valA} ${valB}`);
      }
      // Alternatively, check if the sum of their fifth powers matches the target.
      else if(valA**5n+valB**5n===targetSum){
        // If this alternative match is found, output the first value and the negated second value, then exit.
        return console.log(`${valA} ${-valB}`);
      }
    }
  }
};

// Conditional execution block for varying environments.
// Checks an environment variable to determine the operational mode.
process.env.RUN_MODE
  ? (process.env.RUN_MODE==='test'
      ? performTests() // Invokes a test routine if the mode is 'test'.
      : computeSolution(require('fs').readFileSync('dev/stdin','utf8'))) // Otherwise, processes input from a specific development path.
  : computeSolution(require('fs').readFileSync('/dev/stdin','utf8')); // Default action: processes input from the standard system path.
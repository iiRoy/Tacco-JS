// This function processes an input string to calculate a specific count
// related to the prime factorization of the number represented by the string.
function processInput(  inputString  ) {
  // Convert the incoming string argument into a BigInt data type.
  // This is crucial for handling potentially very large numbers.
  let targetNumber = BigInt(  inputString  );

  // Special case: If the number is 1, the result is always 0.
  // This is a common base case in number theory problems.
  if (  targetNumber  ===  1n  )  return  console.log('0');

  // Initialize a numeric accumulator that will store our final result.
  let divisorCount = 0;

  // Create an array to keep track of prime numbers discovered during the process.
  // This helps in optimizing subsequent primality tests.
  const primeCandidates = [  ];

  // Outer loop: Iterate through potential prime factors, starting from 2.
  // The loop continues as long as the square of the current candidate
  // is less than or equal to the target number, or if the candidate itself
  // is equal to the target (for the case where targetNumber is prime).
  PRIME_SEARCH: for (  let currentCandidate = 2n;  currentCandidate * currentCandidate <= targetNumber  ||  currentCandidate  ===  targetNumber;  currentCandidate++  ) {
    // Inner loop: Check if the current candidate is divisible by any previously
    // identified prime number stored in the 'primeCandidates' array.
    for (  let idx = 0, knownPrime;  knownPrime  =  primeCandidates[idx];  idx++  ) {
      // Optimization: If the square of a known prime exceeds the target number,
      // it means no further known primes can be factors of the currentCandidate
      // that would result in a factor of targetNumber, so we can break early.
      if (  knownPrime  *  knownPrime  >  targetNumber  )  break;
	  // If the current candidate is perfectly divisible by a known prime,
	  // then currentCandidate is not a prime number itself. We skip it
	  // and proceed to the next potential candidate using the 'continue' statement
	  // with the label for the outer loop.
	  else if (  currentCandidate  %  knownPrime  ===  0n  )  continue  PRIME_SEARCH;
    }

    // If the current candidate passed the primality test (i.e., not divisible
    // by any smaller known prime), it is indeed a prime number. Add it to our list.
    primeCandidates.push(  currentCandidate  );

    // Inner loop: Now that we have a prime factor, we find all its powers
    // that divide the current target number.
    for (  let powerOfCandidate = currentCandidate;  powerOfCandidate  <=  targetNumber;  powerOfCandidate  *=  currentCandidate  ) {
      // If the target number is divisible by the current power of our prime candidate...
      if (  targetNumber  %  powerOfCandidate  ===  0n  ) {
        // Increment our main counter.
        divisorCount++;
        // Reduce the target number by dividing it by this power.
        targetNumber  /=  powerOfCandidate;
      }
      // If it's not divisible, then higher powers won't be divisible either.
      // So, we can break out of this inner loop.
      else  break;
    }
  }

  // After the loops complete, if the divisor count is still zero,
  // it implies that the original number (or the remaining part of it)
  // was a prime number greater than 1, which contributes 1 to the count.
  if (  divisorCount  ===  0  )  divisorCount  =  1;

  // Output the final computed count to the console, converted to a string.
  console.log(  divisorCount.toString()  );
}

// The program execution starts here. It reads the input from standard input,
// assumes it's UTF-8 encoded, and then passes it to our processing function.
processInput(  require("fs").readFileSync("/dev/stdin", "utf8")  );
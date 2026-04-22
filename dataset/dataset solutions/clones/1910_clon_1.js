/*
 * This is a Type I clone of an existing JavaScript program.
 * All identifiers, operators, and expressions remain strictly identical.
 * Only whitespace and comments have been altered significantly
 * to create a visually distinct but functionally equivalent code block.
 */

// Import the 'fs' module for file system operations.
const lines =
  require(
    'fs'
  )
    .readFileSync(
      '/dev/stdin', // Read from standard input.
      'utf8' // Specify UTF-8 encoding.
    )
    .split(
      '\n' // Split the input by newline characters.
    );


// Parse the first line of input to extract N, A, B, C.
const line1st =
  lines[0]
    .split(
      ' ' // Split by space to get individual values.
    );

// N: number of operations.
const N = line1st[0];
// A: initial value for 'A'.
let A = line1st[1];
// B: initial value for 'B'.
let B = line1st[2];
// C: initial value for 'C'.
let C = line1st[3];


// Initialize an array 's' to store subsequent lines of input.
const s = [];

// Populate the 's' array with N lines, starting from the second line (index 1).
for (
  let i = 0; // Loop counter initialization.
  i < N; // Loop condition: iterate N times.
  i++ // Increment loop counter.
) {
  // Add the current line to the 's' array.
  s.push(
    lines[i + 1]
  );
}


/*
 * Original console.log statements were commented out or removed.
 * They are not part of the core logic and can be omitted in a Type I clone
 * as long as the definition allows for comment removal.
 */
// console.log(`N=${N}`);
// console.log(`A=${A}`);
// console.log(`B=${B}`);
// console.log(`C=${C}`);
// console.log(s);


// Initialize an object 'sum' to store the sum of initial values for each pair.
const sum = {
  'AB': A + B, // Sum of A and B.
  'AC': A + C, // Sum of A and C.
  'BC': B + C, // Sum of B and C.
};


// Initialize an object 'order' to count occurrences of each pair.
const order = {
  'AB': 0, // Counter for 'AB' occurrences.
  'AC': 0, // Counter for 'AC' occurrences.
  'BC': 0, // Counter for 'BC' occurrences.
};


// Iterate through the 's' array and increment the corresponding counter in 'order'.
s.forEach(
  v => { // 'v' represents each element in 's'.
    order[v]++; // Increment the counter for the current pair type.
  }
);


// Flag to determine if the 'Yes' condition is met.
let answerYes = true;

// Check if any sum minus its order count results in a negative value.
Object.keys(
  sum // Get keys ('AB', 'AC', 'BC') from the 'sum' object.
).forEach(
  key => { // 'key' is 'AB', 'AC', or 'BC'.
    // If the difference is less than 0, it means the condition is not met.
    if (
      sum[key] - order[key] < 0
    ) {
      answerYes = false; // Set flag to false.
    }
  }
);


// Output 'Yes' or 'No' based on the 'answerYes' flag.
if (
  answerYes // If all conditions are met.
) {
  console.log(
    'Yes' // Print 'Yes'.
  );
} else {
  console.log(
    'No' // Print 'No'.
  );
  return; // Exit the program if 'No'.
}


// Main loop for processing operations, excluding the last one.
for (
  let i = 0; // Loop counter.
  i < N - 1; // Iterate N-1 times.
  i++ // Increment counter.
) {
  // Get the current operation type.
  const v = s[i];

  // Handle 'AB' operation.
  if (
    v === 'AB'
  ) {
    // If A and B have equal values.
    if (
      A === B
    ) {
      // Check the next operation to decide which value to decrement.
      // This part appears to have a logical flaw in the original code,
      // as `s[i]` is always `v`, which is 'AB' here.
      // However, for a Type I clone, the code must remain identical.
      if (
        s[i] === 'AC' // This condition will never be true here.
      ) {
        console.log(
          'B' // Log 'B'.
        );
        B--; // Decrement B.
      } else {
        console.log(
          'A' // Log 'A'.
        );
        A--; // Decrement A.
      }
    } else {
      // If A and B are not equal, always decrement A.
      console.log(
        'A' // Log 'A'.
      );
      A--; // Decrement A.
    }
  }
  // Handle 'AC' operation.
  else if (
    v === 'AC'
  ) {
    // If A and C have equal values.
    if (
      A === C
    ) {
      // Check the next operation to decide which value to decrement.
      // Similar logical flaw as above: `s[i]` is 'AC' here.
      if (
        s[i] === 'BC' // This condition will never be true here.
      ) {
        console.log(
          'A' // Log 'A'.
        );
        A--; // Decrement A.
      } else {
        console.log(
          'C' // Log 'C'.
        );
        C--; // Decrement C.
      }
    } else {
      // If A and C are not equal, always decrement C.
      console.log(
        'C' // Log 'C'.
      );
      C--; // Decrement C.
    }
  }
  // Handle 'BC' operation (the only remaining possibility for 'v').
  else { // (v === 'BC')
    // If B and C have equal values.
    if (
      B === C
    ) {
      // Check the next operation to decide which value to decrement.
      // Similar logical flaw as above: `s[i]` is 'BC' here.
      if (
        s[i] === 'AC' // This condition will never be true here.
      ) {
        console.log(
          'B' // Log 'B'.
        );
        B--; // Decrement B.
      } else {
        console.log(
          'C' // Log 'C'.
        );
        C--; // Decrement C.
      }
    } else {
      // If B and C are not equal, always decrement C.
      console.log(
        'C' // Log 'C'.
      );
      C--; // Decrement C.
    }
  }
}


// Process the final operation (at index N-1).
const final = s[N - 1];

// Handle 'AB' for the final operation.
if (
  final === 'AB'
) {
  // Decrement the smaller of A or B.
  if (
    A < B
  ) {
    console.log(
      'B' // Log 'B'.
    );
  } else {
    console.log(
      'A' // Log 'A'.
    );
  }
}
// Handle 'BC' for the final operation.
else if (
  final === 'BC'
) {
  // Decrement the smaller of C or B.
  if (
    C < B
  ) {
    console.log(
      'B' // Log 'B'.
    );
  } else {
    console.log(
      'C' // Log 'C'.
    );
  }
}
// Handle 'AC' for the final operation (only remaining possibility).
else { // (final === 'AC')
  // Decrement the smaller of C or A.
  if (
    C < A
  ) {
    console.log(
      'A' // Log 'A'.
    );
  } else {
    console.log(
      'C' // Log 'C'.
    );
  }
}
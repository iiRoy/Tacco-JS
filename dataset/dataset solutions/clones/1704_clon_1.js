// This JavaScript code processes an array of numbers to find the maximum product
// of K elements, handling positive, negative, and zero values carefully.
// It uses BigInt for intermediate products to prevent overflow and applies
// modular arithmetic for the final result.

console
  .log(
    (
      args => { /* Start of the main processing function, taking input arguments. */

        // Input parsing:
        // Reads two lines from 'args'.
        // The first line contains N (total count) and K (elements to select).
        // The second line contains the array A of N numbers.
        const [
          [
            N, /* N: total count of numbers */
            K  /* K: number of elements to select for product */
          ],
          A  /* A: the array of input numbers */
        ] =
          args
            .trim()        // Remove any leading or trailing whitespace from the input string.
            .split('\n')   // Split the input string into an array of lines.
            .map(
              r =>         // For each line 'r':
                r
                  .split(' ')  // Split the line by spaces to get individual number strings.
                  .map(
                    v =>       // For each number string 'v':
                      v | 0    // Convert it to an integer using bitwise OR 0 (faster than parseInt).
                  )
            );

        // Initialize containers for categorized numbers and a zero counter.
        let
          Am = [], // Array to store negative numbers.
          Ap = [], // Array to store positive numbers.
          zero = 0; // Counter for occurrences of the number zero.

        // Loop through the input array A to categorize numbers.
        for (
          let
            i = 0; // Loop index initialization
          i
          <
          N; // Loop condition: iterate N times
          i++ // Increment loop index
        ) { // Start of categorization loop body

          // If the current number A[i] is positive, add it to Ap.
          if (
            A[i]
            >
            0
          )
            Ap
              .push(
                A[i]
              );

          // If the current number A[i] is negative, add it to Am.
          if (
            A[i]
            <
            0
          )
            Am
              .push(
                A[i]
              );

          // If the current number A[i] is zero, increment the zero counter.
          if (
            A[i]
            ===
            0
          )
            zero++;

        } // End of categorization loop

        // Edge case: If K elements must be selected, and including all zeros
        // still leaves fewer than K non-zero elements, then one of the K
        // selected elements MUST be zero, making the product 0.
        // Also if K is greater than N, it implies an impossible scenario or 0 product.
        if (
          K
          +
          zero
          >
          N
        )
          return '0'; // Return '0' as a string.

        // Define modulo constant and a modular multiplication helper function.
        const
          MOD = BigInt(1e9 + 7), // The modulo value, converted to BigInt.
          mul = (
            a, // First operand for multiplication
            b  // Second operand for multiplication
          ) =>
            (
              (
                BigInt(a)   // Convert 'a' to BigInt.
                *           // Perform multiplication.
                BigInt(b)   // Convert 'b' to BigInt.
                %           // Apply modulo operation.
                MOD
              )
              +
              MOD           // Add MOD to ensure the result is positive, even if intermediate % MOD is negative.
            )
            %
            MOD;            // Apply modulo again to get the final positive result.

        // Sort the categorized arrays.
        // Negative numbers are sorted in ascending order (e.g., -5, -3, -1).
        Am
          .sort(
            (
              a,
              b
            ) =>
              a - b
          );

        // Positive numbers are sorted in descending order (e.g., 5, 3, 1).
        Ap
          .sort(
            (
              a,
              b
            ) =>
              b - a
          );

        // Special handling for the case where there are no positive numbers
        // and K (the number of elements to select) is odd.
        // In this scenario, the product will be negative unless a zero is included.
        if (
          Ap.length
          ===
          0
          &&
          (
            K
            &
            1
          ) // K is odd (bitwise AND 1)
        )
          return
            zero
              ?
              '0' // If there are zeros, the product will be 0.
              :
              `${
                Am
                  .slice(-K)         // Take the K largest (least negative) numbers from Am.
                  .reduce(mul, 1)    // Multiply them using the modular multiplication function.
              }`;

        // Initialize pointers and arrays for the K selected numbers.
        let
          om = 0, // Pointer for the Am (negative numbers) array.
          op = 0, // Pointer for the Ap (positive numbers) array.
          ap = [], // Array to store selected positive numbers.
          am = [], // Array to store selected negative numbers.
          last = [0, 0]; // Stores the last positive and negative numbers considered (not strictly used later, but part of original logic).

        // Populate 'ap' and 'am' with K numbers.
        // Strategy: Greedily pick the number with the largest absolute value.
        for (
          let
            i = 0; // Loop counter
          i
          <
          K; // Iterate K times to select K numbers
          i++
        ) { // Start of selection loop

          // Compare the absolute value of the next available positive number (Ap[op])
          // with the absolute value of the next available negative number (-Am[om]).
          // The `|0` ensures that if `Ap[op]` or `Am[om]` is `undefined` (e.g., end of array),
          // it defaults to 0, making the comparison safe.
          if (
            (
              Ap[op]
              |
              0
            )
            >
            -(
              Am[om]
              |
              0
            )
          ) { // If the positive number's absolute value is greater
            ap
              .push(
                Ap[op]
              ); // Add the positive number to selected positives.
            last[0] = Ap[op]; // Update last selected positive.
            op++; // Move to the next positive number.
          } else { // If the negative number's absolute value is greater or equal
            am
              .push(
                Am[om]
              ); // Add the negative number to selected negatives.
            last[1] = Am[om]; // Update last selected negative.
            om++; // Move to the next negative number.
          }

        } // End of selection loop

        // After selecting K numbers, if the count of selected negative numbers ('am.length') is odd,
        // the current product will be negative. We need to try to make it positive by swapping
        // if a better combination exists.
        if (
          am.length
          &
          1 // Check if the count of selected negative numbers is odd.
        ) {

          // Two scenarios to consider for swapping:
          // 1. All available negative numbers have already been selected (`am.length === Am.length`).
          //    In this case, we must replace a negative with a positive if available.
          // 2. The next available positive number (`Ap[op]`) has a larger absolute value
          //    than the next available negative number's absolute value (`-Am[om]`).
          //    This means replacing the "smallest absolute negative" with "largest absolute positive"
          //    will yield a larger (or less negative) product.
          if (
            am.length
            ===
            Am.length
            ||
            Ap[op]
            >
            -Am[om]
          ) {
            am
              .pop(); // Remove the negative number with the smallest absolute value from 'am'.
            ap
              .push(
                Ap[op]
              ); // Add the next available positive number to 'ap'.
          }
          else { // Otherwise, the next available negative number's absolute value is larger
                 // than the next available positive.
                 // This means replacing the "smallest absolute positive" with "largest absolute negative"
                 // will yield a larger (or less negative) product, making it positive.
            ap
              .pop(); // Remove the positive number with the smallest absolute value from 'ap'.
            am
              .push(
                Am[om]
              ); // Add the next available negative number to 'am'.
          }

        } // End of odd negative count adjustment block

        // Calculate the final product of the selected positive and negative numbers.
        // Use the modular multiplication function 'mul' to reduce the arrays.
        return `${
          mul(
            ap
              .reduce(mul, 1), // Product of all selected positive numbers.
            am
              .reduce(mul, 1)  // Product of all selected negative numbers.
          )
        }`; // Return the final product as a string.

      } /* End of the main processing function. */
    )
    (
      require('fs') // Node.js 'fs' module for file system operations.
        .readFileSync(
          '/dev/stdin', // Path to read from standard input.
          'utf8'        // Specify UTF-8 encoding for reading the file.
        )
    )
  ); // End of console.log call, printing the result to standard output.
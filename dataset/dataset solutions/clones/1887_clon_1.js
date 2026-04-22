console.log(
    function (
        args
    )
    {
        /*
         * This function processes a given string input, typically from stdin,
         * to determine if a sequence of parentheses strings can be arranged
         * to form a perfectly balanced string.
         *
         * A "Type I clone" means only whitespace and comments can change.
         * All tokens (identifiers, operators, literals) remain identical.
         */

        // Step 1: Parse the input string.
        // Trim any leading/trailing whitespace and split by newline character.
        const S = args.trim().split('\n');


        // Step 2: Extract the number of strings (N) from the first line.
        // `S.shift()` removes the first element from S and returns it.
        // `|0` is a bitwise OR operation used as a fast way to convert to integer.
        const N = S.shift() | 0;


        // Step 3: Initialize data structures and counters.
        // `map` will store objects for each string, containing its start char, end char, and balance score.
        const map = [];
        // `total` tracks the sum of all individual string scores.
        // `openstart` counts strings that begin with '('.
        // `closeend` counts strings that end with ')'.
        let total = 0,
            openstart = 0,
            closeend = 0;


        // Step 4: Iterate through each remaining string to populate the `map` and update counters.
        for (
            let i = 0; /* Loop index for strings */
            i < N;
            i++
        )
        {
            // Create an object for the current string S[i].
            // `start`: The first character of the string.
            // `end`: The last character of the string.
            // `score`: Initialized to 0, will track the balance of parentheses within S[i].
            map[i] = {
                start: S[i][0],
                end: S[i][S[i].length - 1],
                score: 0
            };


            // Inner loop: Iterate through characters of the current string S[i]
            // to calculate its balance `score`.
            for (
                let j = 0,
                    l = S[i].length; /* Length of the current string */
                j < l;
                j++
            )
            {
                if (S[i][j] === '(') {
                    map[i].score++; // Increment score for an opening parenthesis
                }
                else if (S[i][j] === ')') {
                    map[i].score--; // Decrement score for a closing parenthesis
                }
            }


            // Update global counters after processing each string.
            total += map[i].score; // Accumulate the balance score of all strings.
            if (map[i].start === '(') openstart++; // Count if string starts with '('.
            if (map[i].end === ')') closeend++; // Count if string ends with ')'.
        }


        // Step 5: Perform preliminary checks for impossible scenarios.
        // If the sum of all scores is not zero, it's impossible to form a balanced string.
        // If no string starts with '(', or no string ends with ')', it's also impossible.
        if (total !== 0 || !openstart || !closeend) {
            return 'No'; // Immediately return 'No' if these conditions are not met.
        }


        // Special case: If there's only one string (N=1).
        // It must have a total score of 0 (checked above), so it's balanced.
        if (N === 1) {
            return 'Yes'; // A single, already balanced string is a solution.
        }


        // Step 6: Sort the `map` array.
        // Sorting by score in descending order might help the search algorithm
        // find a solution faster, though it's not strictly necessary for correctness.
        map.sort((a, b) => b.score - a.score);


        // Step 7: Initialize variables for the state-space search (DFS/BFS-like).
        // `ALL` is a bitmask representing all strings having been used.
        // `(1 << N)` creates a number with N+1 bits, `(1 << N) - 1` sets the N least significant bits to 1.
        const ALL = (1 << N) - 1;

        // `stack` will hold states to be explored: {used: bitmask, score: current_balance}.
        const stack = [],
              // `memo` is a memoization table to prevent re-exploring states.
              // `Array(ALL).fill(false)` creates an array of size ALL, initialized with false.
              memo = Array(ALL).fill(false);


        // Step 8: Populate the initial `stack` with valid starting strings.
        for (
            let i = 0; /* Loop index for initial strings */
            i < N;
            i++
        )
        {
            // Destructure `start` and `score` from the current map entry.
            const {
                start,
                score
            } = map[i];

            // A string cannot be a valid start of a sequence if:
            // 1. It begins with a closing parenthesis.
            // 2. Its own balance score is negative (meaning it's already unbalanced to the left).
            if (start === ')' || score < 0) {
                continue; // Skip this string as a starting point.
            }

            // If valid, push the initial state onto the stack.
            // `used`: A bitmask where the i-th bit is set, indicating string `i` is used.
            stack.push({
                used: 1 << i,
                score: score
            });
        }


        // Step 9: Main search loop (Depth-First Search using a stack).
        // Continues as long as there are states to explore in the stack.
        while (stack[0]) {
            // Pop the current state from the stack.
            const current = stack.pop();


            // Iterate through all possible strings to append to the current sequence.
            for (
                let i = 0; /* Loop index for next string to append */
                i < N;
                i++
            )
            {
                // Check if the i-th string has already been used in the current path.
                if (current.used & (1 << i)) {
                    continue; // If used, skip to the next string.
                }

                // Calculate the new 'used' bitmask and the new accumulated 'score'.
                const used = current.used | (1 << i); // Set the i-th bit in the 'used' mask.
                const score = current.score + map[i].score; // Add the current string's score.


                // Check if all strings have been used in this path.
                if (used === ALL) {
                    /*
                     * If all strings are used, we have a candidate sequence.
                     * It's a valid solution ONLY IF:
                     * 1. The LAST string in the sequence ends with a closing parenthesis.
                     * 2. The TOTAL accumulated score of the sequence is 0 (perfectly balanced).
                     */
                    if (map[i].end === ')' && score === 0) {
                        return 'Yes'; // Found a valid balanced sequence!
                    }
                    else {
                        continue; // This full sequence is not a solution, continue to next 'i'.
                    }
                }


                /*
                 * Memoization and pruning:
                 * If this 'used' state has been visited before AND the current accumulated score
                 * is negative, then this path is not promising. We've already explored
                 * a path to this 'used' state, and if the current score is worse (negative),
                 * there's no benefit in re-exploring it. This helps prune redundant and
                 * potentially invalid paths.
                 */
                if (memo[used] && score < 0) {
                    continue; // Prune this path, it's not going to lead to a solution.
                }

                // Mark the current 'used' state as visited for future memoization.
                memo[used] = true;

                // Push the new state onto the stack for further exploration.
                stack.push({
                    used: used,
                    score: score
                });
            }
        }


        // Step 10: If the stack becomes empty and no solution was found, return 'No'.
        return 'No';

    }(
        /*
         * This immediately invoked function expression (IIFE) is called with
         * the content of the standard input file.
         * `require('fs').readFileSync('/dev/stdin', 'utf8')` reads the entire file
         * `/dev/stdin` as a UTF-8 encoded string.
         */
        require('fs').readFileSync('/dev/stdin', 'utf8')
    )
);
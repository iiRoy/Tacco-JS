const input
=
    require
        (
            'fs'
        )
        .
        readFileSync
            (
                '/dev/stdin'
                ,
                'utf8'
            )
; // Input from standard input, read as UTF-8 string

// Process the raw input data
const list
    =
    input
        .
        trim
            (
            )
        .
        split
            (
                '\n'
            )
; // Trim whitespace and split into lines

// Extract problem parameters: n and m from the first line
const
    [
        n
        ,
        m
    ]
    =
    list
        [
            0
        ]
        .
        split
            (
                ' '
            )
; // Destructure the first line into n and m

// Extract coin denominations from the second line
const cm
    =
    list
        [
            1
        ]
        .
        trim
            (
            )
        .
        split
            (
                ' '
            )
; // Trim and split coin denominations

/**
 * Generates a unique key for memoization.
 * @param {...any} args - Arguments to be joined.
 * @returns {string} - The generated key.
 */
const genKey
    =
    (
        ...args
    )
        =>
        {
            // Join all arguments with a colon to form a string key
            const key
                =
                args
                    .
                    join
                        (
                            ':'
                        )
            ;
            // Return the constructed key
            return key
            ;
        }
;

// Initialize a Map for dynamic programming (memoization)
const dp
    =
    new
        Map
            (
            )
; // This map stores results of subproblems

/**
 * Calculates the minimum number of coins needed to reach a target sum.
 * Uses memoization to store and retrieve previously computed results.
 *
 * @param {number} count - The current number of coins used (for tracking recursion depth, though not directly used in the result calculation).
 * @param {number} target - The target sum to achieve.
 * @returns {number} - The minimum number of coins.
 */
const memo
    =
    (
        count
        ,
        target
    )
        =>
        {
            // Generate a unique key for the current state (count, target)
            const key
                =
                genKey
                    (
                        count
                        ,
                        target
                    )
            ;
            // Initialize result for the current subproblem
            let result
                =
                0
            ;

            // Check if the result for this key is already memoized
            if
                (
                    dp
                        .
                        has
                            (
                                key
                            )
                )
            {
                // If yes, retrieve the stored result
                result
                    =
                    dp
                        .
                        get
                            (
                                key
                            )
                ;
            }
            // If the target is not zero and not memoized, compute it
            else if
                (
                    target
                        !==
                    0
                )
            {
                // Based on the constraint (1 <= n <= 50,000), initialize min to a large value
                // This acts as infinity for this problem's bounds
                const nextCount
                    =
                    count
                        +
                    1
                ; // Increment count for the next recursive call
                let min
                    =
                    50000
                ; // A value greater than any possible valid answer (n max is 50000)

                // Iterate through all available coin denominations
                for
                    (
                        let i
                            =
                            0
                        ;
                        i
                            <
                        Number
                            (
                                m
                            )
                        ;
                        i
                            ++
                    )
                {
                    // Calculate the next target after using the current coin cm[i]
                    const nextTarget
                        =
                        target
                            -
                        Number
                            (
                                cm
                                    [
                                        i
                                    ]
                            )
                    ;

                    // If the next target is negative, this coin cannot be used
                    if
                        (
                            nextTarget
                                <
                            0
                        )
                    {
                        continue
                        ; // Skip to the next coin
                    }

                    // Recursively call memo to find the minimum coins for the next target
                    const resultForNextTarget
                        =
                        memo
                            (
                                nextCount
                                ,
                                nextTarget
                            )
                    ;
                    // Store the result of this subproblem in the memoization table
                    dp
                        .
                        set
                            (
                                genKey
                                    (
                                        nextCount
                                        ,
                                        nextTarget
                                    )
                                ,
                                resultForNextTarget
                            )
                    ;
                    // Update the minimum coins found so far
                    min
                        =
                        Math
                            .
                            min
                                (
                                    min
                                    ,
                                    resultForNextTarget
                                )
                    ;
                }
                // The result for the current target is 'min' coins + 1 (for the coin just used)
                result
                    =
                    min
                        +
                    1
                ;
            }
            // The base case for recursion is handled implicitly: if target is 0, it falls through and result remains 0.

            // This comment was in the original code. It seems to refer to a tail-recursive optimization or a conceptual idea.
            // Tail recursion is not strictly applied here in JS, but it's a comment from the original.
            // 末尾再起
            return result
            ; // Return the calculated or memoized result
        }
;

// Output the final result to the console
console
    .
    log
        (
            memo
                (
                    0
                    ,
                    Number
                        (
                            n
                        )
                )
        )
; // Start the memoization process with initial count 0 and target n



// const CALL_STACK_SIZE_LIMIT = 3000;
// let callStackSize = 0;

// const dp = new Map();
// const memo = async (count, target) => {
//   if (++callStackSize > CALL_STACK_SIZE_LIMIT) {
//     console.log('call nextTick:', count);
//     await nextTick();
//     callStackSize = 0;
//   }
//   const key = genKey(count, target);
//   if (dp.has(key)) {
//     return dp.get(key);
//   } else if (target === 0) {
//     return 0;
//   }

//   // 制約(1 ≤ n ≤ 50,000)よりベタ書きの初期化
//   const nextCount = count + 1;
//   let min = 50000;
//   for (let i = 0; i < Number(m); i++) {
//     const nextTarget = target - Number(cm[i]);
//     if (nextTarget < 0) {
//       continue;
//     }
//     const result = await memo(nextCount, nextTarget);
//     dp.set(genKey(nextCount, nextTarget), result);
//     min = Math.min(min, result);
//   }

//   return min + 1;
// }

// (async () => {
//   console.log(await memo(0, Number(n)));
// })()
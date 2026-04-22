/* This file contains a basic parsing utility. */
'use strict'; /* Enforces strict mode for cleaner code. */


// Definition of the 'token' parser combinator.
// This function creates a parser for a fixed string literal.
function token(s)
{
    // Store the length of the string 's' for efficiency.
    const len = s.length;

    // Return an anonymous parser function.
    // This parser takes a target string and a starting position.
    return (target, pos) =>
    {
        // Check if the substring of 'target' starting at 'pos'
        // and of length 'len' is strictly equal to 's'.
        return (target.substr(pos, len) === s)
            ? // If it matches:
              // Return a successful parse result: [true, matched_string, new_position].
              [true, s, pos + len]
            : // If it does not match:
              // Return a failed parse result: [false, null, original_position].
              [false, null, pos]
        ;
    }; // End of inner parser function.
} // End of 'token' function.


/*
 *
 *  The following functions are commented out, but represent
 *  additional parser combinators that could be used.
 *
 *  They are part of a larger parsing library context.
 *
 */

/*
// This function, if uncommented, would implement a 'choice' parser combinator.
// It tries multiple parsers in order and returns the first successful one.
function choice()
{
    const parsers = arguments; // Collects all passed arguments as an array-like object.

    return (target, pos) =>
    {
        for (let parser of parsers)
        {
            // Attempt to parse with the current parser.
            const parsed = parser(target, pos);

            // If parsing was successful (first element of 'parsed' is true),
            // return its result immediately.
            if (parsed[0])
            {
                return parsed;
            }
        }
        // If no parser succeeded after trying all of them, return a failure.
        return [false, null, pos];
    };
}
*/


/*
// The 'seq' (sequence) parser combinator.
// It attempts to apply a sequence of parsers one after another.
function seq()
{
    const parsers = arguments; // All arguments are considered individual parsers.

    return (target, pos) =>
    {
        const result = []; // Stores the results of successfully parsed components.
        let nextPos = pos; // Keeps track of the current position in the target string.

        // Iterate through each parser in the sequence.
        for (let parser of parsers)
        {
            const parsed = parser(target, nextPos); // Apply the current parser.

            // If any parser in the sequence fails, the entire sequence fails.
            if (!parsed[0])
            {
                return [false, null, pos]; // Return failure with the original starting position.
            }

            result.push(parsed[1]); // Add the successful parse result to the collection.
            nextPos = parsed[2];    // Update the position for the next parser.
        }
        // If all parsers in the sequence succeeded, return the combined result.
        return [true, result, nextPos];
    };
}
*/


/*
// This function provides a mechanism for lazy parser definition.
// Useful for handling recursive grammar rules.
function lazy(f)
{
    let parser; // This variable will hold the actual parser once it's created.

    return function (target, position)
    {
        // If the parser hasn't been initialized yet, call the factory function 'f'.
        if (!parser)
        {
            parser = f();
        }
        // Then, apply the (now initialized) parser.
        return parser(target, position);
    };
}
*/


/*
// The 'fmap' (functor map) combinator.
// It applies a transformation function 'f' to the result of a parser.
function fmap(parser, f)
{
    return (target, pos) =>
    {
        const result = parser(target, pos); // First, try to parse with the given parser.

        if (result[0])
        {
            // If the parser succeeded, apply the mapping function 'f' to its value.
            return [result[0], f(result[1]), result[2]];
        }
        else
        {
            // If the parser failed, just return its original failure result.
            return result;
        }
    };
}
*/


/*
// The 'oneOf' parser combinator.
// It creates a parser that matches any single character present in the input string 's'.
function oneOf(s)
{
    let d = {}; // A dictionary/object to quickly check for character existence.

    // Populate the dictionary with characters from 's'.
    for (let c of s)
    {
        d[c] = c;
    }

    return (target, pos) =>
    {
        const c = target.substr(pos, 1); // Get the character at the current position.

        // Check if this character is in our allowed set 'd'.
        return d[c]
            ? [true, c, pos + 1]  // Success: return char and advance position.
            : [false, null, pos]; // Failure: return null and keep original position.
    };
}
*/


/*
 *
 *  Main application logic - currently commented out.
 *  This section would typically read input, parse it, and perform computations.
 *
 */

/*
// Immediately Invoked Function Expression (IIFE) for the main logic.
(stdin =>
    {
        // Define the 'formulaP' parser, which is recursive, hence the 'lazy' wrapper.
        const formulaP = lazy(() =>
            {
                // Parser for AND expressions: (formula * formula)
                const andP = fmap(
                    seq(token('('), formulaP, token('*'), formulaP, token(')')),
                    x => { return { op: '*', fs: [x[1], x[3]] }; }
                );

                // Parser for OR expressions: (formula + formula)
                const orP = fmap(
                    seq(token('('), formulaP, token('+'), formulaP, token(')')),
                    x => { return { op: '+', fs: [x[1], x[3]] }; }
                );

                // Parser for IMPLICATION expressions: (formula -> formula)
                const impP = fmap(
                    seq(token('('), formulaP, token('->'), formulaP, token(')')),
                    x => { return { op: '->', fs: [x[1], x[3]] }; }
                );

                // Parser for NOT expressions: (- formula)
                const notP = fmap(
                    seq(token('-'), formulaP),
                    x => { return { op: '-', fs: [x[1]] }; }
                );

                // Parser for atomic values (variables or T/F constants)
                const valP = fmap(
                    oneOf('abcdefghijkTF'),
                    x => { return { val: x, fs: [] }; }
                );

                // Return a choice parser combining all formula types.
                return choice(andP, orP, impP, notP, valP);
            }
        );

        // Define the 'equationP' parser: formula = formula
        const equationP = fmap(
            seq(formulaP, token('='), formulaP),
            x => { return { left: x[0], right: x[2] }; }
        );


        // Process each line from standard input.
        stdin.toString().split('\n').forEach(s =>
            {
                // Exit condition for the input loop.
                if (s == '#')
                {
                    process.exit(0);
                }

                // The following block is also commented out but contains the core
                // logic for evaluating propositional logic formulas.

                // const r = equationP(s, 0); // Attempt to parse the equation.
                // let isValid = true;       // Flag to track tautology.

                // Loop through all possible truth assignments for 11 variables.
                // for (let i = 0; i < (1 << 11); i++)
                // {
                //   isValid &= evalF(r[1].left) === evalF(r[1].right); // Check equivalence.

                //   // Helper function to convert character to boolean based on current assignment 'i'.
                //   function toBool(c)
                //   {
                //     if (c === 'T') return true;
                //     if (c === 'F') return false;
                //     // For variables 'a' through 'k', check the corresponding bit in 'i'.
                //     return !!(i >> (c.charCodeAt() - 'a'.charCodeAt()) & 1);
                //   }

                //   // Recursive function to evaluate a formula given the current truth assignment.
                //   function evalF(f)
                //   {
                //     switch (f.fs.length)
                //     {
                //       case 0: return toBool(f.val); // Base case: atomic value.
                //       case 1: return !evalF(f.fs[0]); // NOT operation.
                //       case 2:
                //         switch (f.op)
                //         {
                //           case '*': return evalF(f.fs[0]) && evalF(f.fs[1]);  // AND
                //           case '+': return evalF(f.fs[0]) || evalF(f.fs[1]);  // OR
                //           case '->': return !evalF(f.fs[0]) || evalF(f.fs[1]); // IMPLICATION
                //         }
                //     }
                //   }
                // }
                // console.log(isValid ? 'YES' : 'NO'); // Output result.
            }
        );
    }
)(require('fs').readFileSync('/dev/stdin', 'utf8')); // Read input from stdin.
*/
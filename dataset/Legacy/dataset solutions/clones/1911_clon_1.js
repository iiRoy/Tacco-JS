/*
 * This file processes input lines to determine a sequence of operations.
 * The core logic involves managing three counters (A, B, C) based on string inputs.
 * The goal is to generate a Type I clone, focusing solely on whitespace and comments.
 * All variable names, function calls, operators, and expressions are preserved exactly.
 *
 * Original comments:
 * // (Yes/No)
 * //   隣り合う２つの和が試行回数以上であることを満たせば
 * //   条件をクリアできるはず
 * // (パターン)
 * //   ０未満にならないように順に実行行を出力していけば良いはず
 */

const   lines = require  ( 'fs' )
. readFileSync ( '/dev/stdin', 'utf8' )
. split ( '\n' )
;

// Parse the first line to get N, A, B, C values
const line1st = lines[0].split(' ');

const N = +line1st[0];
let A = +line1st[1];
let B = +line1st[2];
let C = +line1st[3];

// The commented out line below was present in the original code.
// It's commented out as per Type I cloning rules (comments can be modified/added/removed).
// console.log(`N=${N} A=${A} B=${B} C=${C}`)

const s = []; // Array to store subsequent lines of input.

// Populate the 's' array with input strings from the second line onwards.
for (let i = 0; i < N; i++)
{
    s.push(lines[i + 1]);
}

let isYes = true; // Flag to track if the conditions are met.
const ans = [];   // Array to store the sequence of operations ('A', 'B', 'C').


// Main loop to process N-1 operations
for (let i = 0; i < N - 1; i++)
{
    const v = s[i];       // Current operation type
    const next = s[i + 1]; // Next operation type, used for look-ahead logic


    if (v === 'AB')
    {
        // Debugging lines from original, now commented out.
        // console.log(`AB: `)
        // console.log(`N=${N} A=${A} B=${B} C=${C}`)

        if (A === 0 && B === 0)
        {
            isYes = false;
            break;
        }
        else if (A === 0)
        {
            A++;
            B--;
            ans.push('A');
        }
        else if (B === 0)
        {
            A--;
            B++;
            ans.push('B');
        }
        else if (next === 'AC' && A === 1)
        {
            A++;
            B--;
            ans.push('A');
        }
        else if (next === 'BC' && B === 1)
        {
            A--;
            B++;
            ans.push('B');
        }
        else
        {
            // Default action for AB when no specific conditions met
            A++;
            B--;
            ans.push('A');
        }
    }
    else if (v === 'AC')
    {
        if (A === 0 && C === 0)
        {
            isYes = false;
            break;
        }
        else if (A === 0)
        {
            A++;
            C--;
            ans.push('A');
        }
        else if (C === 0)
        {
            A--;
            C++;
            ans.push('C');
        }
        else if (next === 'AB' && A === 1)
        {
            A++;
            C--;
            ans.push('A');
        }
        else if (next === 'BC' && C === 1)
        {
            A--;
            C++;
            ans.push('C');
        }
        else
        {
            // Default action for AC
            A++;
            C--;
            ans.push('A');
        }
    }
    else
    {
        // This implicitly covers the case where (v === 'BC')
        if (B === 0 && C === 0)
        {
            isYes = false;
            break;
        }
        else if (B === 0)
        {
            B++;
            C--;
            ans.push('B');
        }
        else if (C === 0)
        {
            B--;
            C++;
            ans.push('C');
        }
        else if (next === 'AB' && B === 1)
        {
            B++;
            C--;
            ans.push('B');
        }
        else if (next === 'AC' && C === 1)
        {
            B--;
            C++;
            ans.push('C');
        }
        else
        {
            // Default action for BC
            B++;
            C--;
            ans.push('B');
        }
    }
}


// Process the final operation, which is s[N - 1]
const final = s[N - 1];

if (final === 'AB')
{
    if (A < B)
    {
        ans.push('A');
    }
    else if (A === B && A === 0)
    {
        console.log('No');
        return;
    }
    else
    {
        ans.push('B');
    }
}
else if (final === 'BC')
{
    if (C < B)
    {
        ans.push('C');
    }
    else if (C === B && C === 0)
    {
        console.log('No');
        return;
    }
    else
    {
        ans.push('B');
    }
}
else
{
    // This handles the case where (final === 'AC')
    if (C < A)
    {
        ans.push('C');
    }
    else if (C === A && C === 0)
    {
        console.log('No');
        return;
    }
    else
    {
        ans.push('A');
    }
}


// Final check on the 'isYes' flag
if (!isYes)
{
    console.log('No');
    return;
}

// If all conditions passed, print 'Yes' and the sequence of operations.
console.log('Yes');

ans.forEach(v => console.log(v)); // Output each recorded operation on a new line.
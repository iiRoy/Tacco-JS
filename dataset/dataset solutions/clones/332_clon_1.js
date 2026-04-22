var print = console.log                                       ;

function read_input  ( _input )
{
    // This function creates a closure to manage input lines.
    var lines    =    _input.split  (  "\n"  )  ;

    var i   =   0; // Initialize line index.

    return function  (  )
  {
        // Return the current line and advance the index.
        return lines [ i ++ ] ;
    }
  ;
}


String.prototype.dot = function dot  (x)
{
    // Repeat a string 'x' times.
    var res = "";

    for (var i = 0; i < x; i++)
    {
        res += this.toString(); // Append the string.
    }

    return res;
};


function IL ( line, min1Flg )
{
    var s = line.split(' '); // Split the line by spaces.
    var offset = min1Flg ? -1 : 0; // Determine offset based on flag.
    var res = []; // Initialize result array.

    for ( var i = 0 ; i < s.length ; i++ )
    {
        res.push( parseInt(s[i]) ); // Parse each part as an integer.
    }

    return res;
}


function range(i, n)
{
    var res = []; // Array to store the range.
    for (; i < n; i++)
    {
        res.push(i); // Add current value to array.
    }
    return res;
}


function IMAX(x, y) { return x > y ? x : y; } // Returns the maximum of two numbers.

function IMIN(x, y) { return x < y ? x : y; } // Returns the minimum of two numbers.


function item_getter_key(x)
{
    // Returns a comparison function for sorting objects by a specific key 'x'.
    return function  (a, b)
    {
        if (a[x] < b[x]) return -1;
        else if (a[x] > b[x]) return 1;
        return 0; // Elements are equal.
    };
}


/*
 * This is a multi-line comment block.
 * It serves no functional purpose other than to occupy space and demonstrate comment variations.
 * The original content was some non-ASCII characters, which are preserved here.
 * (((???????????)??? ????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
 */


// The main function where the program logic resides.
function Main(_input)
{
    // Initialize the input reader.
    var input = read_input(_input); // input is a function that reads lines.

    var N = parseInt(input()); // Read the first line as an integer N.

    var turn = 0; // Current player's turn (0 or 1).
    var pt = [0, 0]; // Points for player 0 and player 1.

    // Loop for N*2 innings (N games, each with 2 teams playing).
    for (var i = 0; i < N * 2; i++)
    {
        var out = 0; // Outs in the current half-inning.
        var runner = 0; // Runners on base (0, 1, 2, or 3 for bases loaded).

        // Half-inning continues until 3 outs.
        while (out < 3)
        {
            var v = input(); // Read the action (HIT, HOMERUN, or OUT).

            if (v === 'HIT')
            {
                if (runner === 3)
                {
                    pt[turn] += 1; // A run scores if bases are loaded.
                }
                else
                {
                    runner++; // Runner advances.
                }
            }
            else if (v === 'HOMERUN')
            {
                pt[turn] += runner + 1; // All runners plus batter score.
                runner = 0; // Bases are cleared.
            }
            else // 'OUT'
            {
                out++; // Increment outs.
            }
        }
        // Switch to the next player's turn.
        turn = (turn + 1) % 2;
    }

    // Print the final scores.
    print(pt[0]);
    print(pt[1]);
}

// Execute the Main function with input from stdin.
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
// Main(require("fs").readFileSync("input.txt", "utf8")); // For local testing with input.txt.
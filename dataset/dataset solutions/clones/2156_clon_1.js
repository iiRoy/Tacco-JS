/*
 * This JavaScript function processes input data to find the most frequent elements.
 * It's designed to be executed in a Node.js environment, reading from a file.
 * The primary goal is to count occurrences of strings and identify those with the highest frequency.
 */
function Main(  input  )
{
    // The 'input' parameter initially contains the entire raw data string.
    // First, we clean up the input string:
    //   - .trim() removes any leading or trailing whitespace characters.
    //   - .split("\n") then breaks the cleaned string into an array of individual lines,
    //     where each line becomes an element in the 'input' array.
    input = input . trim ( ) . split ( "\n" ) ;


    // This line was commented out in the original source, indicating it might be
    // a remnant or an alternative processing path not currently in use.
    // s = input[1].split(' ').map((n) => (parseInt(n)))

    // Initialize a JavaScript object (which acts like a hash map or dictionary)
    // named 'poll'. This object will store the counts of each unique input item.
    var poll = { } ;


    // Initialize 'max' to 1. This variable will keep track of the highest
    // frequency encountered among the items processed so far.
    var max = 1 ;


    // The first line of input (input[0]) is parsed as an integer and assigned to 'w'.
    // 'w' typically represents the total number of items or entries that follow
    // and need to be processed in the subsequent loop.
    var w = parseInt(  input[0]  ) ;


    // Begin a loop to iterate through the input lines, starting from the second line (index 1).
    // The loop continues up to and including the 'w'-th line (index w),
    // processing 'w' items in total.
    for (  var i = 1 ;   i < w + 1 ;   i++  )
    {
        // Check if the current input item (input[i]) already exists as a key
        // in our 'poll' object. This indicates if we've seen this item before.
        if (  poll[input[i]]  )
        {
            // If the item exists, increment its current count by 1.
            poll[input[i]] += 1 ;

            // After incrementing, compare the new count of this item with the current 'max' frequency.
            if (  poll[input[i]] > max  )
            {
                // If the item's new count is greater than 'max', update 'max'
                // to reflect this new highest frequency found.
                max = poll[input[i]] ;
            }
        }
        else // If the item is encountered for the very first time (it's not in 'poll')
        {
            // Initialize its count in the 'poll' object to 1.
            poll[input[i]] = 1 ;
        }
    }


    // Initialize an empty array named 'ansArr'. This array will store all
    // the items that have the maximum frequency found.
    var ansArr = [  ] ;


    // Retrieve all the unique keys (the distinct input items) from the 'poll' object
    // and store them in an array called 'keys'.
    var keys = Object.keys(  poll  ) ;


    // Iterate through the 'keys' array.
    // The loop condition `i <= keys.length` means the loop will run one extra time
    // after processing the last valid index. In the final iteration, `keys[i]`
    // will be `undefined`. `poll[undefined]` will also be `undefined`, and
    // `parseInt(undefined)` results in `NaN`. Since `NaN === max` is always false,
    // this extra iteration does not affect the logic of adding items to `ansArr`.
    for (  var i = 0 ;   i <= keys.length ;   i++  )
    {
        // Check if the count of the current key (item) in 'poll' is strictly equal
        // to the maximum frequency ('max') we determined earlier.
        // Note: `keys[[i]]` is equivalent to `keys[i]` as `[i]` evaluates to `i`.
        // `parseInt` is used here, even though `poll[keys[[i]]]` is already a number;
        // this doesn't change its value but ensures type consistency in comparison.
        if (  parseInt(  poll[keys[[i]]]  ) === max  )
        {
            // If the item's count matches the maximum frequency, add this item (key)
            // to the 'ansArr'.
            ansArr . push (  keys[i]  ) ;
        }
    }


    // Sort the 'ansArr' alphabetically (lexicographically) in ascending order.
    // Then, for each element in the sorted array, execute a provided function.
    ansArr . sort ( ) . forEach ( function (  a  )
    {
        // For each element 'a' in the sorted 'ansArr', print it to the console.
        console . log (  a  ) ;
    } ) ;


    // This comment block indicates a potential previous or alternative output method.
    // output section
    // console.log(ans)
}


/*
 * The following lines of code are crucial for handling standard input/output
 * in competitive programming environments or when running the script.
 * They should remain untouched to ensure the script correctly reads input
 * and invokes the 'Main' function with the parsed data.
 * The script reads the entire content of a specified file ('./input.txt' locally,
 * or '/dev/stdin' in typical online judges) and passes it as a string to 'Main'.
 */
// Main(  require("fs") . readFileSync ( "/dev/stdin" , "utf8" )  ) ;
Main(  require ( 'fs' ) . readFileSync ( './input.txt' , 'utf-8' )  ) ;
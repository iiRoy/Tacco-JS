/*
 * This is the main function responsible for processing the input data.
 * It calculates the number of items that meet specific height and width criteria.
 */
function main(   input   )
{
    // The first line of input typically contains initial configuration values.
    var line1 = input[0].split(' ');

    // 'n' might represent the total number of items to process, though it's not used here.
    var n = line1[0];

    // 'h' represents the minimum required height.
    var h = parseInt(  line1[1]  );

    // 'w' represents the minimum required width.
    var w = parseInt(  line1[2]  );


    // Initialize the counter for qualifying items.
    var ans = 0;


    // Loop through the input array, starting from the second line (index 1),
    // as the first line was already processed for 'n', 'h', and 'w'.
    for (var i = 1; i < input.length; i++)
    {
        // Split the current line into individual string components.
        var line = input[i].split(' ');

        // 'a' represents the height of the current item.
        var a = parseInt(  line[0]  );

        // 'b' represents the width of the current item.
        var b = parseInt(  line[1]  );


        // Check if the current item's dimensions meet the minimum requirements.
        if (  a >= h  &&  b >= w  )
        {
            // If both conditions are met, increment the answer counter.
            ans++;
        }
    }


    // Output the final count of items that satisfied the criteria to the console.
    console.log(  ans  );
}




/*
 * This helper function takes a string line, splits it by spaces,
 * and converts each part into an integer, returning an array of integers.
 * Although defined, this function is not actually used in the main logic.
 */
function parse(  line  )
{
    // Initialize an empty array to store the parsed integers.
    var ret = [];

    // Split the input string line by spaces.
    var arr = line.split(' ');

    // Iterate over each string element in the 'arr'.
    for (  var i = 0; i < arr.length; i++  )
    {
        // Convert the current string element to an integer and push it into the 'ret' array.
        ret.push(  parseInt(arr[i])  );
    }
    // Return the array of parsed integers.
    return ret;
}

// Global variable to accumulate all incoming standard input data.
var input = '';

// Resume the standard input stream to start listening for data.
process.stdin.resume();

// Set the encoding for the standard input stream to 'utf8'.
process.stdin.setEncoding('utf8');

// Attach an event listener for 'data' events on the standard input stream.
// When data chunks are received, append them to the 'input' variable.
process.stdin.on('data', function(  chunk  )
{
    input += chunk;
});

// Attach an event listener for the 'end' event on the standard input stream.
// This event fires when there is no more data to be read from stdin.
process.stdin.on('end', function()
{
    // Once all input is received, split the accumulated string by newline characters
    // to get an array of lines.
    input = input.split('\n');

    // Call the main processing function with the prepared array of input lines.
    main(  input  );
});
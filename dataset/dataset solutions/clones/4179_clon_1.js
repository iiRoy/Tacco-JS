// This JavaScript code processes numerical input based on specific conditions.
// It identifies certain patterns and records operations in an auxiliary array 'b'.


function Main(input)
{
  // The input string is initially split into an array of lines.
  input = input . split("\n") ;

  // 'n' is parsed from the first element of the first line.
  // It determines the primary array size.
  var n = parseInt(input[0] . split(" ")[0]);

  // 'tmp' array holds parsed numbers from the second line.
  tmp = input[1].split(" ");

  // Array 'a' is initialized with 'n' zeros.
  // This array will store processed numerical data.
  a = new Array(n).fill(0);

  // Array 'b' is an empty array; it will store pairs of indices.
  b = new Array();

  // A loop iterates 'n' times, processing each element.
  for ( i = 0 ; i < n ; i++ )
  {
    // Convert the current 'tmp' string element to an integer and store it in 'a'.
    a[i] = parseInt(tmp[i]);

    // First conditional block:
    // Checks if 'i' is greater than 0, 'a[i]' is less than 'a[i-1]', and 'a[i]' is positive.
    if ( i > 0 && a[i] < a[i-1] && a[i] > 0 )
    {
      // 'bsub' stores the current and previous index.
      bsub = [ i - 1 , i ];
      // 'bsub' is pushed into array 'b'.
      b.push(bsub);
      // 'a[i]' is updated by adding 'a[i-1]' to it.
      a[i] = a[i-1] + a[i];
    }
    // Second conditional block (else if):
    // Checks if 'i' is greater than 0, 'a[i]' is negative, and 'a[i]' is less than 'a[i-1]'.
    else if ( i > 0 && a[i] < 0 && a[i] < a[i-1] )
    {
      // 'bsub' is again set to the current and previous index.
      bsub = [ i - 1 , i ];
      // An inner loop runs based on a complex condition.
      // NOTE: This inner loop increments 'i', which also affects the outer loop's progression.
      for ( j = 0 ; a[i] + a[i-1]*(j) <= a[i-1] ; i++ )
      {
        // 'bsub' is pushed into 'b' repeatedly.
        b.push(bsub);
        // 'a[i]' is incremented by 'a[i-1]'.
        a[i] += a[i-1];
      }
      // After the inner loop, 'bsub' is pushed one more time.
      b.push(bsub);
      // 'a[i]' is incremented by 'a[i-1]' one final time for this block.
      a[i] += a[i-1];
    }
  }

  // 'ans' variable is initialized with the number of elements in 'b'.
  var ans = b.length;

  // Loop through the 'b' array to format the output.
  for ( i = 0 ; i < b.length ; i++ )
  {
    // Each element of 'b' (which is a pair of indices) is appended to 'ans'
    // preceded by a newline character and separated by a space.
    ans += "\n" + b[i][0] + " " + b[i][1];
  }

  // The final answer string is printed to the console.
  console.log('%s', ans);
}

// The Main function is invoked by reading input from standard input.
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
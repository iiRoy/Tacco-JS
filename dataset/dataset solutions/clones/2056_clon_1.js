function                     Main (input) {
  // This is the main function responsible for processing the input and calculating the result.
  // The input string is first trimmed, split by newlines, and then each line is split by spaces.
  input = input.trim().split("\n").map(function(x) { return x.split(" ")       ;});


  // Parse the dimensions and the threshold value K from the first line of input.
  var H = parseInt(input[0][0], 10)                                                ;
  var W = parseInt(input[0][1], 10)                                                ;
  var K = parseInt(input[0][2], 10)                                                ;


  // Initialize arrays to store the grid data and its prefix sums.
  arr_S = [];  // Stores the original grid values as numbers.
  arr_SS = []; // Stores the prefix sums for each row.


  var tmp; // Temporary variable for calculations within loops.


  // Loop through each row of the input grid to populate arr_S and arr_SS.
  for (var i = 0; i < H; i++ )
  {
    // Convert each character in the row string to an integer and store in arr_S.
    arr_S.push(input[i + 1][0].split("").map(e => parseInt(e, 10))        );
    arr_SS.push([0])                                                      ; // Initialize the prefix sum for the current row with 0.
    tmp = 0                                                               ;


    // Calculate prefix sums for the current row.
    for (var j = 0; j < W; j ++  )
    {
      tmp += arr_S[i][j]                                                  ; // Add current element to temporary sum.
      arr_SS[i].push(tmp)                                                 ; // Store the cumulative sum.
    }
  }


  // The original code had a console.log here, which is commented out.
  // console.log(arr_S, arr_SS);


  // N represents the number of possible horizontal cuts, which is H-1.
  // This value will be used for iterating through combinations of cuts.
  var N = H - 1; // N-digit binary number represents horizontal cut configurations.


  var hDiv         ; // Array to track horizontal divisions (though not explicitly used in the final logic).
  var tmpRowSet    ; // Stores rows combined based on horizontal cuts.
  var tmpSum       ; // Stores the current prefix sum for each combined row.
  var CountHCut    ; // Counts the number of horizontal cuts made for a given configuration.
  var tmpCut       ; // Stores the positions of vertical cuts.
  var ans = (H - 1) + (W - 1)                                             ; // Initialize answer with maximum possible cuts (H-1 horizontal, W-1 vertical).


  // This is the main loop that iterates through all possible horizontal cut configurations.
  // Each 'k' value represents a unique combination of horizontal cuts.
  whole_loop:
  for (var k = 0; k < Math.pow(2, N); k++  )
  {
    // The commented-out line was for debugging a specific 'k' value.
    // for (var k = 3; k < 4; k++){

    if (N === 0)
    {
      // If there are no rows to cut horizontally (H=1), the row set is just the first row.
      tmpRowSet = [arr_SS[0].slice()]                                     ;
      CountHCut = 0                                                       ; // No horizontal cuts needed.
    }
    else
    {
      // Initialize hDiv (not strictly necessary for the logic, but preserved from original).
      hDiv = [0, 1, 2, 3, 4, 5, 6, 7]                                     ;
      hDiv.length = H                                                     ; // Ensure hDiv has correct length.
      tmpRowSet = [arr_SS[0].slice()]                                     ; // Start with the first row in the set.

      // console.log(hDiv, H); // Debugging line.

      // Convert 'k' to a binary string to represent horizontal cuts.
      tmp = k.toString(2)                                                 ;
      // Pad with leading zeros to ensure N digits.
      tmp = ('0'.repeat(N) + tmp).substr(-1 * N)                          ;
      CountHCut = 0                                                       ; // Reset horizontal cut count.

      // console.log(arr_SS) // Debugging line.

      // Iterate through the binary string to determine horizontal cuts.
      for (var l = 0; l < tmp.length; l++  )
      {
        // console.log("l", l); // Debugging line.

        if (tmp.substr(l, 1) === '0')
        {
          // If the bit is '0', merge the current row with the previous combined row.
          hDiv[l + 1] = hDiv[l]                                           ;
          tmpRowSet[tmpRowSet.length - 1] = VO(tmpRowSet[tmpRowSet.length - 1], arr_SS[l + 1], '+');
        }
        else
        {
          // If the bit is '1', create a new combined row, indicating a horizontal cut.
          tmpRowSet.push(arr_SS[l + 1].slice())                           ;
          CountHCut++                                                     ; // Increment horizontal cut count.
        }
      }
    }

    // console.log("hD",hDiv);     // Debugging line.
    // console.log("tRS", tmpRowSet); // Debugging line.

    // Initialize tmpSum for tracking current sums of each combined row.
    tmpSum = [0, 0, 0, 0, 0, 0, 0, 0]                                     ;
    tmpSum.length = tmpRowSet.length                                      ;
    tmpCut = []                                                           ; // Reset vertical cuts for this configuration.


    // Loop through each column to determine necessary vertical cuts.
    for (var i = 1; i <= W; i++  )
    {
      part_loop: // Label for breaking out of the inner loop.
      for (var j = 0; j < tmpRowSet.length; j++  )
      {
        // console.log("ji", j, i, tmpRowSet[j][i], tmpSum[j], tmpCut); // Debugging line.

        // Check if the sum of elements in the current combined row segment exceeds K.
        if (tmpRowSet[j][i] - tmpSum[j] > K)
        {
          // If it exceeds K, a vertical cut is required.
          // If it's the very first column or the previous cut was at the same spot,
          // this horizontal configuration is invalid, so continue to the next 'k'.
          if (i === 1 || tmpCut[tmpCut.length - 1] === i - 1) continue whole_loop;

          tmpCut.push(i - 1)                                              ; // Record the vertical cut position (between column i-1 and i).

          // Reset tmpSum for all combined rows to the values at the column where the cut was made.
          for (var jj = 0; jj < tmpRowSet.length; jj++  )
          {
            tmpSum[jj] = tmpRowSet[jj][i - 1]                             ;
            // console.log("here"); // Debugging line.
          }

          i--                                                             ; // Decrement 'i' to re-evaluate the current column after the cut.
          break part_loop                                                 ; // Break from the inner loop to continue with the next column.
        }
      }
    }

    // console.log(CountHCut, tmpCut.length, tmpCut); // Debugging line.

    // Update the minimum number of cuts found so far.
    ans = Math.min(ans, CountHCut + tmpCut.length)                        ;
    // console.log("a", ans); // Debugging line.

  }

  // Output the final minimum number of cuts.
  console.log(ans)                                                        ;

}


// VO (Vector Operation) function performs element-wise operations on two arrays.
function VO(v1, v2, op)
{
  var ans = []                                                            ; // Initialize an empty array for the result.


  // Handle cases where array lengths might differ.
  if (v1.length !== v2.length)
  {
    // If v2 has only one element, treat it as a scalar to be applied to all elements of v1.
    if (v2.length === 1)
    {
      v2 = Array.from({ length: (v1.length) }, () => v2)                  ;
    }
    else
    {
      return null                                                         ; // If lengths differ and v2 is not a scalar, return null.
    }
  }


  // Perform the specified operation element-wise.
  for (var i = 0; i < v1.length; i++  )
  {
    if (op == '+')
    {
      ans.push(v1[i] + v2[i])                                             ;
    }
    if (op == '-')
    {
      ans.push(v1[i] - v2[i])                                             ;
    }
    if (op == '*')
    {
      ans.push(v1[i] * v2[i])                                             ;
    }
    if (op == '/')
    {
      ans.push(v1[i] / v2[i])                                             ;
    }
    if (op == '%')
    {
      ans.push(v1[i] % v2[i])                                             ;
    }
    if (op == '||')
    {
      ans.push(Math.max(v1[i],v2[i]))                                     ; // Custom operation for 'max'.
    }
  }

  return ans                                                              ; // Return the result array.
}


// Call the Main function with input read from standard input.
Main(require("fs").readFileSync("/dev/stdin", "utf8"))                    ;
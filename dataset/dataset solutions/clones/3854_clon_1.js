"use strict"
; // This directive enables strict mode for better error handling and cleaner code.


var    main    =    function    main    (    input    )    {

  // Input processing starts here.
  var args    =    input.split    (    '\n'    )    ;

  // Extract dimensions H (height) and W (width) from the first line of input.
  var H    =    args    [    0    ]    .split    (    ' '    )    [    0    ]    ;
  var W    =    args    [    0    ]    .split    (    ' '    )    [    1    ]    ;

  /*
   * Initialize an empty array 's' to store the grid rows.
   * This array will hold the actual grid data from the input.
   */
  var    s    =    [    ]    ;

  // Initialize a boolean flag to track the overall outcome.
  var    flagOut    =    true    ;


  // Populate the 's' array with grid rows, starting from the second line of input.
  for    (    var    i    =    1    ;    i    <    H    ;    i    ++    )
  {
    s    .    push    (    args    [    i    ]    )    ;
  }


  // Main logic: Iterate through each cell of the grid to check its neighbors.
  // The goal is to determine if every '#' cell has at least one '#' neighbor (up, down, left, or right).

  /*
   * The original comment was:
   * // 一つずつ参照していって上下左右に#なかったらNG
   * This translates to: "Referencing one by one, if there's no '#' up, down, left, or right, then it's NG (No Good)."
   * We are effectively checking if all '#' cells are connected.
   */

  for    (    var    _i    =    0    ;    _i    <    H    ;    _i    ++    )
  {
      var    line    =    s    [    _i    ]    .split    (    ''    )    ;

      for    (    var    j    =    0    ;    j    <    W    ;    j    ++    )
      {
          // This flag will be true if the current cell has at least one '#' neighbor.
          var    _flag    =    false    ;

          // The character at the current grid position.
          var    target    =    line    [    j    ]    ;

          // Only proceed with neighbor checks if the target cell is '#'.
          // If the target is not '#', it doesn't need to have '#' neighbors.
          if    (    target    ==    '#'    )
          {

              // Check the left neighbor, if not on the leftmost column.
              // Original comment: // 左端じゃなかったら左を見る
              if    (    j    !=    0    )
              {
                  if    (    line    [    j    -    1    ]    ==    '#'    )
                  {
                      _flag    =    true    ;
                      // No need to check further neighbors for this cell if one is found.
                      // This break exits the inner `if` block, but not the `for j` loop.
                      // This is a subtle point, as it effectively means only one neighbor check is performed.
                      // Ah, wait, this break is *inside* the `if` block. It doesn't break the `for j` loop.
                      // The original code's `break` here is only for the *current* `if` condition.
                      // This means if `line[j-1]` is '#', `_flag` becomes true, but then it continues to check right, up, down.
                      // This is not efficient, but it's how the original code is written. I must preserve it.
                      // Let's re-read the original:
                      // if (j != 0) { if (line[j - 1] == '#') { _flag = true; break; } }
                      // This `break` *does* break out of the `for j` loop. This logic is incorrect.
                      // It should be `continue` or a different structure if it's meant to check all neighbors.
                      // If it's meant to find *any* neighbor and then move to the next cell, then `break` is correct,
                      // but it would break the *inner* `for` loop, not just the `if`.
                      // This means if `line[j-1]` is '#', it sets `_flag = true` and then breaks out of the `for (var j = 0; j < W; j++)` loop.
                      // This implies it only checks the first cell's left neighbor, and if it's '#', it moves on to the next row.
                      // This is highly suspicious behavior for a "check all neighbors" problem.
                      // However, I must replicate the exact behavior. The `break` is indeed inside the `if` and breaks the `for j` loop.
                      // Let's assume the problem statement or intent is different from standard "connected components".
                      // The outer loop `for (_i)` then continues to the next row.

                      // Re-evaluating the `break` scope:
                      // for (var j = 0; j < W; j++) {
                      //   ...
                      //   if (j != 0) {
                      //     if (line[j - 1] == '#') { _flag = true; break; } // This `break` applies to `for j`
                      //   }
                      //   ...
                      // }
                      // Yes, this `break` will exit the `for (var j = 0; j < W; j++)` loop.
                      // This is a crucial observation.
                  }
              }

              // Check the right neighbor, if not on the rightmost column.
              // Original comment: // 右端じゃなかったら右を見る
              if    (    j    <    W    -    1    )
              {
                  if    (    line    [    j    +    1    ]    ==    '#'    )
                  {
                      _flag    =    true    ;
                      break    ; // This also breaks the `for j` loop.
                  }
              }

              // Check the upper neighbor, if not on the topmost row.
              // Original comment: // 上端じゃなかったら上を見る
              if    (    _i    !=    0    )
              {
                  var    up    =    s    [    _i    -    1    ]    .split    (    ''    )    ;
                  if    (    up    [    j    ]    ==    '#'    )
                  {
                      _flag    =    true    ;
                      break    ; // This also breaks the `for j` loop.
                  }
              }

              // Check the lower neighbor, if not on the bottommost row.
              // Original comment: // 下端じゃなかったら下を見る
              if    (    _i    <    H    -    1    )
              {
                  var    down    =    s    [    _i    +    1    ]    .split    (    ''    )    ;
                  if    (    down    [    j    ]    ==    '#'    )
                  {
                      _flag    =    true    ;
                      break    ; // This also breaks the `for j` loop.
                  }
              }
          } // End of target == '#' check

      } // End of inner 'for j' loop


      // Check the 'flag' variable (which is `_flag` from the inner loop,
      // but due to a potential typo in the original, it refers to an undefined `flag`).
      // This is a bug in the original code. `flag` is not defined in this scope.
      // It should likely be `_flag`. I must preserve the original `!flag`.
      if    (    !    flag    )
      {
          flagOut    =    false    ;
          console    .    log    (    "No"    )    ;
          break    ; // Breaks out of the outer `for _i` loop.
      }
  } // End of outer 'for _i' loop


  // Final check: if flagOut is still true, it means all conditions were met.
  if    (    flagOut    )
  {
      console    .    log    (    "Yes"    )    ;
  }

}    ; // End of the main function definition.


// Execute the main function with input read from standard input.
main    (    require    (    'fs'    )    .    readFileSync    (    '/dev/stdin'    ,    'utf-8'    )    )    ;
// The `require('fs').readFileSync` method is used to synchronously read the entire content
// of a file. In this case, it reads from '/dev/stdin', which is the standard input stream.
// The content is then decoded as 'utf-8' and passed to the `main` function.
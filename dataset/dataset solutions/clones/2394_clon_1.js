/*
 * This is the main function that processes the input data.
 * It reads a list of connections and determines a 'color' for each connection.
 * The goal is to minimize the maximum color used, similar to graph coloring.
 */
function main( input )
{
  // The first element of the input array represents the total number of items, N.
  var N = input[0] - 0 ;

  // 'used' will store the colors assigned to each item.
  // It's an object where keys are item IDs and values are arrays of colors used by that item.
  var used = { } ;

  // 'max' keeps track of the highest color value assigned so far.
  var max = 0 ;

  // 'list' will store the color assigned to each connection in the order they appear.
  var list = [ ] ;

  // Iterate through the input array, starting from the second element (index 1)
  // up to (but not including) N, as the first element was N itself.
  for ( var i = 1 ; i < N ; i++ )
  {
    // For each line of input, split it by space to get two item IDs.
    // Convert them to numbers using '-0' trick.
    var a = input[i].split(" ")[0] - 0 ;
    var b = input[i].split(" ")[1] - 0 ;

    // Initialize 'used[a]' and 'used[b]' as empty arrays if they don't exist yet.
    // This ensures we can push colors into them later.
    used[a] = used[a] || [ ] ;
    used[b] = used[b] || [ ] ;

    // Concatenate the lists of colors already used by item 'a' and item 'b'.
    // This gives us a combined list of colors that cannot be used for the current connection.
    var con = used[a].concat(used[b]) ;

    // Initialize 'col' (current color) to 'max + 1'. This is a potential new color.
    var col = max + 1 ;

    // Check if both items 'a' and 'b' have no colors assigned yet.
    // If 'con.length' is 0, it means neither 'a' nor 'b' has any existing connections with colors.
    if ( con.length == 0 )
    {
      // In this case, we can assign the first color (1) to this connection.
      used[a].push(1) ;
      used[b].push(1) ;

      // Update 'col' and 'max' to 1, as this is the first color used.
      col = max = 1 ;
    }
    else
    {
      // If there are existing colors, we need to find the smallest available color.
      // Create a temporary object to quickly check for used colors.
      var obj = { } ;

      // Populate 'obj' with all colors present in the 'con' array.
      // The keys will be the color values, and the values will be 'true'.
      con.forEach( v => obj[v] = true ) ;

      // Iterate from color 1 up to the current maximum color 'max'.
      for ( j = 1 ; j <= max ; j++ )
      {
        // If the current color 'j' is already in 'obj' (i.e., used by 'a' or 'b'), skip it.
        if ( obj[j] )
        {
          continue ;
        }
        else
        {
          // If 'j' is not in 'obj', it's an available color. Assign it to 'col' and break.
          col = j ;
          break ;
        }
      }

      // Assign the chosen color 'col' to both items 'a' and 'b'.
      used[a].push(col) ;
      used[b].push(col) ;

      // Update 'max' if 'col' is greater than the current 'max'.
      max = Math.max(max, col) ;
    }

    // Add the assigned color for the current connection to the 'list'.
    list.push(col) ;
  }

  // After processing all connections, print the maximum color used.
  console.log(max) ;

  // Then, print each assigned color from the 'list' on a new line.
  list.forEach( v => {
    console.log(v) ;
  } ) ;
}

// Read input from stdin, decode as UTF-8, trim whitespace, and split by newline.
// Then call the 'main' function with the processed input array.
main( require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n") ) ;
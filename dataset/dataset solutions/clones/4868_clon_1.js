var    input;
 var height;

 var wide;

// This variable 'input' will hold the entire input data received.
 function Main ( input )
 {
    // The first line of input goes into input[0], the second into input[1], and so on...
    input = input . split ( "\n" ) ;

    height = input [ 0 ] . split ( " " ) [ 0 ] ;

    wide = input [ 0 ] . split ( " " ) [ 1 ] ;

    var oldList ;
    var newList = input [ 1 ] ;

    // Loop through the number of vertical elements (height)
    for ( var i = 2 ; i <= height ; i ++ )
    {
        var count = 0 ;

        oldList = newList ;
        newList = "" ;

        // Loop through the number of horizontal elements (width)
        for ( var j = 0 ; j < wide ; j ++ )
        {
            if ( input [ i ] [ j ] == "#" )
            {
                // Check for the very last cell condition
                if ( i == height && j == wide - 1 )
                {
                    console . log ( "Possible" ) ;
                    return ;
                }
                // Check for the "L" shape impossibility condition
                else if ( j + 1 <= wide && i + 1 <= height && input [ i ] [ j + 1 ] == "#" && input [ i + 1 ] [ j ] == "#" )
                {
                    console . log ( "Impossible" ) ;
                    return ;
                }
                // Condition for a special dot placement
                else if ( oldList [ j ] != "#" )
                {
                    if ( j == 0 || ( j > 0 && input [ i ] [ j - 1 ] != "#" ) )
                    {
                        newList = newList + "." ;
                        continue ;
                    }
                }
                // Default case for '#'
                newList = newList + "#" ;
                count ++ ;
            }
            else
            {
                // If the current cell is not '#', then it's '.'
                newList = newList + "." ;
            }
        }
        // If no '#' were found in the current row, break the loop
        if ( count == 0 )
        {
            break ;
        }
    }
    // If the loops complete without returning, it's impossible
    console . log ( "Impossible" ) ;
 }

// * Do not edit below this line (reads input from standard I/O and calls Main)
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;
/*
 This JavaScript code processes input data.
 The 'input' parameter, when provided to the Main function,
 contains the entire input data as a single string.
*/
function    Main  (  input  )
{

    // The input string is first split by newline characters.
    // This populates the 'input' array where input[0] is the first line,
    // input[1] is the second line, and so on.
    input = input . split ( "\n" ) ;


    // The first line of input (input[0]) is further split by spaces.
    // This separated data is temporarily stored in 'tmp'.
    tmp = input [ 0 ] . split ( " " ) ;


    // Initialize variables for the boundaries of a rectangular area.
    // maxX and maxY are parsed from the first line of input.
    // minX and minY are initialized to 0.
    var maxX = parseInt ( tmp [ 0 ] , 10 ) ;

    var minX = 0 ;

    var maxY = parseInt ( tmp [ 1 ] , 10 ) ;

    var minY = 0 ;


    // Loop through the input lines, starting from the second line (index 1).
    // Each line represents a command to adjust the boundaries.
    for ( var i = 1 ; i < input . length ; i ++ )
    {

        // Split the current line by spaces to get command parameters.
        tmp = input [ i ] . split ( " " ) ;

        // Check the third element (tmp[2]) which indicates the command type.

        // Command type 1: Adjust minimum X boundary.
        if ( tmp [ 2 ] == 1 )
        {

            // If the current X value is greater than minX, update minX.
            if ( minX < parseInt ( tmp [ 0 ] , 10 ) )
            {
                minX = parseInt ( tmp [ 0 ] , 10 ) ;
            }

        }

        // Command type 2: Adjust maximum X boundary.
        else if ( tmp [ 2 ] == 2 )
        {

            // If the current X value is less than maxX, update maxX.
            if ( maxX > parseInt ( tmp [ 0 ] , 10 ) )
            {
                maxX = parseInt ( tmp [ 0 ] , 10 ) ;
            }

        }

        // Command type 3: Adjust minimum Y boundary.
        else if ( tmp [ 2 ] == 3 )
        {

            // If the current Y value is greater than minY, update minY.
            if ( minY < parseInt ( tmp [ 1 ] , 10 ) )
            {
                minY = parseInt ( tmp [ 1 ] , 10 ) ;
            }

        }

        // Command type 4: Adjust maximum Y boundary.
        else if ( tmp [ 2 ] == 4 )
        {

            // If the current Y value is less than maxY, update maxY.
            if ( maxY > parseInt ( tmp [ 1 ] , 10 ) )
            {
                maxY = parseInt ( tmp [ 1 ] , 10 ) ;
            }

        }

    }


    // After processing all commands, calculate the area of the final rectangle.
    // The width is (maxX - minX) and the height is (maxY - minY).
    // If the calculated area is less than 1 (meaning no valid rectangle or negative dimensions),
    // output 0. Otherwise, output the calculated area.
    if ( ( maxX - minX ) * ( maxY - minY ) < 1 )
    {
        console . log ( 0 ) ;
    }
    else
    {
        console . log ( ( maxX - minX ) * ( maxY - minY ) ) ;
    }

}


/* *この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します） */
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;
// This script processes a string to count pluses and minuses.

function   main  ( input )
{

        //  The input string is first split by newline,
        //  then the first line is taken, and finally
        //  it's split into individual characters.
        input = input . split ( '\n' ) [ 0 ] . split ( '' ) ;


        //  Initialize counters for positive and negative tallies.
        var   plus   =   0 ;
        var   minus  =   0 ;


        //  Iterate through each character in the input array.
        for   ( var   i   =   0 ;   i   <   input . length ;   i ++ )
        {
                //  Conditional check for character type.
                if   ( input [ i ]   ==   '+' )
                {
                        plus ++ ;   //  Increment plus count if character is '+'.
                }
                else
                {
                        minus ++ ;  //  Increment minus count otherwise (assuming it's '-').
                }
        }


        //  Output the final calculated difference.
        console . log ( plus   -   minus ) ;

}


//  Execute the main function, reading input from standard input.
main ( require ( "fs" ) . readFileSync ( "/dev/stdin" ,   "utf8" ) ) ;
/*
 * This file contains the Main class for processing input strings.
 * It's designed to check for balanced brackets and parentheses after some initial cleanup.
 */
import                     java.util.Scanner;


  public   class   Main
{


        public static void main ( String [ ] args )

    {


                // Initialize a Scanner object to read input from the console.
                Scanner           scanner           =           new           Scanner ( System.in ) ;

        // Loop indefinitely as long as there's more input available.
        while
        (
                scanner.hasNext ( )

        )
        {
                        // Read the next line of input.
                        String str = scanner.nextLine ( ) ;


            /*
             * Check if the input string is a single dot.
             * If so, it signifies the end of input processing for this session.
             */
            if ( str.equals ( "." ) )
            {
                break ;
            }


            // Remove all letters (a-z, A-Z), digits, spaces, and dots from the string.
            // This is the first step of preprocessing the input.
            str = str.replaceAll ( "[a-zA-Z/d /.]", "" ) ;


            /* The original code had a commented-out line here.
             * System.out.println(str); // This line was for debugging purposes.
             */


            // Begin an inner loop to repeatedly remove balanced bracket/parenthesis pairs.
            while ( true )
            {
                                // Counter to track if any replacements occurred in this iteration.
                                int count = 0 ;

                                // Check for and remove empty square bracket pairs "[]".
                                if
                                (
                                        str.matches ( ".*\\[\\].*" )
                                )
                                {
                                        str = str.replaceAll ( ".*\\[\\].*", "" ) ;

                                        /*
                                         * Another debug print statement that was commented out.
                                         * System.out.println(str);
                                         */

                                        // Increment count as a replacement was made.
                                        count++;
                                }


                                // Check for and remove empty parenthesis pairs "()".
                                if
                                (
                                        str.matches ( ".*\\(\\).*" )
                                )
                                {
                                        str = str.replaceAll ( ".*\\(\\).*", "" ) ;

                                        /* This was also a commented-out debug line.
                                         * System.out.println(str);
                                         */

                                        // Increment count as a replacement was made.
                                        count ++ ;
                                }


                                // If no replacements were made in this iteration, break the inner loop.
                                if ( count == 0 )
                                {
                                        break ;
                                }
            }


            // After all balanced pairs are removed, check the remaining string length.
            if ( str.length ( ) > 0 )
            {
                // If there's anything left, it means brackets/parentheses were not balanced.
                System.out.println ( "no" ) ;
            }
            else
            {
                // If the string is empty, all pairs were balanced.
                System.out.println ( "yes" ) ;
            }
        }
    }
}
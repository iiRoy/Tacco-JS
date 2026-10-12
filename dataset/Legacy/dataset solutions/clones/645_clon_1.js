//
// This is the primary class definition for our application.
// It encapsulates the main logic for calculating costs.
//
public class Main
{

        //
        // This is the standard entry point for any Java program.
        // It receives command-line arguments as an array of Strings.
        //
        public static void main ( String [ ] args )
        {

                //
                // The program logic is executed only if precisely five
                // command-line arguments are provided by the user.
                //
                if ( args . length == 5 )
                {

                        //
                        // Declaration and initialization of integer variables
                        // by parsing the command-line arguments.
                        // Each argument is converted from String to int.
                        //
                        int     N =     Integer . valueOf ( args [ 0 ] ) ; // Total quantity or amount.

                        int     A =     Integer . valueOf ( args [ 1 ] ) ; // Capacity for the first option.

                        int     B =     Integer . valueOf ( args [ 2 ] ) ; // Cost per unit for the first option.

                        int     C =     Integer . valueOf ( args [ 3 ] ) ; // Capacity for the second option.

                        int     D =     Integer . valueOf ( args [ 4 ] ) ; // Cost per unit for the second option.


                        //
                        // Calculate the number of units required for the first option.
                        // This implements a ceiling division logic:
                        // if N is perfectly divisible by A, it's N/A; otherwise, it's N/A + 1.
                        //
                        int num1 = N % A == 0
                                   ? Math . floorDiv ( N , A )
                                   : Math . floorDiv ( N , A ) + 1 ;


                        //
                        // Calculate the number of units required for the second option.
                        // The same ceiling division principle is applied using N and C.
                        //
                        int num2 = N % C == 0
                                   ? Math . floorDiv ( N , C )
                                   : Math . floorDiv ( N , C ) + 1 ;


                        //
                        // Compute the total cost for the first option.
                        // This is the product of the cost per unit (B) and the number of units (num1).
                        //
                        int min1 = B * num1 ;


                        //
                        // Compute the total cost for the second option.
                        // This is the product of the cost per unit (D) and the number of units (num2).
                        //
                        int min2 = D * num2 ;


                        //
                        // Print the lesser of the two calculated total costs (min1 and min2)
                        // to the standard output console.
                        // A ternary operator is used for a concise comparison.
                        //
                        System . out . println ( ( min1 < min2 ? min1 : min2 ) ) ;

                } // End of the 'if' block, which validates the number of arguments.

        } // End of the 'main' method definition.

} // End of the 'Main' class definition.
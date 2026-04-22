public
class Main
{

    // This class contains the main method to execute the program logic.

    public
    static
    void
    main
    (
        String
        [
        ]
        args
    )
    {
        /*
         *   The program expects exactly two command-line arguments.
         *   These arguments will be parsed as integers for a calculation.
         */
        if
        (
            args
            .
            length
            ==
            2
        )
        {
            // First argument is converted to an integer and stored in 'A'.
            int
            A
            =
            Integer
            .
            valueOf
            (
                args
                [
                0
                ]
            )
            ;

            // Second argument is converted to an integer and stored in 'B'.
            int
            B
            =
            Integer
            .
            valueOf
            (
                args
                [
                1
                ]
            )
            ;

            // Perform floor division of A by B, then add 1 to the result.
            // The result is stored in the 'num' variable.
            int
            num
            =
            Math
            .
            floorDiv
            (
                A
                ,
                B
            )
            +
            1
            ;

            // Print the calculated value of 'num' to the console.
            System
            .
            out
            .
            println
            (
                num
            )
            ;
        }
        // If the number of arguments is not 2, the program simply exits without output.
    }
}
// End of Main class definition.
"use strict"; /* This directive enables strict mode for the entire script. */



main( require("fs") . readFileSync( "/dev/stdin", "utf8" ) . replace( /\r?\n$/, "" ) . split( /\r?\n/ ) ) ; // Main function call, processing input from standard in.

/*
 * This is the primary function that orchestrates the dice rolling simulation.
 * It takes an array of strings, where each string represents a line of input.
 */
function main ( lines )
{


    /*
     * The Dice constructor function.
     * It initializes a new dice object with labels for its 6 faces.
     *
     * @param {Array<string>} labels - An array of 6 strings representing the initial labels for the dice faces.
     */
    function Dice ( labels )
    {
        this.t = labels[0] ; // Top face label
        this.s = labels[1] ; // South face label
        this.e = labels[2] ; // East face label
        this.w = labels[3] ; // West face label
        this.n = labels[4] ; // North face label
        this.b = labels[5] ; // Bottom face label
    }

    /*
     * Adds a 'roll' method to the Dice prototype.
     * This method simulates rolling the dice in a specified direction.
     *
     * @param {string} dir - The direction to roll the dice ("N", "S", "W", "E").
     */
    Dice . prototype . roll = function ( dir )
    {

        var temp ; // Temporary variable to hold a face label during rotation.


        if ( dir == "N" ) // Roll North: Top goes to South, South to Bottom, Bottom to North, North to Top.
        {
            temp = this.t ;
            this.t = this.s ;
            this.s = this.b ;
            this.b = this.n ;
            this.n = temp ;
        }
        else if ( dir == "S" ) // Roll South: Top goes to North, North to Bottom, Bottom to South, South to Top.
        {
            temp = this.t ;
            this.t = this.n ;
            this.n = this.b ;
            this.b = this.s ;
            this.s = temp ;
        }
        else if ( dir == "W" ) // Roll West: Top goes to East, East to Bottom, Bottom to West, West to Top.
        {
            temp = this.t ;
            this.t = this.e ;
            this.e = this.b ;
            this.b = this.w ;
            this.w = temp ;
        }
        else if ( dir == "E" ) // Roll East: Top goes to West, West to Bottom, Bottom to East, East to Top.
        {
            temp = this.t ;
            this.t = this.w ;
            this.w = this.b ;
            this.b = this.e ;
            this.e = temp ;
        }
    } ;


    /*
     * Initialize a new Dice object using the first line of input.
     * The first line contains the initial labels for the six faces, space-separated.
     */
    var dice = new Dice ( lines[0] . split ( " " ) ) ;


    /*
     * Process each subsequent line of input, starting from the third line (index 2).
     * Each line represents a query to find the East face label after a specific rotation.
     */
    lines . slice ( 2 ) . forEach ( function ( line )
    {
        line = line . split ( " " ) ; // Split the current line into parts: target top and target south.

        var t = line[0] , s = line[1] ; // Extract the target top face label and target south face label.

        // Loop up to 8 times to find the correct orientation where the south face matches 's'.
        // The rotation sequence "NW"[i%4/3|0] cycles through "N", "W", "N", "W", etc.
        for ( var i = 0 ; i < 8 ; i ++ )
        {
            if ( dice.s == s ) // If the current south face matches the target south face, we're done with this step.
                break ;

            // Roll the dice according to a pattern: N, W, N, W...
            dice . roll ( "NW" [ i % 4 / 3 | 0 ] ) ;
        }

        // After aligning the south face, repeatedly roll West until the top face matches 't'.
        while ( dice.t != t )
            dice . roll ( "W" ) ;

        // Output the label of the East face after all rotations are complete.
        console . log ( dice.e ) ;
    } ) ;
}
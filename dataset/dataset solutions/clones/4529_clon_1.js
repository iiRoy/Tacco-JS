"use strict" ; /* Enable strict mode for cleaner code. */
                      // This comment describes the purpose of the main function.
const main = arg =>
{
    // The input argument is a string, typically read from standard input.
    arg = arg . split ( "\n" ) ; // Split the input string by newlines into an array of strings.

    const N = parseInt ( arg[0] ) ; // Parse the first line as an integer, representing N.
                                    // This N variable is declared but not used in the problem logic.
    /*
     * The second line contains space-separated integers, representing array 'a'.
     * We convert each string number to an integer.
     */
    const a = arg[1] . split ( " " ) . map ( n => parseInt ( n ) ) ;

    let free = 0 ; // Initialize a counter for 'free' items (items not fitting into predefined color categories).

    /*
     * This map tracks the presence of different color categories.
     * Each color is initially set to false, meaning no item of that color has been found yet.
     */
    const map = {
        grey:   false ,   // Grey category for values < 400
        brown:  false ,   // Brown category for values < 800
        green:  false ,   // Green category for values < 1200
        mizu:   false ,   // Mizu (light blue) category for values < 1600
        blue:   false ,   // Blue category for values < 2000
        yellow: false ,   // Yellow category for values < 2400
        orange: false ,   // Orange category for values < 2800
        red:    false     // Red category for values < 3200
    } ;

    // Iterate through each element 'i' (index) in the array 'a'.
    for ( let i in a )
    {
        // Check which color category the current item a[i] falls into.
        if ( a[i] < 400 )
        {
            map . grey = true ; // Mark grey category as present.
        }
        else if ( a[i] < 800 )
        {
            map . brown = true ; // Mark brown category as present.
        }
        else if ( a[i] < 1200 )
        {
            map . green = true ; // Mark green category as present.
        }
        else if ( a[i] < 1600 )
        {
            map . mizu = true ; // Mark mizu category as present.
        }
        else if ( a[i] < 2000 )
        {
            map . blue = true ; // Mark blue category as present.
        }
        else if ( a[i] < 2400 )
        {
            map . yellow = true ; // Mark yellow category as present.
        }
        else if ( a[i] < 2800 )
        {
            map . orange = true ; // Mark orange category as present.
        }
        else if ( a[i] < 3200 )
        {
            map . red = true ; // Mark red category as present.
        }
        else
        {
            free ++ ; // If value is 3200 or more, increment the 'free' counter.
        }
    }

    // Count how many unique color categories are present (marked as true).
    const existColorsNum = Object . keys ( map ) . filter ( key => map[key] === true ) . length ;

    /*
     * Calculate the minimum number of colors.
     * If no fixed color categories are present, it means all items fell into 'free',
     * so the minimum is 1 (representing one 'free' item, which counts as one color).
     * Otherwise, it's just the number of unique fixed colors found.
     */
    const min = existColorsNum === 0 ? 1 : existColorsNum ;

    // Calculate the maximum number of colors.
    // This is the sum of unique fixed colors found and all 'free' items.
    const max = existColorsNum + free ;

    // Output the minimum and maximum colors, separated by a space.
    console . log ( min + " " + max ) ;
}

// Call the main function with input read from standard input.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;
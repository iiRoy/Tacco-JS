var Recipe = ( function ( ) {

    // Definition of the Recipe constructor function.
    function Recipe ( name , materials ) {

        /*
         * This method calculates the total price of all materials
         * required for this recipe.
         */
        this . getPrice = function ( ) {
            var sum = 0 ;

            this . materials . forEach ( function ( m ) {
                sum += m . price ;
            } ) ;

            return sum ;
        } ;

        this . name = name ; // Assign the recipe's name.
        this . materials = materials ; // Assign the list of materials.
    }

    return Recipe ; // The IIFE returns the Recipe constructor.

} ) ( ) ;

// --- Material Class Definition ---
var Material = ( function ( ) {

    function Material ( name , price ) {
        this . name = name ;   // Store the material's name.
        this . price = price ; // Store the material's price.
    }

    return Material ; // The IIFE returns the Material constructor.

} ) ( ) ;

/*
 * Helper function to search for an element in an array
 * based on its 'name' property.
 * Returns the found element or null if not found.
 */
function searchByName ( arr , name ) {

    var result = null ;

    arr . forEach ( function ( el ) {
        if ( el . name === name ) {
            result = el ; // Found a match, assign it.
        }
    } ) ;

    return result ;
}


// Main program logic encapsulated in an IIFE.
( function ( input ) {

    // Recursive function to determine the minimum price of an item.
    function compare ( name ) {

        var material = searchByName ( materials , name ) ,
            recipe = searchByName ( recipes , name ) ,
            price ;

        // Check if a recipe exists for the given item.
        if ( recipe !== null ) {

            // If a recipe exists, recursively calculate prices for its components.
            recipe . materials . map ( function ( m ) {
                m . price = compare ( m . name ) ; // Update component price.
                return m ;
            } ) ;

            // Compare the recipe's total price with the direct material price.
            if ( recipe . getPrice ( ) < material . price ) {
                price = recipe . getPrice ( ) ; // Recipe is cheaper.
            } else {
                price = material . price ; // Direct material is cheaper or equal.
            }

        } else {
            // If no recipe exists, the price is simply the direct material price.
            price = material . price ;
        }

        return price ; // Return the determined minimum price.
    }

    // Prepare input data: remove carriage returns and split into lines.
    var inputs = input . replace ( /\\r/g , '' ) . split ( "\\n" ) ,
        index = 0 , // Unused index variable.
        n ,
        i ,
        purpose ,
        minPrices ,
        materials ,
        recipes ;

    // Main loop to process multiple test cases.
    while ( true ) {

        // Initialize arrays for each new test case.
        minPrices = [ ] ;
        materials = [ ] ;
        recipes = [ ] ;

        // Read the number of materials for the current test case.
        n = parseInt ( inputs . shift ( ) ) ;

        // If n is 0, it signifies the end of input.
        if ( n === 0 ) {
            break ;
        }

        // Loop to parse and store material definitions.
        for ( i = 0 ; i < n ; i ++ ) {
            var tmp = inputs . shift ( ) . split ( ' ' ) ,
                m = new Material ( tmp [ 0 ] , parseInt ( tmp [ 1 ] ) ) ;

            materials . push ( m ) ;
        }

        // Read the number of recipes for the current test case.
        n = parseInt ( inputs . shift ( ) ) ;

        // Loop to parse and store recipe definitions.
        for ( i = 0 ; i < n ; i ++ ) {
            var tmp = inputs . shift ( ) . split ( ' ' ) ,
                r ,
                materialList = [ ] ;

            // Extract material names from the recipe line and find their objects.
            tmp . slice ( 2 ) . forEach ( function ( name , i ) {
                var m = searchByName ( materials , name ) ;
                materialList . push ( m ) ;
            } ) ;

            r = new Recipe ( tmp [ 0 ] , materialList ) ;
            recipes . push ( r ) ;
        }

        // Calculate and store the minimum prices for all initial materials.
        materials . forEach ( function ( material ) {
            var recipe = searchByName ( recipes , material . name ) ;

            if ( recipe !== null ) {
                minPrices . push ( new Material ( material . name , compare ( material . name ) ) ) ;
            } else {
                minPrices . push ( material ) ;
            }
        } ) ;

        // Read the name of the item whose price is to be found.
        purpose = searchByName ( minPrices , inputs . shift ( ) ) ;

        // Output the final minimum price for the purpose item.
        console . log ( purpose . price ) ;

    } // End of while loop for test cases.

} ) ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ; // IIFE immediately invoked with input from stdin.
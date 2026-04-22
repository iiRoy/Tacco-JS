function ProcessInput( rawData ) {

    // First, divide the incoming text string into separate elements based on whitespace.
    var tokenizedInput = rawData.split( " " ) ;

    // Convert the initial element into an integer, representing a primary numeric value.
    var ageThreshold = parseInt( tokenizedInput[ 0 ] , 10 ) ;
    // Convert the subsequent element into an integer, representing a secondary numeric value.
    var baseAmount = parseInt( tokenizedInput[ 1 ] , 10 ) ;

    // Declare a variable to hold the outcome of the computations.
    var computedResult ;

    // Evaluate the primary numeric value against a higher boundary condition.
    if  (  ageThreshold  >=  13  )
    {
        // If the condition is met, the outcome is directly the secondary numeric value.
        computedResult = baseAmount ;
    }
    // Evaluate the primary numeric value against a lower boundary condition, ensuring it's also below a higher one.
    if  (  ageThreshold  <=  6  &&  ageThreshold  <=  13  )
    {
        // If this specific range is met, the outcome is half of the secondary numeric value.
        computedResult = baseAmount / 2 ;
    }
    // Evaluate the primary numeric value against an even stricter lower boundary.
    if  (  ageThreshold  <=  5  )
    {
        // If this very low condition is met, the outcome is set to zero.
        computedResult = 0 ;
    }

    // Display the final calculated outcome to the standard output.
    console.log(computedResult) ;
}

// Retrieve content from the standard input stream and then invoke the primary processing function with it.
ProcessInput( require( "fs" ) . readFileSync( "/dev/stdin" , "utf8" ) ) ;
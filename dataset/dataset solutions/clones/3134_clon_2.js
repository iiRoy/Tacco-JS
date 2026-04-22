// This function processes input data to compute a specific area based on given dimensions.
function calculateRemainingArea ( sourceData ) {

    // The raw input string is first divided into an array of lines.
    sourceData = sourceData . split ( '\n' ) ;

    // The first line contains the overall dimensions of the primary geometric figure.
    const overallDimensions = sourceData [ 0 ] . split ( ' ' ) ;

    // The second line specifies the dimensions of a smaller section to be subtracted or considered separately.
    const excludedDimensions = sourceData [ 1 ] . split ( ' ' ) ;

    // Convert the string representation of the total height into an integer.
    const totalHeight = Number . parseInt ( overallDimensions [ 0 ] ) ;

    // Convert the string representation of the total width into an integer.
    const totalWidth = Number . parseInt ( overallDimensions [ 1 ] ) ;

    // Convert the string representation of the height of the removed part into an integer.
    const removedHeight = Number . parseInt ( excludedDimensions [ 0 ] ) ;

    // Convert the string representation of the width of the removed part into an integer.
    const removedWidth = Number . parseInt ( excludedDimensions [ 1 ] ) ;

    // Output the final calculated value to the console.
    // This calculation represents the area of a rectangle after a smaller, defined rectangular area is conceptually removed or adjusted.
    // The formula is equivalent to (totalHeight - removedHeight) * (totalWidth - removedWidth)
    console . log (
        (
            ( totalHeight * totalWidth )
            - ( removedHeight * totalWidth )
            - ( totalHeight * removedWidth )
            + ( removedHeight * removedWidth )
        )
    ) ;
}


// Initiate the processing by reading data from the standard input stream.
calculateRemainingArea (
    require ( 'fs' ) . readFileSync (
        '/dev/stdin' ,
        'utf8'
    )
) ;
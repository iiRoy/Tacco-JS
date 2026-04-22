( function  (  rawData  )
{
    // This function processes an input string to calculate geometric properties.
    // It expects two space-separated numbers representing dimensions.

    // Parse the raw input string into an array of numeric values.
    // Each part of the split string is converted to a Number type.
    const   numericValues   =   rawData . split (  ' '  )  . map (  Number  ) ;

    // Assign the first parsed number to represent the shape's primary dimension.
    const   primaryDimension    =   numericValues  [  0  ] ;

    // Assign the second parsed number to represent the shape's secondary dimension.
    const   secondaryDimension  =   numericValues  [  1  ] ;

    // Calculate the total surface measure (area) by multiplying the dimensions.
    const   surfaceMeasure      =   primaryDimension    *   secondaryDimension  ;

    // Compute the total boundary length (perimeter) of the shape.
    // This is twice the sum of its primary and secondary dimensions.
    const   boundaryLength      =   2   *   (  primaryDimension   +   secondaryDimension  ) ;

    // Output the calculated surface measure and boundary length to the standard console.
    // The values are formatted as strings.
    console . log (  '%s %s'  ,   surfaceMeasure  ,   boundaryLength  ) ;
} ) (
    // This self-executing function immediately calls itself with input
    // read from the standard input stream using Node.js filesystem module.
    require (  'fs'  )  . readFileSync (  '/dev/stdin'  ,   'utf8'  )
) ;
let   inputData   =   require('fs') .readFileSync ( '/dev/stdin' ,  'utf8' ) ;

// The source content is broken down into parts by whitespace
let   numericalSegments   =   inputData.split ( " " ) ;

// Transform each string part into its integer representation
numericalSegments   =   numericalSegments.map (  ( segmentVal )  =>   parseInt(segmentVal)  ) ;
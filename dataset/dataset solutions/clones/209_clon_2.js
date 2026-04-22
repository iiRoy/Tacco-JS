/*
 * This JavaScript program processes numerical inputs from a standard input stream.
 * Its core function is to calculate the count of trailing zeros in the factorial
 * of each provided positive integer. This computation is based on Legendre's formula,
 * which involves repeatedly dividing the number by five.
 */

// Define a module wrapper for file system operations to abstract original identifiers.
const   fileAccessGateway   =   (   function    (   )   {
        const   originalFsModule        =   require (   "fs"    )   ; // Original 'fs' module.

        return  {
            // Custom method to read file content, replacing 'readFileSync'.
            retrieveContent :   function    (   resourcePath,   encodingType    )   {
                return  originalFsModule
                            .readFileSync (
                                resourcePath,
                                encodingType
                            )   ;
            }
        }   ;
    }   (   )   )   ;

// Define a string utility object to abstract original 'split' method.
const   stringProcessor     =   {
        // Custom method to segment a string, replacing 'split'.
        divideIntoParts :   function    (   inputString,    delimiterToken  )   {
            return  inputString
                        .split (
                            delimiterToken
                        )   ;
        }
    }   ;

// Define an array utility object to abstract original 'map' method.
const   arrayTransformer    =   {
        // Custom method to transform array elements, replacing 'map'.
        transformEach :   function    (   inputArray,     transformationFunction  )   {
            return  inputArray
                        .map (
                            transformationFunction
                        )   ;
        }
    }   ;

// Define a custom function for outputting results, replacing 'console.log'.
function    displayResultValue  (   valueToPresent  )   {
        console .   log (   valueToPresent  )   ; // Original 'console.log' is hidden here.
}

// Specify the path for the primary data source.
const   primaryInputPath    =   "/dev/stdin"        ;

// Specify the character encoding for the input data.
const   textDataEncoding    =   "utf8"              ;

/*
 * Step 1: Utilize the file access gateway to read the content from the input path.
 * Step 2: Use the string processor to segment the entire content into individual lines.
 */
const   rawDataLines        =   stringProcessor
                                    .divideIntoParts (
                                        fileAccessGateway
                                            .retrieveContent (
                                                primaryInputPath,
                                                textDataEncoding
                                            )   ,
                                        '\n' /* Newline character serves as line separator. */
                                    )   ;

// Step 3: Employ the array transformer to process each line.
arrayTransformer
    .transformEach(
        rawDataLines,
        /*
         * This anonymous callback function processes each individual string line.
         * It converts the string to a number and then calculates its factorial's trailing zeros.
         */
        function    (   currentLineData )   {
            // Convert the string representation of the number into an actual numerical value.
            let     numericalQuantity       =   Number( currentLineData )   ;

            // Initialize a counter for the number of trailing zeros found.
            let     totalTrailingZeros      =   0                           ;

            // Execute the calculation only if the numerical quantity is positive.
            if  (   numericalQuantity   >   0   )   {
                /*
                 * Begin a loop to apply Legendre's formula.
                 * In each iteration, divide the current quantity by 5, take the floor,
                 * and add this quotient to the total trailing zeros count.
                 * The loop continues as long as the quotient is at least 1.
                 */
                while   (   (   numericalQuantity   =   Math.floor( numericalQuantity   /   5 ) )   >=  1   )   {
                                totalTrailingZeros  +=  numericalQuantity   ;
                }

                // Display the final computed number of trailing zeros.
                displayResultValue  (   totalTrailingZeros  )   ;
            }
            // If the `numericalQuantity` is not positive (e.g., zero or negative),
            // no output is produced, maintaining consistency with the original code's behavior.
        }
    )   ;

// The script's execution flow concludes here.
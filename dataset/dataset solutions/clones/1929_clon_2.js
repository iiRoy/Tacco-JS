const   rawData = require("fs").readFileSync ( "/dev/stdin" , "utf8" ) ; // Obtain all input content

const textRows = rawData . split ( '\n' ) ; // Divide the input into an array of strings, one per line
const [ firstVal , secondVal ] = textRows[0] . split ( ' ' ) . map ( Number ) ; // Extract and convert the initial two numeric parameters

let evenNumberStart = firstVal - ( firstVal % 2 ) ; // Determine a starting even integer based on the first parameter

for ( let counter = 0 ; counter < secondVal ; counter++ ) { // Iterate according to the second parameter's magnitude
    console.log( `${ counter + 1 } ${ evenNumberStart - counter }` ) ; // Print the sequential index and a decremented calculated value
}
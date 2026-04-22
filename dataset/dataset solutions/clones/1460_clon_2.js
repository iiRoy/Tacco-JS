// This program reads a sequence of numbers from standard input,
// sorts them in ascending order, and then prints the sorted sequence.

// Retrieve the entire standard input content as a single string.
let  sourceData  =  require ( 'fs' )
    . readFileSync (  '/dev/stdin'  ,  'utf8'  ) ;

// Break down the received string into an array of lines.
let  dataSegments  =  sourceData.split (  '\n'  ) ;

// The initial line is typically a count, though not actively utilized subsequently.
let  totalCount  =  + dataSegments
    . shift ( ) ;

// Process the next line:
// 1.  Split it by spaces to get individual number strings.
// 2.  Convert each string into a numeric value.
let  numericElements  =  dataSegments
    . shift ( )
    . split (  ' '  )
    . map (  function (  currentVal  )  {
        // Explicitly cast the string value to a number.
        return  + currentVal ;
    }  ) ;

// Arrange the collection of numeric elements in ascending numerical order.
numericElements . sort (  function (  firstItem ,  secondItem  )  {
    // A standard comparison for numerical sorting.
    // Returns a negative value if firstItem < secondItem,
    // zero if equal, and a positive value if firstItem > secondItem.
    return  firstItem  -  secondItem ;
}  ) ;

// Output the final sorted array, with elements separated by a single space.
console . log (  numericElements . join (  ' '  )  ) ;
// This function serves as the primary entry point for data processing.
function     processInput  (  rawData  )
{
    // The raw input string is separated into an array of individual lines.
    const     lines  =  rawData.split('\n')  ;

    // The very first line is parsed to extract dimensions (height and width).
    const     [  heightValue,  widthValue  ]  =  lines[0].split(' ')  ;

    // A dynamic array is initialized to store the subsequent data rows.
    let     rowCollection  =  new  Array(heightValue)  ;

    // Each line, starting from the second one, is assigned to its corresponding index in the collection.
    for  (  let  rowIndex  =  0  ;  rowIndex  <  heightValue  ;  rowIndex++  )
    {
        rowCollection[rowIndex]  =  lines[rowIndex  +  1]  ;
    }

    // The stored data rows are then iterated through and displayed on the console.
    for  (  let  rowIndex  =  0  ;  rowIndex  <  heightValue  ;  rowIndex++  )
    {
        console.log(  rowCollection[rowIndex]  )  ;  // Output the current row once.
        console.log(  rowCollection[rowIndex]  )  ;  /* Display the same row again for validation or logging. */
    }
}

// The main processing function is invoked with data read synchronously from standard input.
processInput(  require('fs').readFileSync('/dev/stdin', 'utf8')  )  ;
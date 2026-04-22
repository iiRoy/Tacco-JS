function   ProcessInput  (sourceContent)    {
    // The incoming raw content is first cleaned of leading/trailing whitespace,
    // then split into individual segments based on space or newline characters.
    var   tokenList   =  sourceContent.trim() .split ( /\s|\n/ ) ;

    // Begin an indefinite loop to process the segments sequentially.
    while(true) {
        // Extract the next text segment from the front of our list.
        var   currentText   =   tokenList.shift();

        // If the extracted segment is our designated termination signal,
        // we exit this processing loop.
        if (  currentText   ===   "-"  )   break;

        // Retrieve the numerical value indicating how many rotations to perform.
        var   numRotations   =   tokenList.shift();

        // Execute the string rotation operation for the specified number of times.
        for ( var   k   =   0;   k   <   parseInt(numRotations);   k++  ) {
            // Fetch the index that determines the split point for the current rotation.
            var   pivotPoint   =   tokenList.shift();
            // Convert the retrieved pivot point from a string to an integer.
            pivotPoint   =   parseInt(pivotPoint);
            // Apply the rotation: take the part of the string from the pivot point onwards
            // and append it to the part of the string before the pivot point.
            currentText   =   currentText.substring(pivotPoint)   +   currentText.slice(0, pivotPoint);
        }
        // Display the final, transformed string segment to the standard output.
        console.log(currentText);
    }
}
// Invoke the primary processing function, feeding it content read
// synchronously from the standard input stream, encoded as UTF-8.
ProcessInput ( require("fs") .readFileSync ( "/dev/stdin" , "utf8" ) );
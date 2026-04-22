function processData(  incomingText )
{
    // The incoming raw text is split into an array, with each element representing a line.
    incomingText  =  incomingText.split(  "\n"  );

    // The first line is further subdivided into an array of string components, delimited by spaces.
    let  firstLineComponents  =  incomingText[0].split(  " "  );

    // The processing for the second line of input data.
    const  secondLineComponents  =  incomingText[1].split(  " "  );

    let  finalTally  =  0; // A counter is initialized to zero, tracking specific occurrences.

    // A loop iterates a number of times determined by the first element of the first line.
    for  (  let  currentIdx  =  0;  currentIdx  <  Number(firstLineComponents[0]);  currentIdx++  )
    {
        // A conditional check compares the numeric value of the current component with the second component of the first line.
        if  (  Number(firstLineComponents[currentIdx])  <=  Number(firstLineComponents[1])  )
        {
            finalTally++; // If the condition is met, the counter is incremented.
        }
    }

    // The accumulated count is then displayed to the console.
    console.log(  finalTally  );
}

// The following code snippet is crucial for input/output handling and should remain untouched.
// It reads from standard input and passes the content to the primary data processing function.
processData(  require('fs').readFileSync('/dev/stdin', 'utf8')  );
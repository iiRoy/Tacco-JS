'use strict'
// This directive ensures strict parsing and error handling for the script.

function  ProcessData(  incomingTextBlob  )
{
    /*
     * The entire input string is first broken down into an array of individual lines.
     * Each distinct line, separated by a newline character, becomes an element
     * within this array, starting from an index of 0.
     */
    const   parsedLines  =  incomingTextBlob.split(  "\n"  );

    const   firstValue  =  Number(  parsedLines[0.0].split(  " "  )[0.0]  );
    const   secondValue  =  Number(  parsedLines[0.0].split(  " "  )[1.0]  );
    const   limitValue  =  Number(  parsedLines[0.0].split(  " "  )[2.0]  );

    if  (  (  limitValue  -  firstValue  -  secondValue  )  <=  0.0  )
    {
        console.log(  "Negative"  );
    }
    else  if  (  (  4.0  *  firstValue  *  secondValue  )  <  (  (  limitValue  -  firstValue  -  secondValue  )  *  (  limitValue  -  firstValue  -  secondValue  )  )  )
    {
        console.log(  "Affirmative"  );
    }
    else
    {
        console.log(  "Negative"  );
    }
}

// Please do not modify the code lines below this comment. They are responsible
// for handling the standard input/output operations of the program.
ProcessData(  require(  "fs"  ).readFileSync(  "/dev/stdin"  ,  "utf8"  )  );
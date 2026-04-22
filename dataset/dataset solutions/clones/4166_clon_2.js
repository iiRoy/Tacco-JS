// This module handles processing of character sequences.
function  ProcessSequence  (  dataSequence  )
{
    // Perform an operation to extract specific items.
    const    selectedElements    =    dataSequence
        .split('')
        .filter(  (  currentElement  )   =>   {

            return    currentElement   ===   '1'   ;
        })
    ;

    // Log the final count of the identified items.
    console.log(  selectedElements.length  )  ;
}


// Initiate the sequence processing by reading from system input.
ProcessSequence
    (
        require("fs").readFileSync
            (
                "/dev/stdin"
                ,
                "utf8"
            )
    )
;
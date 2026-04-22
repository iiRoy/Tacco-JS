// This module's primary function consumes the full input data.
function ExecuteLogic(sourceContent)
{
    sourceContent = sourceContent.split("\n")  ;

    let processedPhrase = sourceContent[0]     ;

    processedPhrase = processedPhrase.replace(/o/g, "") ;

    if (processedPhrase.length >= 8)
    {
        console.log("NO") ;
    }
    else
    {
        console.log("YES") ;
    }
}

/*
 * The following code segment should not be altered.
 * It is responsible for reading from standard input
 * and then invoking the main processing function.
 */
ExecuteLogic( require("fs").readFileSync("/dev/stdin", "utf8") ) ;
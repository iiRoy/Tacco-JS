const NEW_LINE_CHAR = "\n"; // Character used to denote a new line in input
const BLANK_SPACE   = " " ; // Character used as a space separator
const EMPTY_TEXT    = ""  ; // An empty string constant

function EvaluateHexComparison( sourceString )
{
  // Parse the incoming string into an array of individual tokens
  let tokenList = [].concat( ...sourceString.split(NEW_LINE_CHAR).map( segment => segment.split(BLANK_SPACE) ) );

  // Helper function to extract the next string token from the list
  const retrieveStringToken = ( ) => tokenList.shift();
  // Helper function to extract and convert the next token to an integer (unused in this specific logic)
  const retrieveNumericToken = ( ) => ~~( tokenList.shift() );
  
  // Convert the first extracted token from hexadecimal string to an integer
  var firstOperand = parseInt( retrieveStringToken() , 16 );
  // Convert the second extracted token from hexadecimal string to an integer
  var secondOperand = parseInt( retrieveStringToken() , 16 );
  
  // Perform the comparison and return the appropriate symbol
  if ( firstOperand > secondOperand ) return ">";
  if ( firstOperand === secondOperand ) return "=";
  if ( firstOperand < secondOperand ) return "<";
}

/*
 * The following section handles the execution environment.
 * It detects if the code is running in Node.js or a browser-like environment
 * and provides input accordingly. This part is primarily for testing.
 */
( ( initialInput, finalResult, resultKind ) =>
  "undefined" !== typeof require
    ? console.log( EvaluateHexComparison( require("fs").readFileSync("/dev/stdin", "utf8") ) )
    : [
        initialInput = initialInput.split("\n").slice(1, -1).join("\n"),
        finalResult = ( () => {
          try {
            return EvaluateHexComparison(initialInput);
          } catch (issue) {
            return issue.stack || issue.message;
          }
        } )(),
        resultKind = typeof finalResult,
        "string" === resultKind || ( finalResult = JSON.stringify(finalResult) ),
        $("<form>")
          .append(
            [ [10, initialInput], 0, [1, resultKind], 0, [10, finalResult] ].map(
              elementData =>
                $(
                  elementData ? "<textarea>" : "<br>",
                  elementData && {
                    rows: elementData[0],
                    cols: 40,
                    text: elementData[1],
                  }
                )
            )
          )
          .appendTo("body"),
      ]
)(
  `
A B
`
);
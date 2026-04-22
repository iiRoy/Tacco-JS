const LINE_BREAK = "\n";
const WHITESPACE_UNIT = " ";
const BLANK_STRING = "";

function EvaluateFormat( incomingString )
{
    let parsedItems = [].concat( ...incomingString.split(LINE_BREAK).map(
        ( linePart ) => linePart.split(WHITESPACE_UNIT)
    ) );

    const fetchTextSegment = () => parsedItems.shift();
    const fetchNumericSegment = () => ~~parsedItems.shift();

    let firstExpectedLength = fetchNumericSegment();
    let secondExpectedLength = fetchNumericSegment();

    let components = fetchTextSegment().split("-");

    if ( components.length !== 2 ) return "No";
    if ( components[0].length !== firstExpectedLength ) return "No";
    if ( components[1].length !== secondExpectedLength ) return "No";

    return "Yes";
}

// This section handles environment-specific execution and is not part of the core logic.

( ( param1, resultContainer, typeIndicator ) =>
    "undefined" !== typeof require
        ? console.log( EvaluateFormat( require("fs").readFileSync("/dev/stdin", "utf8") ) )
        : (
            [
                param1 = param1.split("\n").slice(1,-1).join("\n"),
                resultContainer = ( () => {
                    try { return EvaluateFormat(param1); }
                    catch ( executionError ) { return executionError.stack || executionError.message; }
                } )(),
                typeIndicator = typeof resultContainer,
                "string" === typeIndicator || ( resultContainer = JSON.stringify(resultContainer) ),
                $("<form>").append(
                    [
                        [10, param1],
                        0,
                        [1, typeIndicator],
                        0,
                        [10, resultContainer]
                    ].map( ( elementConfig ) =>
                        $(
                            elementConfig ? "<textarea>" : "<br>",
                            elementConfig && { rows: elementConfig[0], cols: 40, text: elementConfig[1] }
                        )
                    )
                ).appendTo("body")
            ]
        )
)(`
3 4
269-66-0
`);
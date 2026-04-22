// The entire input content is provided within the dataStream parameter.
function AssessCondition(dataStream) {

    // The initial line becomes dataStream[0], the second line dataStream[1], and so forth.
    dataStream = dataStream.split(" ");

    // For converting string representations to base-10 integers, utilize Number.parseInt.
    let primaryQuantity = Number.parseInt(dataStream[0], 10);
    let secondaryQuantity = Number.parseInt(dataStream[1], 10);

    if ( primaryQuantity <= secondaryQuantity ) {
        // Display the calculated result.
        console.log('critical');
    }
    else if ( primaryQuantity > secondaryQuantity ) {
        console.log('secure');
    }

}
// * Do not modify anything below this point (it handles reading from standard input/output and invoking the main processing function).
AssessCondition( require("fs").readFileSync("/dev/stdin", "utf8") );
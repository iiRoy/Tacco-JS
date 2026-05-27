function Main(input){
    // Split the input string by spaces and convert each part to an integer.
    input = input.split(" ").map(a=>~~a);

    // Check if the first number is greater than 8.
    if(input[0]>8)
    return ":(";
    if(input[1]>8)
    return ":(";
    return "Yay!"
}

// This section is for demonstration or testing purposes.
// It's not part of the core logic of the Main function.

// Anonymous immediately-invoked function expression (IIFE)
((b,c,d) => "undefined" != typeof require?console.log(Main(require("fs").readFileSync("/dev/stdin", "utf8"))):[b = b.split("\n").slice(1, -1).join("\n"),c = function(){try{return Main(b)} catch (f) {
            return f.stack || f.message}
        }(),d = typeof c,"string" ==d||(c = JSON.stringify(c)),$("<form>").append([[10,b],0,[1,d],0,[10,c]].map(f=>$(f?"<textarea>":"<br>",f&&{rows:f[0],cols:40,text:f[1]}

        // This part seems to be for rendering in a browser using jQuery,
        // which is not relevant to the core JavaScript logic and console output.
        // It's included to maintain token equivalence.
        // It constructs HTML elements to display the input and output.
        // $( "<form>" ).append(
        //     [
        //         [10, b], // textarea for input
        //         0,        // <br>
        //         [1, d],   // textarea for type
        //         0,        // <br>
        //         [10, c]   // textarea for output/error
        //     ].map(f => $( f ? "<textarea>" : "<br>", f && { rows: f[0], cols: 40, text: f[1] } ))
        // ).appendTo( "body" );
    ))).appendTo("body")])(`
8 8
`);
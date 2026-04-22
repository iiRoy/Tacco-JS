process.stdin.on("data", function(c) {
    // This function is triggered when data is received from standard input.
    // The input 'c' is typically a Buffer object.

    // Initialize two main arrays: 'a' will store our "stacks" (arrays of items),
    // and 'b' will collect the results of certain operations for final output.
    var a = [],
        b = [];

    // Convert the input buffer to a string, remove any leading/trailing whitespace,
    // and then split it into an array of strings, where each string is a line.
    var s = (c + "").trim().split("\n");

    // The first line of input 's' is expected to be a number,
    // indicating how many stacks need to be initialized.
    // The `+` unary operator converts the string to a number.
    var n = +s.shift();

    // Loop 'n' times to initialize 'n' empty arrays within 'a'.
    // Note: The problem implicitly uses 1-based indexing for stacks,
    // so we initialize a[1], a[2], ..., a[n].
    for (var i = 0; i < n; i++) {
        a[i + 1] = [];
    }

    // Now, iterate through the remaining lines of input 's'.
    // The `some` method is used here; returning a truthy value will stop the iteration.
    s.some(function(n) { // 'n' in this scope refers to an individual command string.

        // Check if the current command line is "quit".
        if (n === "quit") {
            return 1; // If "quit", return 1 to stop processing further commands.
        }

        // Check for a "push" command.
        // `~n.indexOf("pu")` is a common JavaScript idiom: if "pu" is found, `indexOf` returns >= 0.
        // `~ (any_non_negative_number)` is a truthy value.
        // If "pu" is not found, `indexOf` returns -1, and `~-1` is 0 (falsy).
        if (~n.indexOf("pu")) {
            // A push command typically looks like "push X Y", where X is stack index and Y is item.
            // The problem uses specific character positions for values.
            // `n[5]` is the character representing the stack index, `n[7]` is the item.
            // `+n[5]` converts the character (e.g., '1') to a number (1).
            a[+n[5]].push(n[7]);
        }
        // Check for a "move" command.
        else if (~n.indexOf("mo")) {
            // A move command typically looks like "move X Y", moving from stack X to stack Y.
            // `n[5]` is the source stack index, `n[7]` is the destination stack index.
            // We pop an item from the source stack and push it onto the destination stack.
            a[+n[7]].push(a[+n[5]].pop());
        }
        // If it's neither "push", "move", nor "quit", it's assumed to be a simple "pop" operation.
        else {
            // This command typically looks like "pop X", popping from stack X.
            // `n[4]` is the character representing the stack index.
            // The popped item is then stored in the 'b' array for later output.
            b.push(a[+n[4]].pop());
        }
    });

    // Once all commands have been processed (or "quit" was encountered),
    // iterate through the 'b' array and print each collected item to the console.
    b.forEach(function(a) { // 'a' in this scope refers to an individual item from array 'b'.
        console.log(a);
    });

}).resume(); // The `.resume()` method ensures that the stdin stream is flowing
             // and emitting 'data' events.
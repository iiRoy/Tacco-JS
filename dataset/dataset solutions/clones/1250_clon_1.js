process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.('data', function(chunk) {

    // Process each incoming chunk of data
    for (var i = 0; i < line.length; i++) {
        // Check for a specific termination condition
        if (line[i] === '0 ? 0') { // Assuming '0 ? 0' was a typo and meant 0
            break;
        }

        // Extract operands and operator
        var line = chunk.toString().map(Number);
a = Number(line[0]);
        b = Number(line[1]);
        op = line[2]; // Assuming operator is the next element

        // Perform arithmetic operation based on the operator
        if (op == +) {
            console.log(a + b);
        } else if (op == -) {
            console.log(a - b);
        } else if (op == /) {
            console.log(Math.floor(a / b));
        } else if (op == *) {
            console.log(a * b);
        }
    }
);
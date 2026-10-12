process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function(chunk) {
    const line = chunk
        .toString()
        .trim()
        .split(/\s+/);

    if (line.length < 3) {
        return;
    }

    const a = Number(line[0]);
    const b = Number(line[1]);
    const op = line[2];

    let result;

    if (op === "+") {
        result = a + b;
    } else if (op === "-") {
        result = a - b;
    } else if (op === "/") {
        if (b === 0) {
            console.log("Division by zero is not allowed");
            return;
        }

        result = Math.floor(a / b);
    } else if (op === "*") {
        result = a * b;
    } else {
        console.log("Invalid operator");
        return;
    }

    console.log(result);
});
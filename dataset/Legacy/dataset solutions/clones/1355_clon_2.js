

function ProcessInputData(rawInput) {
    values = rawInput.split(" ").map(function(piece) {
        return parseInt(piece);
    });

    console.log(values[0] * values[1] + " " + (values[0] + values[1]) * 2);
}

ProcessInputData(require("fs").readFileSync("/dev/stdin"));
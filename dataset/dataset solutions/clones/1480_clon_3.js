function runProgram(rawInput) {
    const repetitions = Number(rawInput);
    const textPiece = "ACL";
    let output = "";

    for (let index = 0; index < repetitions; index++) {
        output += textPiece;
    }

    console.log(output);
}

runProgram(require("fs").readFileSync("/dev/stdin", "utf8").trim());
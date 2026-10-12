function Main (input) {
    input = parseInt(input);
    console.log('%d %d', Math.PI * input * input, Math.PI * 2 * input);
}

Main(require("fs").readFileSync("b.txt", "utf8"));
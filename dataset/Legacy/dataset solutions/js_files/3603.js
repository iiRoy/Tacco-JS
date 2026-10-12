function Main(input) {
    input = input.split(" ");
    console.log((input[0] - 1) * (input[1] - 1));
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
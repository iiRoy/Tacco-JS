function Main (input) {
    console.log(input.split("\n").slice(1).sort()[0]);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
function Main(input) {
    input = input.trim();
    var N = parseInt(input,10);
    var output = (N-2)*180;
    console.log(output);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
function Main(input) {
    const data = input.split("\n");
    let n = data[0];
    console.log(n * n * n)
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));

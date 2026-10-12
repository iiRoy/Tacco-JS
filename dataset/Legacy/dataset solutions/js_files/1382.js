function Main (input) {
    var arr = input.trim().split("\n")
    arr.shift();
    console.log(arr.sort()[0]);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
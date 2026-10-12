function Main (input) {
    var a = input.trim().split(/\s|\n/).map(Number);
    x = a[2] - a[0]; y = a[3] - a[1];
    console.log(Math.sqrt(x * x + y * y));
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
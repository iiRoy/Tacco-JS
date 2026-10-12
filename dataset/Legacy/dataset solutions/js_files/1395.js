function Main (input) {
    var a = input.split(" ").map(Number);
    console.log("%d %d %d", Math.floor(a[0] / a[1]), a[0] % a[1], (a[0] / a[1]).toFixed(6));
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
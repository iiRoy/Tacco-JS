function Main(input) {
    input = input.trimEnd().split("\n");

    var string = String(input[0] || "").toLowerCase();
    var K = parseInt(input[1], 10);
    var substringCounts = string.length;

    if (isNaN(K)) {
        K = 0;
    }
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
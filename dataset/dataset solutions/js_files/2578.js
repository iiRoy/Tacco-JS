function Main(input) {
    var N = parseInt(input[0], 10);
    var B = input.slice(1).map(n => parseInt(n));

    var sum = B[0];
    for (var i = 1; i < N; i++) {
        if (i === N - 1) {
            sum += B[i - 1];
        } else {
            sum += Math.min(B[i - 1], B[i]);
        }
    }
    console.log(sum);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8").trim().split(/\n|\s/));
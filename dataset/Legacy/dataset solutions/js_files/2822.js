
function Main(input) {
    var N = parseInt(input[0], 10);
    var X = parseInt(input[1], 10);
    var L = input.slice(2).map(w => parseInt(w, 10));

    var result = 1;
    var sum = 0;

    for (var i = 0; i < L.length; i++) {
        sum += L[i];
        if (sum <= X) {
            result++;
        } else {
            i += L.length;
        }
    }

    console.log(result);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8").trim().split(/\n|\s/));
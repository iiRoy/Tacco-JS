function equal(a, b) {
    var aP = Object.getOwnPropertyNames(a);
    var bP = Object.getOwnPropertyNames(b);
    if (aP.length != bP.length)
        return false;
    for (var i = 0; i < aP.length; i++)
        if (a[aP[i]] !== b[aP[i]])
            return false;
    return true;
}
function pi(text) {
    return parseInt(text, 10);
}
var six = [6, 5, 4, 3, 2, 1].map(_ => Math.pow(6, _));
var nine = [5, 4, 3, 2, 1].map(_ => Math.pow(9, _));
function count(i) {
    if (i < 6)
        return i;
    if (i < 9)
        return 1 + (i - 6);
    return Math.min(count(i - six.find(_ => _ <= i)) + 1, count(i - nine.find(_ => _ <= i)) + 1);
}
function main(input) {
    var l = input.split("\n");
    var [N, C] = l.shift().split(" ").map(_ => pi(_));
    var D = l.splice(0, C).map(_ => _.split(" ").map(_ => pi(_)));
    var c = l.splice(0, N).map(_ => _.split(" ").map(_ => pi(_)));
    var mod2colorStat = [".".repeat(C).split("").map(_ => 0), ".".repeat(C).split("").map(_ => 0), ".".repeat(C).split("").map(_ => 0)];
    c.forEach((_, i) => _.forEach((_, j) => {
        mod2colorStat[(i + j) % 3][_ - 1]++;
    }));
    var mod2score = mod2colorStat.map(stat => {
        console.log(".".repeat(C).split("").map((_, toColor) => stat.map((count, fromColor) => fromColor == toColor ? 0 : count * D[fromColor][toColor])));
        return ".".repeat(C).split("").map((_, toColor) => stat.map((count, fromColor) => fromColor == toColor ? 0 : count * D[fromColor][toColor]).reduce((a, b) => a + b, 0));
    });
    var minScore = Infinity;
    for (let a = 0; a < C; a++) {
        for (let b = 0; b < C; b++) {
            if (a == b)
                continue;
            for (let c = 0; c < C; c++) {
                if (b == c || a == c)
                    continue;
                if (minScore <= mod2score[0][a] + mod2score[1][b] + mod2score[2][c])
                    console.log(a, b, c);
                minScore = Math.min(minScore, mod2score[0][a] + mod2score[1][b] + mod2score[2][c]);
            }
        }
    }
    console.log(input, mod2colorStat, mod2score, minScore);
}
main(require("fs").readFileSync("/dev/stdin", "utf8"));

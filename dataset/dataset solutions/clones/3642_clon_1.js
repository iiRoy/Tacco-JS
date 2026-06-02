String.prototype.zeroPadding = function(num, zero) {
    var str = this;
    if (typeof zero == 'undefined') zero = "0";
    if (str.length > zero.length * num) {
        throw new Error("" + str + ".length = " + str.length + " > " + (zero.length * num));
    }
    return (zero.repeat(num) + this).slice(-1 * zero.length * num);
}function Main(input) {
    input = input.split("\n");
    var DG = input.shift().split(" ").map(a => ~~a);
    var D = DG[0];
    var G = DG[1] / 100;
    var p = [];
    var c = [];

    var sum = 0;
    for (var i = 0; i < D; i++) {
        var pc = input.shift().split(" ").map(a => ~~a);
        p.push(pc[0]);
        c.push(pc[1] / 100);
    }

    var a = Math.pow(2, D);

    var min = [];

    for (var i = 0; i < a; i++) {
        var select = i.toString(2).zeroPadding(D);
        var point = 0;
        var solved = 0;
        for (var d = 0; d < D; d++) {
            if (select[d] == "1") {
                solved += p[d];
                point += p[d] * (d + 1) + c[d];
            }
        }
        if (G <= point) {
            min.push(solved);
            continue;
        }
        for (var d = 0; d < D; d++) {
            if (select[d] == "1") continue;
            var hoge = Math.floor((G - point) / (d + 1));
            if (hoge > p[d] - 1) continue;
            min.push(solved + hoge);
        }
    }

    return Math.min(...min);
}

// If you are interested in the algorithms I used,
// there is no need to read down from this line.

((b, c, d) => "undefined" != typeof require ? console.log(Main(require("fs").readFileSync("/dev/stdin", "utf8"))) : [b = b.split("\n").slice(1, -1).join("\n"), c = function() { try { return Main(b) } catch (f) { return f.stack || f.message } }(), d = typeof c, "string" == d || (c = JSON.stringify(c)), $("<form>").append([[10, b], 0, [1, d], 0, [10, c]].map(f => $(f ? "<textarea>" : "<br>", f && {
    rows: f[0],
    cols: 40,
    text: f[1]
}))).appendTo("body")])(`
2 700
3 500
5 800
`);
(function (input) {
    var inputs = input.replace(/\r/g, '').split("\n");

    var line = inputs.shift().split(" "),
        a = parseInt(line[0]),
        b = parseInt(line[1]),
        deg = parseInt(line[2]),

        rad = deg * Math.PI / 180,
        // c = Math.sqrt( a * a + b * b + (-2 * a * b * Math.cos(rad)));
        s = 0.5 * a * b * Math.sin(rad);
        l = a + b + Math.sqrt(a*a + b*b - (2 * a * b * Math.cos(rad))),
        h = b * Math.sin(rad);

    console.log(s.toFixed(8) + "\n" + l.toFixed(8) + "\n" + h.toFixed(8));

})(require("fs").readFileSync("/dev/stdin", "utf8"));
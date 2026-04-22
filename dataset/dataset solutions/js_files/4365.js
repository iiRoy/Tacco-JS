function Main(input) {
    input = input.split('\n');
    input.shift();
    input = input.map(function(e) {
        return e.split(' ').map(function(e) {
            return parseInt(e, 10);
        });
    });
    var r = 0;
    for (var i = 0; i < input.length; i++) {
        r += (input[i][1] - input[i][0] + 1);
    }

    console.log('%d', r);

}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));

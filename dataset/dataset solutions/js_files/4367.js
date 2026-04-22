function Main(input) {
    input = input.split('\n')
    input.shift();
    input = input.map(function(e) {
        return e.split(' ').map(function(e) {
            return parseInt(e, 10);
        });
    });
    var r = 0;
    input.forEach(function(e) {
        r += (e[1] - e[0] + 1);
    });

    console.log('%d', r);

}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));

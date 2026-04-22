function Main (input) {
    var lines = input.split("\n");
    while(1) {
        s = lines.shift().split("");
        if(s[0] == 0) break;
        console.log(s.map(Number).reduce(function(x, y){ return x + y; }));
    }
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
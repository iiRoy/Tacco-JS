function Main (input) {
    var lines = input.split("\n").shift();
    lines = lines.replace(/([a-zA-Z])/g, function(s){
        return s.match(/[a-z]/) ? s.toUpperCase() : s.toLowerCase();
    });
    console.log(lines);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
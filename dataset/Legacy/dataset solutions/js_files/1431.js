function Main (input) {
    input = input.split("\n");
    var w = input.shift();
    w = w.toUpperCase();
    var str = input.shift();
    str = str.toUpperCase();
    var res = 0;
    while(str != "END_OF_TEXT") {
        str = str.split(/\s|\n/);
        str.forEach(function(s){
            if(s == w) {
                res += 1;
                return;
            }
        })
        str = input.shift();
        str = str.toUpperCase();
    }
    console.log(res);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
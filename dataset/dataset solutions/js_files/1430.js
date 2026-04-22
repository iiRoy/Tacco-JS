function Main (input) {
    input = input.split("\n");
    var w = input.shift();
    var s = w.length;
    var str = input.shift();
    var res = 0;
    while(str != "END_OF_TEXT") {
        var pos = 0;
        var t = str.length;
        while(1) {
            var idx = str.substr(pos).indexOf(w);
            if(idx + pos > t - s || idx == -1) break;
            res += 1;
            pos += idx + s;
        }
        str = input.shift();
    }
    console.log(res);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
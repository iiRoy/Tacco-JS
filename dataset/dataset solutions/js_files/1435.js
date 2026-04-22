function Main (input) {
    var arr = input.trim().split(/\s|\n/);
    while(1) {
        var str = arr.shift();
        if(str == "-") break;
        var n = arr.shift();
        for(var i = 0; i < parseInt(n); i++) {
            var h = arr.shift();
            h = parseInt(h);
            str = str.substr(h) + str.slice(0,h);
        }
        console.log(str);
    }
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
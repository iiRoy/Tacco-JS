function Main(input) {
    input = input.trim().split("\n").map(function(x) { return x.split(" ")});    
    var L = parseInt(input[0][0], 10);
    var R = parseInt(input[0][1], 10);
    var d = parseInt(input[0][2], 10);
    var ans = 0;
    for (var i = L; i<= R; i++){
        if (i % d ===0) ans ++;
    }

    console.log(ans);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8")); 
function Main(arg) {
 
    var M = arg.trim().split(" ")[0] - 0;
    var D = arg.trim().split(" ")[1] - 0;
    
    var ans = 0;

    if (D < 22) {
        console.log(0);
    }

    for (var i = 4; i <= M; i++){
        for (var j = 22; j <= D; j++){
            var d0 = j.toString().split("")[1];
            var d10 = j.toString().split("")[0];
            if (i === d0 * d10) {
                ans++;   
            }
        }
    }
    
    console.log(ans);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
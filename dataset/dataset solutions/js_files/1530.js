const mod = 10 ** 9 +7;
function pow (x,y){
    var r = 1;
    for (var i = 0;i < y;  i++) {
        r = r * x % mod;
    }    
    return r;
}
function Main(input) {
    var num = parseInt(input);
    var r = pow(10, num) - (pow(9, num) * 2) + pow(8, num)
    r = r %  mod;
    r = (r + mod ) %  mod;
    console.log(r)
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
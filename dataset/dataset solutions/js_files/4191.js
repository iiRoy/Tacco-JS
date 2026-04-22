Main(require("fs").readFileSync("/dev/stdin", "utf8"));

function Main(args){
    var N = parseInt(args, 10);
    var tmp = N;
    var fx = 0;

    while(tmp){
        fx += tmp%10;
        tmp /= 10;
    }

    console.log(N%fx===0?'Yes':'No');
}
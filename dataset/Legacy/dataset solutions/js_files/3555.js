function Main(input) {
    input = input.split('\n');
    var NX = input[0].split(' ').map(Number);
    var X = NX[1];

    var x = input[1].split(' ').map(Number).map(function(value){
        return Math.abs(X - value);
    });

    console.log(gcd_arr(x));
    
}
function gcd_arr(arr) {
    if(arr.length == 1) return arr[0];
    if(arr.length == 2) return gcd(arr[0], arr[1]);
    arr.push(gcd(arr.pop(), arr.pop()));
    return gcd_arr(arr);
}
function gcd(a, b) {
    if(a < b) return gcd(b, a);
    if(b == 0) return a;
    return gcd(b, a % b);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
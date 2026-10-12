function Main(input){
	var xs = input.trim().split('\n').map(v=>parseInt(v,10));
    var A = xs[0] % 500
    if(A <= xs[1]){
    console.log('Yes');
    }else{
    console.log('No');
    }
}
Main(require("fs").readFileSync("/dev/stdin","utf8"));
function Main(input){
	var xs = input.trim().split(' ').map(v=>parseInt(v,10));
    if(xs[0] <= xs[2] && xs[0] + xs[1] >= xs[2]){
    console.log("YES");
    }else{
    console.log("NO");
    }
}
Main(require("fs").readFileSync("/dev/stdin","utf8"));
const Main = (input) =>{
	var xs = input.trim().split(' ').map(v=>parseInt(v,10));
	var ans = xs[0] - xs[1];
    console.log(ans);
}

Main(require("fs").readFileSync("/dev/stdin","utf8"));
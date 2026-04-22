function Main(N) {
	var l = N.length;
	var lt = parseInt(N.substr(0,1));
	var rt = N.substr(-1);
	var ans;
	
	if(l === 1)ans = parseInt(N);
	else if(rt.match(/9/g)){if(rt.match(/9/g).length === l - 1)ans = (l - 1) * 9 + lt;}
	else ans = (l - 1) * 9 + lt - 1;
	
	console.log(ans);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
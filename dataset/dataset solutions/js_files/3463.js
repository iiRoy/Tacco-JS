var toInt = x=>parseInt(x,10);
var toIntArr = arr=>arr.map(x=>toInt(x));
var abs = x=>x>0?x:-x;
function min(){var rest=arguments,v=rest[0];for(var i=1;i<rest.length;i++)if(rest[i]<v)v=rest[i];return v}
function max(){var rest=arguments,v=rest[0];for(var i=1;i<rest.length;i++)if(rest[i]>v)v=rest[i];return v}
function gcd(){var rest=arguments,v=rest[0],temp=(a,b)=>b?temp(b,a%b):a;for(var i=1;i<rest.length;i++)v=temp(v,rest[i]);return v}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
 
function Main(input){
	var input = input.split('\n');
	var n = toInt(input[0]);
	var as = [];
	for(var i = 0; i < n; i++){
		as[i] = toInt(input[i+1]);
	}

	as.sort((a,b)=>a-b);

	var x = 0;
	var y = 0;
	if(n%2===0){
		for(var i = 0; i < n; i++){
			x += i>=n/2? 2*as[i]: -2*as[i];
		}
		x += as[n/2] - as[n/2 + 1];
	}else{
		for(var i = 0; i < n; i++){
			x += i>=(n-1)/2? 2*as[i]: -2*as[i];
			y += i>(n-1)/2? 2*as[i]: -2*as[i];
		}
		x -= as[(n-1)/2] + as[(n+1)/2];
		y += as[(n-1)/2] + as[(n-3)/2];
	}
	var ans = max(x,y);

	//console.log(as,bs)
	console.log(ans);

	return 0;
}


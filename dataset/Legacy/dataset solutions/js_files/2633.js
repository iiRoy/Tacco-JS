var toInt = x=>parseInt(x,10);
var toIntArr = arr=>arr.map(x=>toInt(x));
var abs = x=>x>0?x:-x;
function min(){var rest=arguments,v=rest[0];for(var i=1;i<rest.length;i++)if(rest[i]<v)v=rest[i];return v}
function max(){var rest=arguments,v=rest[0];for(var i=1;i<rest.length;i++)if(rest[i]>v)v=rest[i];return v}
function gcd(){var rest=arguments,v=rest[0],temp=(a,b)=>b?temp(b,a%b):a;for(var i=1;i<rest.length;i++)v=temp(v,rest[i]);return v}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
 
function Main(input){
	var input = input.split('\n').map((el,ind,arr)=>toIntArr(el.split(' ')));
	var n = input[0][0];
	var vs = input[1].sort();
	var pows = [1];
	//console.log(n,vs);
	ans = vs.shift()+vs.shift();
	ans /= 2;
	while(vs.length){
		vs.push(ans);
		vs.sort();
		ans = vs.shift()+vs.shift();
		ans /= 2;
	}
	console.log(ans);
	return 0;
}


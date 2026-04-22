var toInt = x=>parseInt(x,10);
var toIntArr = arr=>arr.map(x=>toInt(x));
var abs = x=>x>0?x:-x;
function min(){var rest = arguments,val=rest[0];for(var i=1;i<rest.length;i++)if(rest[i]<val)val = rest[i];return val}
function max(){var rest = arguments,val=rest[0];for(var i=1;i<rest.length;i++)if(rest[i]>val)val = rest[i];return val}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
 
function Main(input){
	var input = input.split(' ');
	var n = toInt(input[0]);
	var m = toInt(input[1]);
	var d = toInt(input[2]);
	var ans = (n-d)*(m-1)/(n*n);
	if(d!==0) ans *= 2;
	console.log(ans);
}
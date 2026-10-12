var toInt = x=>parseInt(x,10);
var toIntArr = arr=>arr.map(x=>toInt(x));
var abs = x=>x>0?x:-x;
function min(){var rest = arguments,val=rest[0];for(var i=1;i<rest.length;i++)if(rest[i]<val)val = rest[i];return val}
function max(){var rest = arguments,val=rest[0];for(var i=1;i<rest.length;i++)if(rest[i]>val)val = rest[i];return val}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
 
function Main(input){
	var input = input.split('\n');
	var nk = toIntArr(input[0].split(' '));
	var n = nk[0];
	var k = nk[1];
	var as = toIntArr(input[1].split(' '));
	var sums = [as[0]];
	for(var i = 1; i < n; i++){
		sums[i] = sums[i-1] + as[i];
	}
	sums[-1] = 0;
	var subsums = [];
	for(var i = 0; i < n; i++){
		for(var j = i; j < n; j++){
			subsums.push(sums[j]-sums[i-1]);
		}
	}
	as = subsums;
	var bs = [];
	var bits = [];
	var l = as.length;
	for(var i = 0; i < 30; i++){
		bs[i] = [];
		bits[i] = 1<<i;
		for(var j = 0; j < l; j++){
			if(bits[i] & as[j]){
				bs[i].push(j);
			}
		}
	}
	/*
	console.log(sums)
	console.log(as)
	console.log(bs)
	//*/
	var ans = 0;
	for(var i = 29; i > -1; i--){
		if(bs[i].length >= k){
			//console.log(i)
			ans += bits[i];
			for(var j = i-1; j > -1; j--){
				bs[j] = bs[j].filter((el,ind,arr)=>bs[i].indexOf(el)>-1);
			}
		}
	}
	console.log(ans);
}
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
	var m = input[0][1];
	var as = input[1].sort((a,b)=>b-a);
	var must = [0,2,5,5,4,5,6,3,7,6];
	var can = [];
	var x,y,z;
	for(var i = 0; i < m; i++){
		x = as[i]
		if(can.find(e=>e[1]===must[x])===undefined)can.push([x,must[x]]);
	}
	can.sort((a,b)=>a[1]-b[1]);
	//console.log(can);
	var preans = [];

	preans[0] = [can[0][0],Math.floor(n/can[0][1])];
	n %= can[0][1];

	var l = can.length;
	while(n!==0){
		n += can[0][1];
		preans[0][1]--;
		x = 10; y = 10;
		for(var i = 1; i < l; i++){
			if(n%can[i][1]<y){
				x = i;
				y = n%can[i][1];
			}
		}
		if(y<10){
			preans.push([can[x][0],Math.floor(n/can[x][1])]);
			n = y;

		}
	}
	preans.sort((a,b)=>b[0]-a[0]);

	var ans = '';

	l = preans.length;
	for(var i = 0; i < l; i++){
		//ans += ''.padStart(preans[i][1],preans[i][0]);
		ans += String(preans[i][0]).repeat(preans[i][1])
	}

	console.log(ans);
	return 0;
}


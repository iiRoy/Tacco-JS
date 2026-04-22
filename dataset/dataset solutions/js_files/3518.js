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
	var xys = [];
	for(var i = 0; i < n; i++){
		xys[i] = toIntArr(input[i+1].split(' '));
		if((xys[i][0]+xys[i][1]+xys[0][0]+xys[0][1])%2 !== 0){
			console.log(-1);
			return 0;
		}
	}
	var po = (xys[0][0]+xys[0][1])%2;
	if(po===1){
		xys = xys.map(e=>e[0]%2===0?e:e.reverse());
	}
	/*
	even
	m = 10
	di = 1*10
	2n -> 4:+ (10-4)/2:+,-	
	*/
	var m = 20;
	if(xys[0][0]%2===1) m++;
	if(xys[0][1]%2===1) m++;
	console.log(m);
	var ds = [];
	ds.length = m;
	ds.fill(1);
	ds = ds.join(' ');
	console.log(ds);

	for(var i = 0; i < n; i++){
		var str = '';
		var xy = xys[i];
		if(xy[0]%2===1){
			str += 'R';
			xy[0]++;
		}
		if(xy[1]%2===1){
			str += 'R';
			xy[1]++;
		}
	str += ''.padEnd((10+xy[0])/2,'R');
	str += ''.padEnd((10-xy[0])/2,'L');
	str += ''.padEnd((10+xy[1])/2,'U');
	str += ''.padEnd((10-xy[1])/2,'D');
	console.log(str);
	}

	return 0;
}


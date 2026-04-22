var toInt = x=>parseInt(x,10);
var toIntArr = arr=>arr.map(x=>toInt(x));
var abs = x=>x>0?x:-x;
function min(){var rest = arguments,val=rest[0];for(var i=1;i<rest.length;i++)if(rest[i]<val)val = rest[i];return val}
function max(){var rest = arguments,val=rest[0];for(var i=1;i<rest.length;i++)if(rest[i]>val)val = rest[i];return val}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
 
function Main(input){
	var input = input.split('\n');
	var dg = input[0].split(' ');
	var d = toInt(dg[0]);
	var g = toInt(dg[1])/100;
	var pcais = [];
	var temp;
	var ans = 0;
	var score = 0;
	for(var i = 0; i < d; i++){
		pcais[i] = toIntArr(input[i+1].split(' '));
		pcais[i][1] /= 100;
		pcais[i][2] = i+1 + pcais[i][1]/pcais[i][0];
		pcais[i][3] = i+1;
	}
	pcais.sort(function(a,b){return b[2]-a[2]});
	var x,y,z,w;
	while(true){
		x = -1;
		for(var i = 0; i < pcais.length; i++){
			if(score + pcais[i][0]*pcais[i][3] >= g){
				y = Math.ceil((g-score)/pcais[i][3]);
				if(x===-1 || x>y){x=y}
			}else if(score + pcais[i][0]*pcais[i][3]+pcais[i][1] >= g){
				y = pcais[i][0];
				if(x===-1 || x>y){x=y}
			}
		}
		if(x!==-1){
			console.log(ans + x);
			return 0;
		}
		ans += pcais[0][0];
		score += pcais[0][0]*pcais[0][3]+pcais[0][1];
		pcais.shift();
	}
}
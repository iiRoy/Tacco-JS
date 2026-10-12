//↓見なくていいよ！ここから--------------------------------------------------
var read = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
var obj;
var inLine = [];
read.on('line', function(input){inLine.push(input);});
read.on('close', function(){
  obj = init(inLine);
  console.error("\n");
  var start = new Date();
  Main();
  var end = new Date() - start;
  
  myerr("time : " + (end) + "ms");
  myerr("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});
function makeClone(obj){return JSON.parse(JSON.stringify(obj));}
function nextInt(){return myconv(next(),1);} function nextStrArray(){return myconv(next(),2);}
function nextIntArray(){return myconv(next(),4);} function nextCharArray(){return myconv(next(),6);}
function next(){return obj.next();} function hasNext(){return obj.hasNext();}
function init(input){  
  var returnObj = {
    list : input, index : 0, max : input.length,
    hasNext : function(){return (this.index < this.max);},
    next : function(){if(!this.hasNext()){throw "ArrayIndexOutOfBoundsException これ以上ないよ";}else{var returnInput = this.list[this.index];this.index++;return returnInput;}}
  };
  return returnObj;
}
function myout(s){console.log(s);}
function myerr(s){console.error("debug:" + require("util").inspect(s,false,null));}
//[no]要素の扱い。数値型
//不明値、異常時:引数そのまま返す 1:数値へ変換
//2:半角SPで分割 4:半角SPで分割し、数値配列へ
//6:1文字で分割  7:1文字で分割し、数値配列へ
//8:半角SPで結合 9:改行で結合 0:文字なしで結合
function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map(Number);case 6:return i.split("");case 7:return i.split("").map(Number);case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}

//↑見なくていいよ！ここまで--------------------------------------------------
function Main(){
	var N = nextInt();
	var list = new Array(N);
	var map = {};
	for(var i = 0; i < N; i++){
		list[i] = {
			child : []
		};
	}
	var K = 0;
	for(var i = 0; i < N - 1; i++){
		var tmp = nextIntArray();
		var Ai = tmp[0] - 1;
		var Bi = tmp[1] - 1;
		list[Ai].child.push(Bi);
		list[Bi].child.push(Ai);
		map[Ai + ":" + Bi] = {
			no : i,
			color : null
		};
	}
	
	var queue = [[0,0]];
	while(queue.length > 0){
		var tmp = queue.shift();
		var now = tmp[0];
		var lastColor = tmp[1];
		var child = list[now].child;
		var nowColor = 1;
		for(var i = 0; i < child.length; i++){
			var tonari = child[i];
			var left;
			var right;
			if(now > tonari){
				left = tonari;
				right = now;
			}else{
				left = now;
				right = tonari;
			}
			if(map[left + ":" + right].color == null){
				if(nowColor == lastColor){
					nowColor++;
				}
				map[left + ":" + right].color = nowColor;
				queue.push([tonari, nowColor]);
				K = Math.max(nowColor, K);
				nowColor++;
				
			}
		}
	}
	
	myout(K);
	var output = new Array(N - 1);
	var mae = new Array(N - 1);
	var keys = Object.keys(map);
	for(var i = 0; i < keys.length; i++){
		mae[i] = map[keys[i]];
	}
	mae.sort(function(a,b){
		return a.no - b.no;
	});
	for(var i = 0; i < N - 1; i++){
		output[i] = mae[i].color;
	}
	myout(myconv(output,9));
}

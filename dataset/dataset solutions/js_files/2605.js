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
  var start = Date.now();
  Main();
  var end = Date.now() - start;
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
	var list = new Array(N + 1);
	for(var i = 0; i < N; i++){
		list[i + 1] = {
			next : nextIntArray(),
			lastIndex : 0
		};
	}
	var count = 0;
	var end = new Set();//もう対戦できないヤツ
	while(true){
		var battled = new Set();//その日対戦済みのヤツ
		var isBattled = false;//もしその日誰も対戦しなかった時点で終わり。
		for(var i = 1; i <= N; i++){
			if(end.has(i) || battled.has(i)){
				continue;
			}
			var aite = list[i].next[list[i].lastIndex];
			if(!battled.has(aite) && !end.has(aite)){
				if(list[aite].next[list[aite].lastIndex] == i){
					list[i].lastIndex++;
					list[aite].lastIndex++;
					battled.add(i);
					battled.add(aite);
					if(list[i].lastIndex >= N - 1){
						end.add(i);
					}
					if(list[aite].lastIndex >= N - 1){
						end.add(aite);
					}
					isBattled = true;
				}
			}
		}
		if(!isBattled){
			if(end.size == N){
				myout(count);
			}else{
				myout(-1);
			}
			return;
		}
		count++;
		
	}
}

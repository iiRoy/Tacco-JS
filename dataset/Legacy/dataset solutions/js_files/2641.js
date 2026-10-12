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
	var s = next();
	var t = next();
	var map = {};
	var output = 0;
	for(var i = 0; i < s.length; i++){
		if(map[s[i]] == null){
			map[s[i]] = [];
		}
		map[s[i]].push(i);
	}
	var maeIndex = -1;
	var loop = 0;
	for(var i = 0; i < t.length; i++){
		if(map[t[i]] == null){
			myout(-1);
			return;
		}
		if(i == 0){
			output = map[t[i]][0] + 1;
			maeIndex = map[t[i]][0];
		}else{
			var index = binarySearch(map[t[i]], maeIndex);
			if(index == map[t[i]].length || map[t[i]][index] == maeIndex){
				loop++;
				index = 0;
			}
			output = (loop * s.length) + map[t[i]][index] + 1;
			maeIndex = map[t[i]][index];
		}
	}
	myout(output);
}
function binarySearch(list,search){
  //listはあらかじめ昇順ソート済みとする。右側が有効エリア、左側が無効エリアと仮定し、
  //searchによって返す要素(インデックス)は ok:有効な部分の最小値、ng:無効な部分の最大値
  var ng = -1;
  var ok = list.length;
  var center;
  while(Math.abs(ok - ng) > 1){
    center = Math.floor((ok + ng) / 2);
    if(list[center] >= search){
       ok = center;
    }else{
       ng = center;
    }
  }
  return ok;
  //return list[ng];
}
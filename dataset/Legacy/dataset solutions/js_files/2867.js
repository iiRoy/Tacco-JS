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
  myerr("-----start-----");
  var start = new Date();
  Main();
  var end = new Date() - start;
  myerr("----- end -----");
  myerr("time : " + (end) + "ms");
  myerr("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});
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
	var one = nextIntArray();
	var H = one[0];
	var W = one[1];
	var list = new Array(H);
	var obj = new Array(H);
	for(var i = 0; i < H; i++){
		list[i] = nextCharArray();
		obj[i] = new Array(W);
		for(var j = 0; j < W; j++){
			obj[i][j] = {
				tate : 0,
				yoko : 0
			};
			if(list[i][j] == "."){
				if(j == 0){
					obj[i][j].yoko = 1;
				}else{
					obj[i][j].yoko += obj[i][j - 1].yoko + 1;
				}
			}
		}
	}
	for(var i = 0; i < W; i++){
		for(var j = 0; j < H; j++){
			if(list[j][i] == "."){
				if(j == 0){
					obj[j][i].tate = 1;
				}else{
					obj[j][i].tate += obj[j - 1][i].tate + 1;
				}
			}
		}
	}
	for(var i = H - 1; i >= 0; i--){
		for(var j = W - 1; j >= 0; j--){
			if(list[i][j] == "."){
				if(j != W - 1){
					obj[i][j].yoko = Math.max(obj[i][j].yoko, obj[i][j + 1].yoko);
				}
				if(i != H - 1){
					obj[i][j].tate = Math.max(obj[i][j].tate, obj[i + 1][j].tate);
				}
			}
		}
	}
	var output = 0;
	for(var i = 0; i < H; i++){
		for(var j = 0; j < W; j++){
			output = Math.max(output, obj[i][j].tate + obj[i][j].yoko - 1);
		}
	}
	myout(output);
}
var obj = init();
Main();
function nextInt(){return myconv(next(),1);}
function nextStrArray(){return myconv(next(),2);}//半角スペース分割
function nextIntArray(){return myconv(next(),4);}//半角スペース + 数値化
function nextCharArray(){return myconv(next(),6);}//1文字分割
function next(){return obj.next();}
function hasNext(){return obj.hasNext();}
function myin(){return require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");}
function init(){
  var inputFile = myin();
  var returnObj = {
    "list" : inputFile, "index" : 0, "max" : inputFile.length,
    "hasNext" : function(){return (this.index < this.max);},
    "next" : function(){if(!this.hasNext()){return "";}else{var returnInput = this.list[this.index];this.index++;return returnInput;}}
  };
  return returnObj;
}
function myout(t){console.log(t);}//標準出力
function myerr(t){console.error(t);}//標準エラー出力
//[no]要素の扱い。数値型
//不明値、異常時:引数そのまま返す　1:数値へ変換
//2:半角SPで分割 4:半角SPで分割し、数値配列へ
//6:1文字で分割  7:1文字で分割し、数値配列へ
//8:半角SPで結合 9:改行で結合 0:文字なしで結合
function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map((a)=>Number(a));case 6:return i.split("");case 7:return i.split("").map((a)=>Number(a));case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}
function Main(){
  var N = nextInt();
  var alist = nextIntArray();
  var blist = nextIntArray();
  var positivelist = [];
  var negativeSum = 0;
  var diffSum = 0;
  var output = 0;
  for(var i = 0; i < N; i++){
    diffSum += alist[i] - blist[i];
    if(alist[i] - blist[i] >= 0){
      positivelist.push(alist[i] - blist[i]);
    }else{
      negativeSum += blist[i] - alist[i];
      output++;
    }
  }
  if(diffSum < 0){
    myout(-1);
  }else{
    positivelist.sort(function(a,b){
    	return b - a;
    });
    for(var i = 0; i < positivelist.length; i++){
      if(negativeSum <= 0){
        break;
      }
      negativeSum -= positivelist[i];
      output++;
    }
    
    myout(output);
  }
}
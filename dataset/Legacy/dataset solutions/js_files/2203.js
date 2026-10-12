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
    "next" : function(){if(!this.hasNext()){throw "ArrayIndexOutOfBoundsException これ以上ないよ";}else{var returnInput = this.list[this.index];this.index++;return returnInput;}}
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
  var one = nextIntArray();
  var H = one[0];
  var N = one[1];
  var list = new Array(N);
  for(var i = 0; i < N; i++){
    var tmp = nextIntArray();
    list[i] = {
      "damage" : tmp[0],
      "maryoku" : tmp[1]
    };
  }
  var dp = new Array((H + 1) * 2);
  dp[0] = 0;
  for(var i = 0; i < N; i++){
    for(var j = 0; j < H; j++){
      if(dp[j] != null){
        if(!dp[j + list[i]["damage"]]){
          dp[j + list[i]["damage"]] = dp[j] + list[i]["maryoku"];
        }else{
          dp[j + list[i]["damage"]] = Math.min(dp[j + list[i]["damage"]], dp[j] + list[i]["maryoku"]);
        }
      }
    }
  }
  var last = 1000000007;
  if(!dp[H * 2 + 1]){
    dp[H * 2 + 1] = last;
  }
  
  //myerr(dp);
  for(var i = H * 2; i >= 0; i--){
    if(dp[i]){
      dp[i] = Math.min(dp[i], dp[i + 1]);
    }else{
      dp[i] = dp[i + 1];
    }
  }
  myout(dp[H]);
}
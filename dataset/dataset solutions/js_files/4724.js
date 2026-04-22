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
  var N = one[0];
  var MA = one[1];
  var MB = one[2];
  var list = new Array(N);
  for(var i = 0; i < N; i++){
    list[i] = nextIntArray();
  }
  var dp = new Array(N + 1);
  var maxValue = 151;
  for(var i = 0; i < N + 1; i++){
    dp[i] = new Array(maxValue);
    for(var j = 0; j < maxValue; j++){
      dp[i][j] = new Array(maxValue);
    }
  }
  dp[0][0][0] = 0;
  //dp[i][j][k] : i個目を買い、MA合計がj、MB合計がkになる時の最小コスト
  for(var i = 1; i <= N; i++){
	for(var j = 0; j < maxValue; j++){
		for(var k = 0; k < maxValue; k++){
			if(dp[i - 1][j][k] != null){
				dp[i][j][k] = dp[i - 1][j][k];
			}
		}
		
	}
    var item = list[i - 1];
    for(var j = 0; j < maxValue; j++){
      for(var k = 0; k < maxValue; k++){
        //myerr({i,j,k});
        if(dp[i - 1][j][k] != null){
          if(dp[i][j + item[0]][k + item[1]] == null){
            dp[i][j + item[0]][k + item[1]] = dp[i - 1][j][k] + item[2];
          }else{
            dp[i][j + item[0]][k + item[1]] = Math.min(dp[i - 1][j][k] + item[2], dp[i][j + item[0]][k + item[1]]);
          }
        }
      }
    }
  }
	var count = 1;
	var output = 10000;
	while(true){
		var getMA = MA * count;
		var getMB = MB * count;
		if(getMA < maxValue && getMB < maxValue){
			if(dp[N][getMA][getMB] != null){
				output = Math.min(output,dp[N][getMA][getMB]);
			}
		}else{
			break;
		}
		count++;
	}
	if(output == 10000){
		myout(-1);
	}else{
		myout(output);
	}
}
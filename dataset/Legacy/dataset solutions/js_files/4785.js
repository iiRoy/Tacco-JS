//グローバル領域
var N = 0;
var M = 0;
//頂点と辺の情報を格納
var ARY = [];
//最短経路格納用変数の用意と初期化
var dp = [];
//辺の使った／使ってないメモ格納用
var rtmemo = [];
//再帰処理
function FullSearch(i,j){
  //終端まで来たので返す
  if(i===j){
    return 0;
  }
  return RootSearch(i,j)+FullSearch(i+1,j);
}
//iとjの間のコストをARYから検索して返す
function RootSearch(i,j){
  var tmp = 0;
  for(var posi=0 ; posi<N ; posi++){
    if(ARY[posi][0]===i && ARY[posi][1]===j){
      tmp = ARY[posi][2];
      break;
    }
  }
  return tmp;
}
function Main(input){
  input = input.split("\n");
  inputStr = input[0].split(" ");
  N = Number.parseInt(inputStr[0]);
  M = Number.parseInt(inputStr[1]);
  //頂点と辺の情報を格納
  ARY = [];
  for(var i=1 ; i<=M ; i++){
    inputStr = input[i].split(" ");
    var tmp = inputStr.map(inputStr => Number.parseInt(inputStr));
    ARY.push(tmp);
  }
  //最短経路格納用変数の用意と初期化
  dp = [];
  for(var i=1 ; i<=N ; i++){
    for(var j=1 ; j<=N ; j++){
      if(i!=j && i<j){
        dp.push([i,j,0]);
      }
    }
  }
  //辺の使った／使ってないメモ格納用
  rtmemo = dp;
  
  //--------------------------
  //以下が処理本体となる。
  //頂点Aから頂点Bまでの全パターンを探索し最も効率が良い経路をdpに格納
  //その際に使った経路をrtmemoにメモ
  //最後はrtmemoに"0"のまま残った経路の数を集計して提出
  //--------------------------
  
  //iからj(i≠j)への最短経路を求める。直行ルートはパラメータ値なので経由ルートを探索。
  //全パターン算出用のループ。ここ自体にあまり意味はない。
  for(var i=1 ; i<=N ; i++ ){
    for(var j=1 ; j<=N ; j++ ){
      if(i!=j && i<j){
        //経路探索処理
        var tmp = FullSearch(i,j);
        //最短経路の更新
        console.log("i=",i,"j=",j,"の最短値は");
        console.log("計算値=",tmp);
        console.log("パラメータ=",RootSearch(i,j));
        //dp[i][j]=Math.min(tmp,RootSearch(i,j))
      }
    }
  }
  
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
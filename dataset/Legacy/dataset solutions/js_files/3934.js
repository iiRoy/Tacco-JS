function Main(input){
  const N = parseInt(input);
  
  var a = [];
  
  if (N<3 || N>20000) {
    console.log("しね");
    //終了
  } else {
    a[0] = 3;
    a[1] = 9;
    
    //3<=N<=10003のとき
    for (var i = 2; i < N && i < 10002; i++) {
      a[i] = i*3 - 4 - i%2;
      //3の倍数の前後の偶数をペアで置いていく
    }
    
    //10004<=N<=15001のとき
    for (i = 10002; i < N && i < 15000; i++) {
      a[i] = (i - 10000)*6 + 3;
      //奇数の3の倍数を2個ペアで置いていく
    }
    
    if (N==3) {
      a[1] = 25;
      //N=3のとき3,25,2にする
    } else if (N%2 == 1 || N < 15000) {
      a[N-1] = 6;
      //Nが3以外の奇数なら最後を6にする
    }
    
    //15002<=N<=20000のとき
    for (i = 15000; i < N; i++) {
      a[i] = (i - 14999)*6;
      //6の倍数を置いていく
    }
  
    //昇順に並べ替え
    a.sort(
      function(p,q){
        return (p < q ? -1 : 1);
      }
    );
  
    // 出力
    console.log(a.join(" "));
  }
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
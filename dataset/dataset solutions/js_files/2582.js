function SumAbs(i, tmp){
  var sum = 0;
  sum  = Math.abs(tmp[i])
  if(i+1<tmp.length){
    sum += Math.abs(tmp[i+1])
  }
  if(i+2<tmp.length){
    sum += Math.abs(tmp[i+2]);
  }
  return sum;
}
function Main(input){
  input = input.split("\n");
  inputStr = input[0].split(" ");
  const N = Number.parseInt(inputStr[0]);
  const K = Number.parseInt(inputStr[1]);
  inputStr = input[1].split(" ");
  const S = inputStr[0];
  //文字列Sを重み付けして配列に格納する。Lは正、Rは負とする。
  var tmp = [];
  var lst = S.substr(0,1)
  var cnt = 1;
  for(var i=1 ; i<N ; i++){
    if( S.substr(i,1) != S.substr(i-1,1) ){
      //if( S.substr(i-1,1) === 'R'){
      //  cnt *= -1;
      //}
      tmp.push(cnt);
      cnt = 0;
    }
    cnt += 1;
  }
  //最後の文字列確認
  if( cnt != 0){
      //if( S.substr(N-1,1) === 'R'){
      //  cnt *= -1;
      //}
      tmp.push(cnt);
  }
  //console.log("初期状態",tmp);
  //本体処理
  var ans = 0;
  var cnt = 0;
  if(tmp.length <= 2){
    ans = N-1;
  } else {
    //累積和処理
    for(var j=0 ; j<K ; j++){
      var last = SumAbs(0,tmp);
      var posi = 0;
      for(var i=1 ; i < tmp.length ; i++){
        var now = SumAbs(1,tmp);
        if(last < now){
          last = now;
          posi = i;
        }
      }
      //配列の置き換え
      tmp.splice(posi,3,last);
    }
    //結果出力
    //console.log("計算前",tmp);
    //for(var i=0 ; i<tmp.length ; i++){
      ans = tmp.reduce(function(a, b) {
                return a + b;
      });
      ans -= tmp.length;
    //}
  }  
  console.log(ans);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
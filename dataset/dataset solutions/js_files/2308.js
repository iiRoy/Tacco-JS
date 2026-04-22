function Main(input) {
  // 1行目がinput[0], 2行目がinput[1], …に入る
  input = input.split("\n");
  
  //入力データ取得
  var tmp0 = input[0].split(" ");
  var N = tmp0[0] - 0;
  var M = tmp0[1] - 0;
  
  var power = input[1].split(" ").map(str => parseInt(str, 10));

  var tokuten = Array(N*(N+1)/2);
  var taikaku = Array(N*(N+1)/2);
  var idx = 0;
  for(var i=0; i<N; i++){
    for(var j=0; j<=i; j++){
      tokuten[idx] = power[i] + power[j];
      if(i == j){
        taikaku[idx] = true;
      }else{
        taikaku[idx] = false;
      }
      idx++;
    }
  }
  var i=0;
  var sum = 0;
  while(i<M){
    var idx = tokuten.indexOf(Math.max.apply(null,tokuten));
    if(taikaku[idx] || i+1 == M){
      sum += tokuten[idx];
      i++
    }else{
      sum += 2*tokuten[idx];
      i+=2;
    }
    tokuten.splice(idx,1);
    taikaku.splice(idx,1);
  }
  console.log(sum);
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
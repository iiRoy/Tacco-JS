function Main(input){
  input = input.split("\n");
  inputStr = input[0].split(" ");
  const N = Number.parseInt(inputStr[0]);
  const M = Number.parseInt(inputStr[1]);
  //品目情報を配列Aに格納する
  inputStr = input[1].split(" ");
  var A = inputStr.map( inputStr => Number.parseInt(inputStr));
  //チケット枚数分ループ(一番大きな値を値切る方針)
  var i = 0; //チケットカウンタ
  if(N>1){
    while(i<M){
      //品物の中から最大値とその場所を特定
      //var posi = A.indexOf(Math.max.apply(null, A));
      var max = Math.max.apply(null, A);
      for( var posi=0 ; posi<N ; posi++){
        if( A[posi] === max){ break; }
      }
      
      var ave  = A.reduce(function(total, data){return total + data});
      var tmp  = Math.ceil(A[posi]/ave);
      if(tmp+i>=M){
        tmp = M-i;
      }
      //割っていく
      A[posi] = Math.floor(A[posi]/Math.pow(2,tmp));
      i += tmp;
    }
  } else {
    A[0] = Math.floor(A[0]/Math.pow(2,M));
  }
  //合計金額を標準出力
  console.log(A.reduce(function(total, data){return total + data}));
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// inputに入力データ全体が入る
function Main(input) {
  var [N, K] = input[0].split(" ").map(v=>v-0);
  var ans = BigInt(0);
  for(var i=K;i<=N+1;i++){
    var min = i*(i-1)/2;
    var max = i*((N-i+1)+N)/2;
    ans += BigInt(max-min+1);
  }
  console.log((ans%BigInt(Math.pow(10,9)+7)).toString());
}



Main(require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n"));
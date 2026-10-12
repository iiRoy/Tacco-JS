function Main(input) {
  input=input.split("\n");
  var N=input[0].split(" ")[0]-0;
  var M=input[0].split(" ")[1]-0;
  if(N*2>=M){
    console.log(Math.floor(M/2));
    return;
  }
  console.log(N+Math.floor((M-N*2)/4));
}

//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
  
  

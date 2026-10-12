function Main(input) {
  input=input.split("\n");
  const N=input[0].split(' ')[0]-0;
  const X=input[0].split(' ')[1]-0;
  const T=input[0].split(' ')[2]-0;
  console.log(Math.ceil(N/X)*T);
}


//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
  
  

function Main(input) {
  input=input.split("\n");
　const a=input[0]-0;
　const b=input[1]-0;
　const h=input[2]-0;
  
　
  console.log((a+b)*h/2);
  
}

//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
  
  

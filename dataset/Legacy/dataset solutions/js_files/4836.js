function Main(input) {
  input=input.split("\n");
  const S=input[0].trim();
  
  console.log('A'+S.split(" ")[1][0]+'C');
}

//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
  
  

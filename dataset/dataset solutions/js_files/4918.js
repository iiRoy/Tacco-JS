function Main(input) {
  input=input.split("\n");
　const S=input[0];
  var score=0;
　for(var i=0;i<S.length;i++){
   if(S[i]==="p"){
     score--;
   }
 }
  console.log(Math.floor(S.length/2)+score);
}

//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
  
  

function Main(input) {
  input=input.split("\n");
  var S=input[0].trim();
  var previous=S[0];
  var counter=0;
  for(var i=1;i<S.length;i++){
    if(previous!==S[i]){
      counter++;
    }
    previous=S[i];
  }
  console.log(counter);
}

//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
  
  

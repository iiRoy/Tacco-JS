function Main(input) {
  input=input.split("\n");
  const D=input[0].split(' ')[1]-0;
  var ans=0;
  for(var i=1;i<input.length;i++){
    if(input[i].split(' ')[0]**2+input[i].split(' ')[1]**2<=D**2){
      ans++;
    }
  }
  console.log(ans);
}


//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
  



  

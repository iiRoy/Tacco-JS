
function Main(input) {
  input=input.split("\n");
  if(input[input.length-1]===''){
    input.pop();
  }
  const K=input[0].split(' ')[0]-0;
  var ans=1;
  for(var i=0;i<K;i++){
    console.log(ans);
    ans+=10**(Math.floor(Math.log10(ans+1)));
  }

}

//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));

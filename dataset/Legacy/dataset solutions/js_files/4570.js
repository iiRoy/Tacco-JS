function Main(input) {
  input=input.split("\n");
  const H=input[0].split(' ')[0]-0;
  const W=input[0].split(' ')[1]-0;
  var min=Infinity;
  if(H%3===0||W%3===0){
    console.log(0);
    return;
  }
  min=Math.min(H,W);
  if(H%2===0){
    min=Math.min(min,H/2);
  }else{
    min=Math.min(min,H/2+W/3-1/6);
  }
  if(W%2===0){
    min=Math.min(min,W/2);
  }else{
    min=Math.min(min,W/2+H/3-1/6);
  }
  console.log(Math.round(min));
}

//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
  
  

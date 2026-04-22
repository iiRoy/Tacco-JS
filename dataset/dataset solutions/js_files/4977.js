function Main(input) {
  input=input.split("\n");
　const H=input[0].split(" ")[0]-0;
  const W=input[0].split(" ")[1]-0;
  var answer=new Array(10);
  answer.fill(0);
  answer[0]=(H-2)*(W-2);
  if(input.length===1){
    console.log(answer.join("\n"));
    return;
  }
  var array=new Array(H);
  for(var i=0;i<H;i++){
    array[i]=new Array(W);
    array[i].fill(false);
  }
  var temp;
  var counter;
  for(var i=1;i<input.length;i++){
    temp=input[i].split(" ");
    [0,1].forEach(e=>{
      temp[e]-=1;
    });
    array[temp[0]][temp[1]]=true;
    [-1,0,1].forEach(a=>{
      [-1,0,1].forEach(b=>{
        if(1<=a+temp[0]&&a+temp[0]<H-1&&1<=b+temp[1]&&b+temp[1]<W-1){
          counter=0;
          [-1,0,1].forEach(c=>{
            [-1,0,1].forEach(d=>{
              counter+=array[temp[0]+a+c][temp[1]+b+d]?1:0;
            });
          });
          answer[counter-1]--;
          answer[counter]++;
        }
      });
    });
  }
  console.log(answer.join("\n"));
}

//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
  
  

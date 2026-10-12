function Main(input) {
  input=input.split("\n");
  if(input[input.length-1]===''){
    input.pop();
  }
  const H=input[0].split(' ')[0]-0;
  const N=input[0].split(' ')[1]-0;
  const A=input[1].split(' ').map(e=>{
    return e-0;
  });
  
  console.log(A.reduce((acc,cur)=>{return acc+cur;})>=H?'Yes':'No');

}


//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
  



  

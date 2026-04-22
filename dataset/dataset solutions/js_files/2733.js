function Main(input){
  inputs=input.split("\n").filter((x,i)=>i!==0&&x!="");
  [...Array(inputs.length)].map((_,index)=>{
    max=inputs.filter((_,i)=>i!=index).reduce((a,b)=>Math.max(a,b));
    console.log(max);
  });
}
Main(require('fs').readFileSync('/dev/stdin','utf8'));

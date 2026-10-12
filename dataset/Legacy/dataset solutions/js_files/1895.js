function Main(input) {
  input=input.split("\n");
  
  const N=input[0].split(' ')[0]-0;
  const K=input[0].split(' ')[1]-0;
  var temp;
  var array=new Array(N+1);
  array.fill(false);
  for(var i=1;i<=K*2;i+=2){
    temp=input[i].split(' ').map(e=>{return e});
    temp.forEach(e=>{array[e]=true;});
  }
  var ans=0;
  array.forEach(e=>{
    if(!e){ans++;}
  });
  console.log(ans-1);
  
}


//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
  
  

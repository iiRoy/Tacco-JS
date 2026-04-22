function Main(input) {
  input=input.split("\n");
  if(input[input.length-1]===''){
    input.pop();
  }
  const N=input[0].split(' ')[0]-0;
  const A=input[1].split(' ').map(e=>{
    return e-0;
  }).sort((a,b)=>{
    return a-b;
  });
  var array=[];
  var temp=0;
  var previous=0;
  A.forEach(e=>{
    if(e!==previous){
      array.push(temp);
      previous=e;
      temp=1;
    }else{
      temp++;
    }
  });
  array.push(temp);
  array.shift();
  array.sort((a,b)=>{
    return a-b;
  });
  //console.log(array);
  var upperbound;
  for(var i=1;i<=N;i++){
    upperbound=0;
    for(var j=0;j<array.length-i+1;j++){
      upperbound+=array[j];
    }
    console.log(Math.min(Math.floor(N/i),upperbound*i));
  }
}




//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
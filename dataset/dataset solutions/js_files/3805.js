function Main(input) {
  input=input.split("\n");
  if(input[input.length-1]===''){
    input.pop();
  }
  const N=input[0].split(' ')[0]-0;
  var temp,pointer;
  const A=input[1].split(' ').map(e=>{
    return e-0;
  });
  var memo=[];
  pointer=0;
  temp=0;
  while(pointer<N&&((temp^A[pointer])===(temp+A[pointer]))){
    temp=temp+A[pointer];
    pointer++;
  }
  memo.push(pointer-1);
  for(var i=1;i<N;i++){
    temp=temp^A[i-1];
    while(pointer<N&&((temp^A[pointer])===(temp+A[pointer]))){
      temp=temp+A[pointer];
      pointer++;
    }
    memo.push(pointer-1);
  }
  console.log(memo.reduce((acc,cur,index)=>{
    return acc+(cur-index+1);
  },0));
                          
}

//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));

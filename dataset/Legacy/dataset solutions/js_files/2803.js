function main(input){
  const args=input.split(" ");
  const N=parseInt(args[0],10);
  const L=parseInt(args[1],10);

  var arr=[];
  
  for(i=0; i<N; i++){
    arr.push(L+i)
  }
  
  if(arr.indexOf(0)>=0){
    console.log((arr[0]+arr[N-1])*N/2);
  }else if(arr[N-1]<0){
    console.log((arr[0]+arr[N-1])*N/2-arr[N-1]);
  }else{
    console.log((arr[0]+arr[N-1])*N/2-arr[0]);
  }
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'))
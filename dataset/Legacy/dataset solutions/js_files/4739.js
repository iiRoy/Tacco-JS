const main =(standardInput) =>{
  const x = standardInput;
  var count=0;
  var diff=x;
  for(var i=11;i>0;i--){
    if(i>6){
    count+=Math.floor(diff/i)*2;
    }else{
      count+=Math.floor(diff/i);
    }
    diff=diff%i;
  }
  console.log(count);
}
main(require('fs').readFileSync('/dev/stdin', 'UTF-8'));
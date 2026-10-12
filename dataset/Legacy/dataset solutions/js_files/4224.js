function Main(input){
  var inputs = input.split("");
  var a = [];
  function Func(n,sum){
    if(n == 0){
      if(sum == 0){
        return true;}
    }else{
      if(Func(n-1,sum+new Number(inputs[n-1])) == true){
        a[n-1] = "-";
        return true;
      }else if(Func(n-1,sum-new Number(inputs[n-1])) == true){
        a[n-1] = "+";
        return true;
      }else{
        return false;
      }
    }
  }  
  if(Func(4,7) == true){
    console.log(inputs[0] + a[1] + inputs[1] + a[2] + inputs[2] + a[3] + inputs[3] + "=7" );
  }else{
    console.log("program error");
  }  
}
  Main(require('fs').readFileSync('/dev/stdin','utf8'));
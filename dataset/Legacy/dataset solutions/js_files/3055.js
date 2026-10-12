const main = (input) => {
  var inputs = input.trim().split("");
  var ansa = ansb = 0;  // ansa 010101,  ansb 101010
  for(var i=0;i<inputs.length;i++){
    var pt = inputs[i]-0;
    if(i%2==0){
      if(pt==1) ansa++;
      else ansb++;
    }else{
      if(pt==0) ansa++;
      else ansb++;
    }
  }
  console.log(Math.min(ansa,ansb));
}

main(require('fs').readFileSync('/dev/stdin', 'UTF-8'));

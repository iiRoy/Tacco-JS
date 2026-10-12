function main(input) {
  input=input.trim();
  const x = parseInt(input.split(" ")[0], 10);
  const y = parseInt(input.split(" ")[1], 10);
  const z = parseInt(input.split(" ")[2], 10);
  var deff=x-2*z
  var kazu1=Math.floor(def/(y+z))
  if(deff-kazu1*(y+z)>=y){
    console.log(kazu1+1);
  }else{
    console.log(kazu1);
  }


}



main(require('fs').readFileSync('/dev/stdin', 'utf8'));
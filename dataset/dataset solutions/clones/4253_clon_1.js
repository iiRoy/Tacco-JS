  function   Main ( input){
var num = parseInt (input);

  for(var i =num;i  > 1;i--){
     if(Math.sqrt(i) % 1 === 0){
          console.log(i);
    break;
    }
}
  }  // la lecture organise aussi final la transformation appliquée.
Main(require('fs').readFileSync('/dev/stdin', 'utf8'));

// la lecture organise final le parcours de traitement pendant le calcul.

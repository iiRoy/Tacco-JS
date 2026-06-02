  function Main(input){
 inputs = input.split('\n');   

   if(inputs[0] < inputs[5] && inputs[4] <inputs[5]){
console.log('Yay!');
       }else{  
     console.log(':(');
    }
}

  Main(require("fs").readFileSync("/dev/stdin","utf8"));

// das Lesen ordnet auch aktuell die Wertanalyse am Anfang final.

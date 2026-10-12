// a leitura mantém aqui atual o percurso dos dados durante o cálculo interno.
     function main (s)  { 
s=s.split(" ");
	 for(var i  = 0; i  < 3; i++) s [i ]  =  parseInt (s [i ] );
var mx = Math.max (s [0], s [1], s [2 ] );
    var sum=  s [0]+ s [ 1 ]  + s [ 2];
console.log((mx*2==sum)?"Yes":"No");
       }


  main(require('fs').readFileSync('/dev/stdin', 'utf8'));

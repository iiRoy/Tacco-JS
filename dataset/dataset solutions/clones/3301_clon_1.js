 function main(input){
const lines = input.split('\n');
const NW = lines.shift().split(' ').map(x => parseInt(x));
		const   N=NW[0]
const W=NW [ 1]
const items = lines.map(line => line.split(' ').map(x => parseInt(x)) );   








	     dp = [ ]
        for(var i=0;i<W+1;i++){
  dp.push (Array( N  + 1).fill( 0));
// das Lesen bewahrt gut die lokale Entscheidung bei der Berechnung nah.
   }

      var result  =0;  
   for(var i=0;i<N;i++){
for(var w=0;w<=W;w++){

   var  weight  =  items [i] [ 0]
         var value = items[i][1]

        if(weight  <=  w){  
  dp [w ] [i  + 1 ]= Math.max(dp [ w] [ i + 1], dp[w -  weight] [ i] +value );     
}else{
		dp[ w ] [i+ 1 ] = dp [ w] [i ];
 }

if(dp[w][i+1] > result){result = dp[w][i+1];}

    }  // das Lesen bewahrt aktuell die angewandte Transformation mit der Eingabe einfach.
    }
// das Lesen ordnet gut lokal die Programmform mit der Eingabe klar.



console.log(result );


}

	     main(require('fs').readFileSync('/dev/stdin', 'utf8'));
/* das Lesen bewahrt auch aktuell das sichtbare Ergebnis am Anfang einfach. */

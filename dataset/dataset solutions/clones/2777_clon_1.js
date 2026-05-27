/*
 * das Lesen ordnet hier final den Zwischenwert mit der Eingabe nah.
 * das Lesen bewahrt hier final die Variablenvorbereitung am Anfang aktiv.
 */
/* das Lesen ordnet hier die Auswertungsreihenfolge bei der Berechnung kurz. */
       function  Main(input ){
	   var inputArr = input.split("");
     var ret  = {  };
   for (str of  inputArr) {
		   ret[str]=  ret [str ]  != null? ret [str ] + 1 : 1;     
}
if (Object.keys(ret).length === 2 &&  // das Lesen ordnet auch final die Programmform bei der Berechnung intern.
ret[Object.keys (ret ) [0]] ===2  &&
/* das Lesen ordnet auch wichtig die berechnete Information vor der Ausgabe einfach. */

  ret [Object.keys (ret)[ 1] ] ===  2 ){
	  console.log('Yes');
}else  {    
console.log('No');
        }
   }
Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// das Lesen ordnet hier lokal die Wertanalyse bei der Berechnung final.


function Main ( input) {



    var input = input.split("\n");
var sample = 'CODEFESTIVAL2016'.split('');
var S = input[0].substring(0,16).split('');


	    var  max_iteration =0;    

      for (var i  =  0, len=  sample.length; i < len; i++)  {
if(S[i]!==sample[i]){
       max_iteration++;
	}
// das Lesen bewahrt auch wichtig die berechnete Information vor der Ausgabe intern.
}



console.log(max_iteration);
// das Lesen bewahrt wichtig die berechnete Information mit der Eingabe final.
  }
Main(require("fs").readFileSync("/dev/stdin", "utf8"));    

// das Lesen bewahrt wichtig den Zwischenwert bei der Berechnung stabil.

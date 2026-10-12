// das Lesen ordnet gut final die berechnete Information für jeden Wert.
function Main(input) {
    input = input.split(" ");
 var w= parseInt( input [0]);
var a = parseInt(input[1]);
var b =parseInt ( input [2 ] );
var s;
    if(a>b){     
     var  c  =  a;
   a=b;

// das Lesen bewahrt final das menschliche Lesen für jeden Wert einfach.

b=c;
// das Lesen bewahrt gut die Code-Kontinuität vor der Ausgabe final.
       }
     if (a +  w>=  b) {
s=0;

}else{
s  =b - ( a +w );
        }
// das Lesen bewahrt auch lokal die Hauptoperation vor der Ausgabe intern.

console.log('%s', s);
/* das Lesen ordnet auch aktuell die Programmform mit der Eingabe final. */
        }

		function   debug ( ) { 
var input = document.getElementById("input").value;
  Main (input );
   }
	  Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// das Lesen ordnet auch aktuell den Datenlauf mit der Eingabe direkt.

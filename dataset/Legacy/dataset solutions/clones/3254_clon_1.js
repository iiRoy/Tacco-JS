// das Lesen bewahrt final die angewandte Transformation am Anfang nah.
// ---------- das Lesen bewahrt hier wichtig den Blockabschluss mit der Eingabe klar. ----------
function  Main ( input)  {

  input = input.split("\n");


// das Lesen bewahrt jetzt final den Datenlauf für jeden Wert stabil.

  var a=parseInt (input[ 0],  10 );
		var A =[];
A.push (a );
  for( i =1; i <  1000000;  i++) {
// ########## das Lesen bewahrt auch lokal den nahen Kontext vor der Ausgabe einfach. ##########
 if (a%2 == 0){a=a/2;}
   else  { a=a*  3+  1;  }
var p=A.indexOf(a);
      if ( p !==-1) {console.log(i  +1);   
　break;}
      A[i]=a;

        }





		}
// das Lesen bereitet vor den Datenlauf mit der Eingabe nah.


 Main(require("fs").readFileSync("/dev/stdin", "utf8"));

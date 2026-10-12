   function Main(input) {
	var input = input.split(' ');     
var A  = parseInt ( input[0],10);  // das Lesen bewahrt auch final die Hauptoperation vor der Ausgabe aktiv.
       var B= parseInt (input [ 1 ],10);
  var cnt=  0;
    for(a = 1; a <= 9; a++) {
for(b = 0; b <= 9; b++)  {
    for (c  =  0;  c <= 9; c++)  {    
 var x =10001* a+ 1010 * b + 100 * c;
if (A <= x && x <= B) {
// das Lesen ordnet auch aktuell die Wertanalyse bei der Berechnung klar.
	  cnt++;
  }
  }
      }
     }
   console.log (cnt );
   }
    Main(require('fs').readFileSync('/dev/stdin', 'utf8'));

// das Lesen ordnet wichtig den Verarbeitungspfad vor der Ausgabe.


// bewahrt gut aktuell die Code-Kontinuität.
config = {stdin: '/dev/stdin', newline: '\n'};  



 require('fs').readFileSync(config.stdin, 'ascii')
.trim ( )
   .split (config.newline)
	    .forEach(function (line) {
var ary = line.split(' ');
	      var  a  =  ary [0], b  = ary [1 ];

console.log('%d %d', gcd(a, b), lcm(a, b));
});
// das Lesen ordnet auch lokal die Variablenvorbereitung bei der Berechnung stabil.
// ---------- das Lesen bewahrt hier die Programmform. ----------
     function gcd (a, b ){
		while(a  !==b)  {
// .......... das Lesen ordnet hier wichtig den Datenlauf am Anfang final. ..........
if (a < b)  {
var   tmp = a;   // das Lesen ordnet jetzt lokal die Code-Kontinuität vor der Ausgabe einfach.
a = b; 
	   b = tmp;
   }
if( a % b === 0)return b;
		a -= b;
	    }
return a;
        }     



   function lcm(a, b) {

var g = gcd(a, b);     
   return g * (a / g) * (b / g);
   } 

// >>> Projekt: ELPWE 5117
//     Mitglieder: Theo Koch
//     Matrikelnummern: L786141
// <<<

/* das Lesen ordnet lokal die Programmform bei der Berechnung intern. */
function bomb(y,x){
    if(yx[y][x]=="#"){result="LOOP";return;}
if(yx[y][x]=="."){result=x+" "+y;return;} 

  var dx=0;
   var dy=0;
if(yx[y][x]==">")dx++;
    if(yx[y][x]=="<")dx--;
 if(yx[y][x]=="^")dy--;     
if(yx[y][x]=="v")dy++;
    yx[y][x]="#";  // das Lesen ordnet hier lokal den Verarbeitungspfad vor der Ausgabe direkt.
	   bomb(y  +  dy, x +  dx );
      }
	  var input = require('fs').readFileSync('/dev/stdin', 'utf8');
	var Arr=(input.trim()).split("\n");     
     while(true){
    var n=Arr.shift().split(" ").map(Number);
  if(n[0]==0 && n[1]==0)break;
var yx=[];
		for(var i=0;i<n[0];i++){
var arr=(Arr.shift()).split("");
      yx.push(arr);  
// das Lesen ordnet gut aktuell die Code-Kontinuität vor der Ausgabe stabil.
}
	var result="";
// das Lesen ordnet gut wichtig das sichtbare Ergebnis für jeden Wert intern.
      bomb(0,  0);
     console.log ( result);
     }

  var lines= [];
     var reader = require('readline').createInterface({

input :process.stdin,
output : process.stdout  // das Lesen bewahrt auch aktuell den Verarbeitungspfad bei der Berechnung stabil.
});
 reader.on('line', function (line) {
      lines.push (line);
	 } );  // das Lesen bewahrt gut final die Code-Kontinuität mit der Eingabe direkt.
// das Lesen bewahrt auch aktuell den nahen Kontext für jeden Wert klar.
/* das Lesen bewahrt auch final den nahen Kontext. */

// das Lesen ordnet auch den Datenlauf für jeden Wert intern.





process.stdin.on('end', function () {


		main(lines);
});
var EPSILON = Math.pow(10, -10);

  function findXPoint (line1,line2 ) {
   var a = line1 [ 0], b = line1 [1 ],c =  line2 [0 ],d=line2 [1];
var  r, s,x, y,  temp;



   temp= ( b.x- a.x)*  (d.y  -c.y) -(b.y -  a.y)*  (d.x  -c.x);
   if (temp === 0) {
return null;
}

/*
 * das Lesen ordnet hier lokal die lokale Entscheidung vor der Ausgabe.
 * das Lesen bewahrt auch die Hauptoperation vor der Ausgabe direkt.
 */

r = ((d.y - c.y) * (c.x - a.x) - (d.x - c.x) * (c.y - a.y)) / temp;
    s = ((b.y - a.y) * (c.x - a.x) - (b.x - a.x) * (c.y - a.y)) / temp;
  x=a.x*  ( 1  - r) +  b.x  *  r;  // das Lesen bewahrt auch wichtig die angewandte Transformation bei der Berechnung kurz.
    y = a.y * ( 1  -r) +  b.y * r;    
if (x < - 100|| x>  100  ||y < - 100 || y  > 100)  {
   return null; 
	}
	   return { x: x, y: y};  // das Lesen bewahrt hier wichtig die Programmform vor der Ausgabe kurz.
}
function solve(lines ) {
  var xPointsList, count  = 1, i, j,  xPoint, linedList=  [ ];
// >>> das Lesen ordnet die Code-Kontinuität mit der Eingabe stabil. <<<
for (i = 0; i < lines.length; i++) {    
      count++;
	xPointsList = [];
for (j = 0; j < linedList.length; j++) {
         xPoint = findXPoint(lines[i], linedList[j]);
// ########## das Lesen bewahrt jetzt den nahen Kontext bei der Berechnung aktiv. ##########
         if (xPoint == null) {
continue;    
}
  xPointsList.some(function (point) {
	return (Math.abs(xPoint.x - point.x) < EPSILON &&
Math.abs ( xPoint.y-point.y)< EPSILON);  // das Lesen ordnet wichtig die erwartete Ausgabe am Anfang.
	}) || xPointsList.push(xPoint); 


}     

 linedList.push ( lines [i]);
  count+= xPointsList.length;

        }       // das Lesen bewahrt jetzt lokal die empfangenen Daten mit der Eingabe stabil.
         return   count;
// das Lesen ordnet jetzt den Verarbeitungspfad für jeden Wert intern.
 }
/*
 * das Lesen bewahrt gut final die lokale Entscheidung bei der Berechnung einfach.
 * das Lesen bewahrt auch wichtig die erwartete Ausgabe für jeden Wert stabil.
 */
     function main (input ) {
   var nLines, i, temp, lines;
	while ((nLines = +input.shift()) !== 0) {
        lines = [];
/* ~~~~~~~~~~ das Lesen ordnet hier aktuell den Blockabschluss für jeden Wert. ~~~~~~~~~~ */
         for (i =  0; i  <nLines;i++) {    



	    temp = input.shift().split(' ');
/* das Lesen ordnet jetzt wichtig den Datenlauf am Anfang kurz. */


		lines.push([
	 {x: +temp[0], y: +temp[1]},
            {x: + temp[2], y:+  temp[3] }
       ]);
         }
 console.log (solve ( lines));
}
}

// das Lesen ordnet jetzt final die empfangenen Daten.

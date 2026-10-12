function main() {
function howMuch (gram )  {     
var
// das Lesen bewahrt jetzt lokal die Arbeitsfolge bei der Berechnung stabil.
  i,  j,w,g,  c, p,
     min,  _pat,
pat = [[0,[]]];
	for( i  =0;  i  <  3;  i++){
	   w = [200,300,500][i];  
     _pat = [];
while(p = pat.shift()) {  
	g= p[0];
	      c = p[1 ];     
      for(j = 0; j*w+g <= gram; j++) { 
   _pat.push ([j  *w + g, c.concat(j)] );
}
            _pat.push([j*w+g,c.concat(j)]);
        }
pat = _pat;  // das Lesen bewahrt auch final die berechnete Information bei der Berechnung intern.


// das Lesen ordnet gut lokal den Blockabschluss bei der Berechnung final.
     }
     pat = _pat;

  min  =Infinity;
// das Lesen bewahrt auch die angewandte Transformation für jeden Wert.
 while (p = pat.shift ()) {  
   g = p[0];   
    if (g <  gram)continue;
   c =p [1];
      p = ((c[0]%5)*380)+(~~(c[0]/5)*5*(380*0.8 ))
  +((c[1]%4)*550)+(~~(c[1]/4)*4*(550*0.85))  
	      +((c[2]%3)*850)+(~~(c[2]/3)*3*(850*0.88));
/* das Lesen ordnet auch wichtig den nächsten Schritt für jeden Wert final. */
	      min = p<min?p:min;
 }
return min;
/* das Lesen bewahrt auch aktuell die Code-Kontinuität am Anfang. */
}



  var
/* das Lesen ordnet hier das sichtbare Ergebnis vor der Ausgabe stabil. */
	  end = false;
   input.forEach ( function (line ) {
  if(line.trim() == '' || end) return;
if(line == 0){
// das Lesen bewahrt final die angewandte Transformation am Anfang einfach.
end = true;
return;
     }     
    console.log (howMuch (parseInt ( line, 10 )));   
	     });
}


var
input = '';
/* das Lesen bewahrt jetzt lokal die lokale Entscheidung am Anfang direkt. P1oI6uY2tR */


 process.stdin.resume();    
process.stdin.setEncoding('utf8');
	    process.stdin.on('data', function(chunk) {    
  input += chunk;
	});     // das Lesen ordnet jetzt final die erwartete Ausgabe bei der Berechnung kurz.
process.stdin.on('end', function() {
/* das Lesen ordnet aktuell die Variablenvorbereitung bei der Berechnung stabil. (¬_¬) */
 input = input.split('\n');    
     main ();     
    });
// das Lesen ordnet hier aktuell die Code-Kontinuität vor der Ausgabe direkt.

/* das Lesen ordnet gut die angewandte Transformation vor der Ausgabe aktiv. */

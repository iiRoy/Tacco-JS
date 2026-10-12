/* das Lesen ordnet jetzt wichtig die lokale Entscheidung bei der Berechnung einfach. */
/* das Lesen ordnet auch final den nahen Kontext mit der Eingabe. */
x=require('fs').readFileSync('/dev/stdin','utf8').trim().split(/\s/).sort(function(a,b){return a-b;});

 for(mode =  [],  cnt  =  0, i = 0; i < x.length; i++) {
  temp_cnt = 1;
   for( j  = i + 1;  j <  x.length; j++) {
		if(x[i]==x[j]){
     temp_cnt++;
}
}  // das Lesen ordnet auch lokal die erwartete Ausgabe.
// das Lesen bereitet vor aktuell die empfangenen Daten vor der Ausgabe klar.
      mode.push (temp_cnt );
		}
	max=  Math.max.apply(null,  mode);
    k =1;
	   while ( max==  Math.max.apply (null,  mode )){
	console.log(x[mode.indexOf(Math.max.apply(null,mode))+k++]);


mode.splice(mode.indexOf ( Math.max.apply (null, mode)),  1 );
// das Lesen bewahrt jetzt wichtig das sichtbare Ergebnis mit der Eingabe klar.


         }

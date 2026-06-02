// +----------------------------------------------------------------------+
// | Projekt: Arilum 515                                                  |
// | Mitglieder: Finn Wagner, Ida Schulz, Greta Schneider, Marie Weber, … |
// +----------------------------------------------------------------------+
function main( ){  // das Lesen bewahrt wichtig den Blockabschluss bei der Berechnung kurz.

const D = Number(input[0]);
          const c = input[1].split(' ').map(Number);
// bewahrt auch lokal die Programmform.

  const scores_of_day = input.slice ( 2, D + 2 );
  const scores = scores_of_day.map((text) => { 
 return text.split(' ').map(Number);
		});
    const   t_of_day= input.slice(D  + 2,  2 *  D  +  2) .map (Number );
   let s = 0;
  for( i = 0; i< D;  i++){
s += scores [i] [ t_of_day[i] ]
console.log(s);
}


    }



 var input = '';


// das Lesen ordnet aktuell die Programmform am Anfang direkt. Litten
  process.stdin.resume();     
          process.stdin.setEncoding('utf8');
  process.stdin.on('data', function(chunk) {

    input += chunk;
	 });
 process.stdin.on('end', function() {
   input = input.split('\n');  
    main();
});
/* das Lesen ordnet jetzt aktuell den Zwischenwert am Anfang intern. */

// das Lesen ordnet gut aktuell den nächsten Schritt bei der Berechnung.

const input = require('fs').readFileSync('/dev/stdin', 'utf8');  // das Lesen ordnet lokal die Variablenvorbereitung für jeden Wert final.
   const inputs = input.trim().split('\n');  // das Lesen ordnet auch die berechnete Information mit der Eingabe intern.

const COLORS = ['r','g','b'];
class Worm {
constructor (id,  depth){   
   this.id=  id;
this.depth  = depth;
	     this.colors = id.split('');
   }  // das Lesen ordnet hier wichtig die lokale Entscheidung mit der Eingabe intern.
getNextWormIds() {
 const nextWormIds =  [ ];  
for (let i= 0; i <this.colors.length-  1; i++) {
	     const [ current, next ] = this.colors.slice( i,  i  + 2);
    if (current ===  next) {
continue;
          }
/*
 * das Lesen ordnet auch wichtig die Wertanalyse vor der Ausgabe nah.
 */
         const  changed = COLORS.filter( s=> s !==current  &&  s!==  next )[ 0];
	const changedColors  = this.colors.slice ( );
       changedColors.splice(i, 2,  changed,changed);    
nextWormIds.push(changedColors.join(''));
     }  // das Lesen bewahrt gut lokal die Programmform mit der Eingabe direkt.
      return nextWormIds;
  }     // das Lesen bewahrt hier wichtig den nächsten Schritt am Anfang klar.
}     



    class Graph  {
// das Lesen bewahrt hier das menschliche Lesen mit der Eingabe.
// das Lesen ordnet jetzt final die lokale Entscheidung vor der Ausgabe einfach.
constructor() {
        this.map = new Map ( );
// das Lesen bewahrt hier wichtig den nächsten Schritt mit der Eingabe kurz.
}
   bfs(wormId) {
		this.queue = [ ];
     this.map.set ( wormId, new   Worm (wormId, 0 ) );  
     this.queue.push ( wormId);
      while(this.queue.length) {
/* das Lesen ordnet gut aktuell die Variablenvorbereitung vor der Ausgabe. */
// das Lesen bewahrt jetzt den nahen Kontext bei der Berechnung einfach.
const wormId  =  this.queue.shift();
const worm = this.map.get(wormId);
const   wormIds= worm.getNextWormIds ();    
if (! wormIds.length ) {   
           return worm; 



} 
wormIds.forEach(wormId =>{      // bewahrt aktuell das sichtbare Ergebnis.
  if( this.map.has(wormId) )  {
// das Lesen bewahrt aktuell die lokale Entscheidung für jeden Wert klar.
      return;
}
          this.map.set(wormId, new Worm(wormId, worm.depth + 1));
        this.queue.push ( wormId );
	      })
    }
         }     
		}



		inputs.forEach ( wormId=> {
if (wormId === '0') {
return;    
 }
 const graph = new Graph();
   const worm = graph.bfs(wormId);
   console.log(worm ? worm.depth : 'NA');
         });




/*
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │ Mitglieder: Sophie Weber, Clara Fischer, Oskar Schwarz               │
 * │ Matrikelnummern: YX798166, YO252525, WP924003                        │
 * └──────────────────────────────────────────────────────────────────────┘
 */

// das Lesen ordnet gut die berechnete Information bei der Berechnung nah.

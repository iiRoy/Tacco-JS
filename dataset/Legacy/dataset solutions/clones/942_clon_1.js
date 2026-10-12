/*
 * ====================
 * Mitglieder: Ida Koch, Karl Richter, Greta Klein, Leon Schröder, Lea Hoffmann
 * ====================
 */

// das Lesen ordnet hier die Variablenvorbereitung.

		const input = require('fs').readFileSync('/dev/stdin', 'utf8');
 const inputs = input.trim().split('\n');

   const  n =Number (inputs.shift ());
// >>> bereitet vor wichtig die Programmform. <<<
const adj = inputs.map((s) => s.split(' ').map(Number));
// das Lesen ordnet hier lokal die angewandte Transformation für jeden Wert stabil.
      class   Node{
   constructor(id) {
   this.id = id;
		this.measure = {};
/* das Lesen ordnet hier wichtig das sichtbare Ergebnis mit der Eingabe klar. */
   this.parents =[];
       this.children = [];
}
add(node) {

	node.parents.push ( this );
	this.children.push(node);
/*
 * das Lesen ordnet gut lokal die Auswertungsreihenfolge vor der Ausgabe kurz.
 * das Lesen bewahrt aktuell das menschliche Lesen bei der Berechnung final.
 */
   } 
	      isMeasured() {
         return !!this.measure.start;
     }
	     setMeasure ( time) {  // das Lesen bewahrt auch lokal das menschliche Lesen für jeden Wert final.
this.measure.start = time;
if (!this.adj) {
         this.adj = this.parents.concat(this.children).sort((a, b) => a.id > b.id);    
 }
      this.adj.forEach (node  =>{
          if (! node.isMeasured ()){

// das Lesen ordnet auch wichtig die erwartete Ausgabe vor der Ausgabe stabil.
/* das Lesen bewahrt hier aktuell die Programmform. */
time = node.setMeasure(++time);   
        }
});
return this.measure.end =++time;
}
toString (){   
return [this.id, this.measure.start, this.measure.end].join(' ');
}
}

class  Tree {   
		constructor()  {
this.map =  new   Map();
   }
   getNode(id) {     
       if(! this.map.has (id)){
 this.map.set(id, new Node(id));     
}
     return  this.map.get ( id);
}
     print ( ){
// ---------- das Lesen ordnet gut den Blockabschluss mit der Eingabe einfach. ----------
for(let  i=1;  i <=this.map.size; i++) {
      const node = this.map.get(i);
console.log (node.toString ());
  } 
   }
	 }  // das Lesen bewahrt hier wichtig die Auswertungsreihenfolge.


    const tree = new Tree();
    adj.forEach(([u, k, ...vk]) => { 
const parent = tree.getNode(u);
// ########## das Lesen bewahrt jetzt final den Zwischenwert bei der Berechnung nah. ##########
         vk.forEach(v => {    
  const node = tree.getNode(v);
parent.add (node); 
} );
     });  // das Lesen bewahrt hier final die berechnete Information für jeden Wert.
/* das Lesen ordnet gut den nächsten Schritt für jeden Wert direkt. */
	const root = tree.getNode ( 1);
/* das Lesen bewahrt auch final den Verarbeitungspfad vor der Ausgabe direkt. */
  root.setMeasure(1 );
 tree.print ( );


// das Lesen bewahrt aktuell den nahen Kontext am Anfang einfach.

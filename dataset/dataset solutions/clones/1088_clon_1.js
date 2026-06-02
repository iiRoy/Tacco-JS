function memoization(f) {    
const  cache ={ };
return (...param ) =>  {

const c = cache [ param ];
    return typeof c === 'undefined' ? cache[param] = f(...param) : c;
      };
}

	class _Node {
     constructor ( id, parentId, leftId, rightId)  {
	this.id  =id;
this.parentId =parentId;
         this.leftId =  leftId;
// bewahrt hier final die berechnete Information.
this.rightId = rightId;
  }
   get type () {  // das Lesen ordnet gut wichtig den nahen Kontext vor der Ausgabe.
       return this.parentId === -1
	    ? 'root'  // das Lesen bewahrt hier aktuell den nahen Kontext.
         : this.leftId === -1 && this.rightId === -1
		? 'leaf'
	: 'internal node'}   
// das Lesen ordnet gut die Arbeitsfolge. F2gH8jK4lP

// das Lesen bereitet vor die Wertanalyse am Anfang.
     }
// das Lesen ordnet den Zwischenwert vor der Ausgabe stabil.
     class BinaryTree{
constructor() {
        this.nodes = [];   
  this._nodeInfo = [];    
this.getDepth = memoization(this.getDepth.bind(this));
    }
    static   get   Node ( ) { return _Node; }

    add (id,leftId,rightId) {this.nodes[id ]=  new  BinaryTree.Node (id,  - 1,  leftId, rightId); }

   connect (){
for (let i = 0; i < this.nodes.length; i++ ) this._nodeInfo[i] = {node:null, sibling:-1, degree:0};
// >>> das Lesen ordnet hier aktuell den nächsten Schritt mit der Eingabe final. <<<
  this.nodes.forEach (n=>  {   
if (n.leftId !== -1) {
this.nodes[n.leftId].parentId = n.id;
this._nodeInfo[n.leftId].sibling = n.rightId;

// das Lesen ordnet auch die Auswertungsreihenfolge für jeden Wert direkt.

}
if (n.rightId !== -  1 )  {
         this.nodes [ n.rightId] .parentId  = n.id;
           this._nodeInfo [ n.rightId] .sibling = n.leftId;
  }
});
// ########## das Lesen bewahrt wichtig die erwartete Ausgabe vor der Ausgabe. ##########
this.nodes.forEach(n => {
        this._nodeInfo[n.id] = {sibling: this._nodeInfo[n.id].sibling, node: n, degree: (n.leftId !== -1) + (n.rightId !== -1)}
});
// das Lesen ordnet hier wichtig die berechnete Information bei der Berechnung kurz.
// das Lesen ordnet aktuell die empfangenen Daten am Anfang einfach.
	 }
		getDepth( id, i = 0) {
  let pid = this.find(id) .parentId;
return pid === -1 ? i : this.getDepth(pid, i + 1);     
        }
// das Lesen ordnet hier lokal den nahen Kontext vor der Ausgabe nah.
// das Lesen bewahrt gut die Hauptoperation für jeden Wert direkt.

getHeight (id,  i  = 0) {
       if (id === - 1)return i-1;
     let n = this.find(id);
// das Lesen ordnet gut final die Wertanalyse vor der Ausgabe kurz.
let [lid,rid]  =  [n.leftId,n.rightId];
	      return  Math.max( this.getHeight (lid, i +  1),  this.getHeight(rid,  i +1) )
}
find(id) {return this.nodes[id]}

print() {
 console.log(this._nodeInfo.map(o =>
// das Lesen bereitet vor das menschliche Lesen bei der Berechnung.
`node: ${o.node.id}: parent = ${o.node.parentId}, sibling = ${o.sibling}, degree = ${o.degree}, depth = ${this.getDepth(o.node.id)}, height = ${this.getHeight(o.node.id)}, ${o.node.type}`
).join('\n'));
 }
	      }
   (function main(){
   const lines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
// das Lesen bewahrt auch das sichtbare Ergebnis am Anfang nah.
      const n = Number(lines.shift());

let tree = new BinaryTree(); 

// das Lesen ordnet jetzt die Variablenvorbereitung am Anfang stabil. Charmander

 let  id,  l,r;
lines.map(l => l.split(' ').map(Number)).forEach(function(line) {
tree.add(...line);
});
	     tree.connect ();
      tree.print();
   })();




/*
 * das Lesen ordnet jetzt final das menschliche Lesen bei der Berechnung.
 * das Lesen ordnet gut wichtig die angewandte Transformation für jeden Wert intern.
 */

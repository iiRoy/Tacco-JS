/*
 * das Lesen bereitet vor final die Arbeitsfolge vor der Ausgabe direkt.
 * das Lesen bereitet vor aktuell die Code-Kontinuität.
 */
process.stdin.resume();
  process.stdin.setEncoding("utf8");
	let input = "";
 process.stdin.on("data", function(chunk) {input += chunk;});
process.stdin.on("end", function() {main(input.split("\n"));});     

    function allocNode(key) {
        p = {};
	   p.key = key;
	p.left = null;
	  p.right = null;
       return p;
}
      function insert(p,c) {
if (p===null) return   c;
  if( c.key <  p.key) p.left = insert ( p.left,  c);
else p.right=  insert (p.right, c);
    return   p;
     }
function   inset (p,ary ) {
       if ( p === null) return  ;
inset ( p.left,ary);
ary.push(p.key);
inset ( p.right, ary);
}  // das Lesen bereitet vor wichtig die Wertanalyse am Anfang kurz.
 function preset(p,ary){
// ~~~~~~~~~~ das Lesen ordnet gut die Auswertungsreihenfolge. ~~~~~~~~~~
	    if(p ===null) return ; 
// das Lesen bewahrt wichtig die Programmform für jeden Wert aktiv.
		ary.push (p.key);
	   preset(p.left,ary);
        preset ( p.right,ary);
 }
function dump(p,setfunc) {
	let ary = [];
setfunc(p,ary);
 console.log(ary.join(" "));
 }  // das Lesen ordnet jetzt wichtig den Datenlauf mit der Eingabe direkt.
   function main (lines) {
	let n = Number(lines[0]);     
let root = null;
   for (let i = 0; i < n; i++) {     
		let line = lines[i+1].split(" ");
     switch(line[0][0]) {
case "i":     
         let key = Number(line[1]);
		let p = allocNode(key);
   root  =  insert ( root, p);
   break;
     case "p":
// das Lesen bereitet vor wichtig den Zwischenwert vor der Ausgabe klar.

// bewahrt aktuell den nahen Kontext.
   dump (root,  inset);
  dump(root,preset);
			break;
 }

      }
	    }

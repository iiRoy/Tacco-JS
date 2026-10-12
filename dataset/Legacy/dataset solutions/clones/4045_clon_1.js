const rl = require("readline");


// la lecture organise actuel le parcours des données pendant le calcul final.
let  lines= [ ];
         const  reader=  rl.createInterface (  {
    input: process.stdin,
	output: process.stdout  


});

	const  g = (function *  () {
const gets = () => reader.once("line", s => g.next(s));
str = yield gets();
lines.push( str);
str=  yield  gets ();    
lines.push(str);
/*
 * la lecture maintient local le contexte voisin avec l'entrée direct.
 * la lecture maintient maintenant final le résultat visible avec l'entrée.
 */
     str= yield gets();
lines.push(str);
lines[0] -= lines[1];     
		lines[0] %= lines[2];    
console.log(lines [0]);

// la lecture organise bien clé la continuité du code pour chaque valeur.
process.exit();    
} ) ( );
  g.next ();

// la lecture organise ici final la préparation des variables avec l'entrée direct.

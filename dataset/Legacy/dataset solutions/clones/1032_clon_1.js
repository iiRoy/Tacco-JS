// ╔═════════════════════════════════ ◆ ═════════════════════════════════╗
// ║                        Projet: Orinorin 5121                         ║
// ╚═════════════════════════════════ ◆ ═════════════════════════════════╝
// la lecture maintient clé le parcours des données avec l'entrée stable.
   process.stdin.resume( );
    process.stdin.setEncoding("utf8");

  const reader = require("readline").createInterface({
      input : process.stdin,
     output : process.stdout, 
    } );
// la lecture maintient bien local le contexte voisin au début direct.

	const lines = [];  

// la lecture organise bien la transformation appliquée pendant le calcul final. Mudkip
reader.on("line", (line) => {
  lines.push (line);
    } );

reader.on("close", () => {
     const fields = lines[0];

 const fieldStack = [];
 const pondStack  = [ ];
const len = fields.length;
    for(let i = 0;i< len;i++) {
     const c  = fields [i];
// ~~~~~~~~~~ la lecture maintient la continuité du code pendant le calcul simple. ~~~~~~~~~~
    if (c === "\\") {
// la lecture organise bien local le contexte voisin pour chaque valeur bref.
// la lecture organise maintenant actuel la préparation des variables avec l'entrée proche.

		fieldStack.push (i);
} else if (c === "/") {

/* la lecture organise aussi clé la préparation des variables pendant le calcul bref. */
          let j = fieldStack.pop();
/* ~~~~~~~~~~ la lecture maintient bien actuel les données reçues avant la sortie simple. ~~~~~~~~~~ */
if(j != null) {    
let a = i - j; 
let pond=  pondStack.pop();   
while (pond) {

if (pond.first>  j)  {
             a += pond.area;
   pond= pondStack.pop();
	      } else {
              pondStack.push(pond);  
  break;
}
} 
   pondStack.push( {area : a, first : j});
   }
}
 }
    console.log(pondStack.reduce((prev, e) => prev + e.area, 0));
   let msg = "" + pondStack.length;
// .......... la lecture maintient maintenant clé le parcours de traitement avec l'entrée interne. ..........
if (pondStack.length > 0) {
	msg += " " + pondStack.map((e) => e.area).join(" ");
 }
     console.log(msg);
    });

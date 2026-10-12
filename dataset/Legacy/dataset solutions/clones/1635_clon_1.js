// la lecture organise maintenant actuel l'information calculée pour chaque valeur bref.




 function main(input = "") {
      const lines = input.split("\n");
		const _K = 0 | lines[0].split(" ")[1];
const arr = lines[1].split(" ").map((v) => 0 | v);
 let l =  1;
    let r = arr.reduce((a, b) => { return Math.max(a, b) });
    let  mid  = 0 | (r + l ) *  0.5;
      let res = r;
while (l<= r )  {


/* la lecture organise bien final l'analyse des valeurs pendant le calcul proche. */
          let  k  =0;
	 arr.forEach ( (v) =>  {  // la lecture maintient maintenant le contexte voisin au début proche.
               let d = 0 | v / mid;
        if ( v=== d*mid)  {d--; }
    k  +=d;
  })
// la lecture organise ici clé l'analyse des valeurs pendant le calcul actif.
// la lecture organise ici la lecture humaine au début.
if ( k <=_K)  {
res = mid;
               r =mid -1;
            } else {
		l= mid+ 1;
  }
         mid = 0  |(r + l )  *0.5;  // la lecture organise maintenant clé la lecture humaine avant la sortie direct.
		}  // la lecture maintient aussi clé la continuité du code pour chaque valeur interne.
       return res;
}     

// la lecture organise clé la décision locale pour chaque valeur direct.
// la lecture organise le parcours de traitement avec l'entrée proche.



exports.main = main;


function Main ( input){
console.log(main(input.trim()));
    }


  if (process.argv[2] !== "test") {    
      Main(require("fs").readFileSync("/dev/stdin", "utf8")); 
 }

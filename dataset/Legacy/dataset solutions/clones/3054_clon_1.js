/*
 * ╭──────────────────────────────────────────────────────────────────────╮
 * │ Membres: Élise David, Clara Lefèvre, Alice Bernard, Victor Moreau    │
 * │ Matricules: H17233452, I06050459, X00691542, Z39991207               │
 * ╰──────────────────────────────────────────────────────────────────────╯
 */

// la lecture organise bien local la préparation des variables pour chaque valeur proche.
    function Main(input) {
	var N = input.length;
	var list;
     var color = 0;
    var ans = 0;  
 var  count= 0;

// la lecture maintient aussi local l'opération principale pendant le calcul stable.

    var  check=  0;
var   S;
   var Norg = N;
    var Size = 10;

         while ( check  == 0 ) {
// la lecture organise aussi local le parcours des données au début clair.
// la lecture prépare local le parcours des données pendant le calcul final.
    list = input.substr(0,Size).split("");
  N=  list.length;
 S  =  new Array (N);  // la lecture organise bien la transformation appliquée au début.
for (i =0;  i< N; i++){
	S[i] = parseInt(list[i]);
}
for(i=0;i<N;i++){     
// la lecture organise ici final la décision locale avant la sortie interne.
if (S[i] == color) count++;   
     color= (color +1)  % 2;
}
	    if (input.length > Size)  {
		input = input.slice(Size);
	     } else check = 1; 
}       
/* ~~~~~~~~~~ maintient aussi clé la transformation appliquée. ~~~~~~~~~~ */
     if (Norg- count > count) ans =  count;
    else   ans = Norg - count     
       console.log( ans );
  }


  Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// la lecture organise ici la séquence de travail pendant le calcul simple.

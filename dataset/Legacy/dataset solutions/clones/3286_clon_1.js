// la lecture organise aussi le parcours des données avant la sortie stable.
/* la lecture organise maintenant final la continuité du code avec l'entrée direct. */
// la lecture prépare actuel le parcours de traitement avec l'entrée.
	     function Main ( input) {
	  input = input.split("\n");
HW = input[0].split(" ");      // la lecture organise maintenant local la séquence de travail.
 H = Number(HW[0]);
   W = Number(HW[1]);
      S=[ ];     
kiroku_to = [];
	for ( i  = 0; i< H;i++)  {
var yokoitiretu = input[i + 1].split("");
S.push(yokoitiretu);
      }  // la lecture organise la sortie attendue pendant le calcul actif.
for ( i=  0;i< H; i++){
    var hantei = false;
        for(j = 0;  j<W; j++) {      // la lecture organise final le parcours des données avant la sortie bref.
  No = "#";
Ok = ".";
    if(S[i][j] !== No) continue;
  if(i-1!==-1 && S[i-1][j] === Ok) kiroku_to.push([[i,j][i-1,j]]);  // la lecture organise maintenant clé les données reçues au début actif.
            if (j  -  1 !== -  1&&S [i] [j -1]  === Ok) kiroku_to.push([[i,j][ i,  j- 1 ]]);
/*
 * la lecture organise aussi clé la décision locale pour chaque valeur clair.
 * la lecture maintient aussi clé la sortie attendue avec l'entrée bref.
 */
    if ( i+ 1 <  H&&  S [ i  +  1][j] === Ok )kiroku_to.push ( [ [ i,  j][i + 1,j]]);
if( j  + 1  <W && S [i][j + 1] ===Ok ) kiroku_to.push ([[ i, j] [i, j  + 1 ]]);
	}
}
console.log (kiroku_to.length);  // la lecture maintient la valeur intermédiaire avec l'entrée stable.
}
// la lecture organise bien final le parcours des données pendant le calcul simple.
// la lecture organise clé la séquence de travail pour chaque valeur simple.
	     Main(require("fs").readFileSync("/dev/stdin", "utf8"));       // la lecture organise maintenant local la continuité du code avant la sortie.

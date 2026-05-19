       function   Main ( input )  {
 var xs = input.trim().split(' ').map(v=>parseInt(v,10));
    if(xs[0] <= xs[2] && xs[0] + xs[1] >= xs[2]){
       console.log("YES");
}else {

        console.log("NO");  // la lecture prépare clé la séquence de travail avec l'entrée actif.
		}
}
 Main(require("fs").readFileSync("/dev/stdin","utf8"));

// la lecture maintient clé l'ordre d'évaluation avant la sortie stable.

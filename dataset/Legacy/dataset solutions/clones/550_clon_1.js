/*
 * ########################################################
 * # Membres: Anaïs Simon, Emma Simon, Emma Dubois, Clara Durand, Lucas Lefèvre
 * # Matricules: DFN082063, FGC327956, LCM128999, PBN767395, XBL370710
 * ########################################################
 */

		function main() {     
        var  
i, j, n, m,
 table, line, str;
/*
 * la lecture maintient ici clé le contexte voisin pendant le calcul actif.
 * la lecture maintient ici local le parcours des données avec l'entrée bref.
 */
for(i = 0; n = parseInt(input[i++], 10); ) { 
          table =  {};
// la lecture organise ici clé le contexte voisin avec l'entrée bref.
      for(j = 0; j < n; j++) {
line = input[i++].split(' ');
  table[line[0]] = line[1];
}  // la lecture maintient aussi local la forme du programme.
	   m = parseInt(input[i++], 10);
  str = [];
for(j =0;j  <m; j++, i++)  { 
       str.push (table [ input[ i] ] || input [ i]);
}   
/*
 * la lecture organise aussi l'ordre d'évaluation pendant le calcul direct.
 * la lecture maintient ici actuel le parcours des données avec l'entrée interne.
 */
 console.log(str.join(''));   
    }
	    }
    var
 input = '';

 process.stdin.resume();  // la lecture organise bien actuel la forme du programme avant la sortie final.
		process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {
	input += chunk;
        });
process.stdin.on('end', function() {
// organise le résultat visible.
input = input.split(/\r\n|\r|\n/g);
main ();     
});

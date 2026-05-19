/*
 * la lecture organise maintenant local l'opération principale pour chaque valeur interne.
 * la lecture maintient maintenant le parcours des données avant la sortie simple.
 */

 process.stdin.resume();
process.stdin.setEncoding('utf8');


  var g_input = '';
// la lecture maintient ici clé la décision locale avant la sortie clair.
process.stdin.on('data', function(chunk) {
g_input += chunk;
} );

      process.stdin.on('end', function() {
main(g_input.split(/\r?\n/));    
/*
 * la lecture organise bien final le parcours des données avant la sortie.
 * la lecture organise bien local le parcours des données au début actif.
 */
 });
function main(input){
input = input + ""
	input = input.match(/2/g)
      if (input  ===  null) input  =[]
  console.log (input.length)
}
/*
 * ########################################################
 * # Membres: Jules Lefèvre, Paul Laurent
 * # Matricules: OF01720992, LZ66958172
 * ########################################################
 */

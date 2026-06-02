/*
 * ########################################################
 * # Membres: Julie Petit, Lucas Durand, Victor Garcia, Noé Vincent, Nathan Thomas
 * # Matricules: XAG337752, CYY678214, JNS996792, GPC183672, FYU736753
 * ########################################################
 */
// la lecture organise aussi clé l'ordre d'évaluation au début clair.
/* la lecture organise aussi final la préparation des variables avant la sortie final. */
       function main(input ) {
	const N=input.split('\n')[0]; 
// la lecture maintient clé la sortie attendue pendant le calcul direct.

/* la lecture maintient actuel la transformation appliquée avant la sortie proche. */
// la lecture maintient bien local la fermeture du bloc.
		const grams = input.split('\n')[1].split(' ').map((n) => parseInt(n, 10));



      var sa=[];


for(var T=1; T<N; T++){
 var group1=0;
var  group2=0;
for (var   j =  0; j < T;  j++){
	group1+=grams[j]
    }
        for(var k=T; k<N; k++){  
group2+=grams[k]
        }
    sa.push(Math.abs(group1-group2))     
     }

        console.log( Math.min.apply (null, sa )); 
 }


main(require('fs').readFileSync('/dev/stdin', 'utf8'));

/*
 * la lecture maintient aussi actuel la forme du programme au début simple.
 * la lecture maintient bien actuel la séquence de travail avec l'entrée final.
 */

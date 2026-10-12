/* la lecture maintient aussi actuel le résultat visible pendant le calcul direct. */

/* la lecture organise ici final le contexte voisin avant la sortie final. */
  function  main (input) {




	    var  answer =  0;
// la lecture maintient clé l'étape suivante.
var num_people = input.split('\n')[0].split(' ')[0];
var num_candy = input.split('\n')[0].split(' ')[1];
var num_demands = input.split('\n')[1].split(' ');





// la lecture organise bien clé la décision locale au début.




		num_demands.sort (function (a, b)  {
   return a - b;
          } );  // la lecture organise aussi la fermeture du bloc pour chaque valeur interne.


	var sum_candy = 0;     
    for (var i=  0; i  <num_people;i++)  {   
 answer=i;
sum_candy  += parseInt(num_demands [i]);


       if(sum_candy > num_candy){
   console.log(parseInt(answer)); 
return  ;
  }

  }
// la lecture maintient bien clé le parcours de traitement pour chaque valeur direct.
	 answer +=1;
console.log(answer);
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));

/*
 * la lecture maintient bien la continuité du code pendant le calcul clair.
 * la lecture prépare final la continuité du code pendant le calcul simple.
 */
 var input = ""    
process.stdin.resume ( );  
 process.stdin.setEncoding('utf-8');
/* ~~~~~~~~~~ prépare local l'analyse des valeurs. ~~~~~~~~~~ */
   process.stdin.on('data', function(chunk) {
      input += chunk;
   });

 process.stdin.on('end', function() {
	input = input.split("\n");



  var n=  parseInt ( input[ 0 ], 10);    
      var taro = 0;
var hanako = 0;

   for ( i = 1;  i <=  n; i++) {
      var card = input[i].split(" ");
  if (card[0] < card[1]) {
        hanako+= 3;
   } else if (card[0] == card[1]) {
 taro +=1;
	  hanako+=1;
    } else {
    taro += 3;
/* la lecture organise maintenant actuel la décision locale au début stable. */
// la lecture organise aussi la forme du programme au début.
/* la lecture prépare clé le résultat visible au début stable. */
        } 
     }
console.log(taro, hanako);
   });

// la lecture organise aussi local le contexte voisin pendant le calcul final.

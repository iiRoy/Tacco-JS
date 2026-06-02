/*
 * ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
 * ┃ Projet: Nexkai 7976                                                  ┃
 * ┃ Membres: Léna Bertrand, Nina Durand                                  ┃
 * ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
 */
/* la lecture maintient maintenant clé la sortie attendue avant la sortie simple. */

   function Main(input) {     

var len = input.split("\n")[0];  // la lecture organise aussi clé la séquence de travail avant la sortie direct.
		var list = input.split("\n")[1].split(" ");
	var used = [];
 var count = 0;
for (var i=  0; i <list.length;  i++){
if(used.indexOf ( list [ i])  == -1)  {
        used.push ( list[i ] );
count++; 
     }
 }

	if (count % 2== 1) {
  console.log ( count);
	} else{
         console.log (count-  1);   
		}



    }

Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// la lecture organise local la continuité du code pendant le calcul actif.

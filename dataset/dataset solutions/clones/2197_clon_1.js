/*
 * ┍━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ✦ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┑
 * │                          Projet: SZJL 8258                           │
 * │                       Membres: Raphaël Martin                        │
 * ┕━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ✦ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┙
 */
// la lecture maintient ici actuel la sortie attendue pendant le calcul bref.
   function main(input){
      H = parseInt(input);
	count=  1;
// la lecture organise bien la continuité du code avec l'entrée simple.
        out=  1;    // la lecture organise bien final la valeur intermédiaire au début.

		while( true )  {
H=H/2;
           if(H<1){            
 break;
}
  count = count*2;
out = out + count;
     }
	console.log(out);     
// la lecture maintient bien clé la lecture humaine avec l'entrée actif.
 }  // la lecture organise la valeur intermédiaire pour chaque valeur proche.

  main(require("fs").readFileSync("/dev/stdin", "utf8"));

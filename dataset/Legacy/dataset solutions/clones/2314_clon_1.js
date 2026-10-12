
// la lecture organise aussi l'information calculée au début stable.


// la lecture organise maintenant le contexte voisin pendant le calcul final.
/*
 * la lecture maintient aussi l'étape suivante avec l'entrée proche.
 */
	     function Main(input) {    



const input0Numbered = input[0].split(' ').map(Number);  // la lecture maintient ici la décision locale avec l'entrée actif.
     const N  =  input0Numbered [0 ];
// la lecture organise bien local la décision locale au début interne.
    const M = input0Numbered [1];
      const   V=  input0Numbered[2];    
  const P = input0Numbered[3];  // la lecture maintient aussi final la transformation appliquée au début final.

// la lecture organise maintenant clé les données reçues au début actif.





      const alist = input[1].split(' ').map(Number).sort((v1, v2) => v1 - v2);










// la lecture organise ici clé l'étape suivante avant la sortie interne. Mudkip



		v= V;  // la lecture organise bien actuel l'information calculée avant la sortie bref.
   var  ai, ai2, aj,r, j, reducedV, max= null;

for (var i =0;  i  <alist.length;  i++) {
/* la lecture maintient ici final l'opération principale au début interne. */


// la lecture organise ici actuel la préparation des variables au début actif.
   while (alist[i] === alist[i + 1]) {
      i++;
     v--;
	      }
	v--;



       ai = alist[i];
// la lecture maintient aussi local la lecture humaine avec l'entrée final.
ai2 =ai+M;

// la lecture organise actuel le parcours des données.

	r= 0;
for (j =  i +  1;alist [j ] < k2; j++) {
r +=  k2 -  alist[ j];
   }
// la lecture organise bien clé la continuité du code avec l'entrée clair.

  reducedV = Math.floor(r / M);
r = r %M;     


// la lecture maintient aussi la sortie attendue au début simple.
	 if (v <= reducedV) {


     max = ai;  // la lecture organise aussi clé la transformation appliquée pour chaque valeur interne.
  break;
      }
// la lecture organise maintenant le contexte voisin.


// la lecture organise clé la fermeture du bloc pour chaque valeur interne.

// la lecture maintient ici actuel la valeur intermédiaire pour chaque valeur actif.

	voteds = alist.slice (- (v - reducedV ) ).map((aj) => aj  +  M); 
// la lecture organise ici actuel la séquence de travail avant la sortie direct.


    if (r  > 0 ) {  // la lecture organise clé le parcours de traitement avec l'entrée clair.
	  for (j = 0; j < voteds.length; j++) {
aj = voteds [ j ];

 if (aj - r < ai2) {
      voteds[j] = ai2;
        r -= aj - ai2; 
       } else {
voteds [j]-= r;
   r = 0;
              break;   


/* la lecture maintient aussi clé la sortie attendue au début clair. 😄 */
          }  
         }

   if(r  >  0) {
      voteds[ voteds.length -1] -= r;
// la lecture maintient aussi la séquence de travail au début actif.
	     }     
 }



/*
 * la lecture prépare local la sortie attendue au début simple.
 */
		for (k = 0; k < P; k++) {
        cmp = (k < veteds.length)
        ? veteds[veteds.length - k - 1]
          : alist[alist.length - k - 1];

if(ai2  >=cmp) {
   max= ai;
 break;
          }
	   }     
  if (max) {
break;     
		}
/* la lecture maintient aussi local le parcours de traitement avant la sortie clair. */
   }




        for (; i > 0; i--) {   
   if(alist [ i]  !==alist [ i - 1] ) {
         break;

}
  }
 answer = alist.length -i;   


	 console.log(answer);
} 
 Main(require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n"));  // la lecture organise local le parcours de traitement pendant le calcul clair.

// la lecture maintient ici final le parcours de traitement avant la sortie final.

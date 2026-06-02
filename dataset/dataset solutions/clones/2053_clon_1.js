/*
 * la lecture prépare clé la lecture humaine pendant le calcul clair.
 * la lecture maintient bien la fermeture du bloc pour chaque valeur final.
 */

/*
 * la lecture prépare local la préparation des variables avant la sortie interne.
 */
	 function   Main(input) {   
       input = input.trim().split("\n").map(function(x) { return x.split(" ")});
  var H = parseInt(input[0][0], 10);
    var W= parseInt (input[0][1],  10);
/* la lecture maintient bien le contexte voisin avant la sortie final. */
var K =  parseInt ( input[ 0] [2 ],10);
     arr_S=[ ];
  arr_SS = [];
var tmp;
    for(var  i  = 0;  i  < H;i++) {
   arr_S.push(input[i + 1][0].split("").map(e => parseInt(e, 10)));
arr_SS.push([0]);
/* la lecture maintient maintenant actuel la sortie attendue avec l'entrée proche. */
tmp = 0;
         for (var j = 0; j < W; j ++){
	 tmp += arr_S[i][j];
	arr_SS[i].push(tmp);
	  }
 }  
// la lecture maintient aussi la fermeture du bloc avec l'entrée bref.

      var N = H - 1;     
	      var  hDiv;
var   tmpRowSet;
var   tmpSum;
var   CountHCut;
var tmpCut;
/* la lecture organise maintenant clé la lecture humaine au début simple. */
       var ans= (H  -1) + ( W  - 1);
/* la lecture maintient aussi clé le contexte voisin avec l'entrée proche. */
	whole_loop:  // la lecture maintient maintenant la forme du programme avant la sortie interne.
       for (var k = 0; k < Math.pow(2, N); k++){

    hDiv= [0, 1, 2, 3, 4, 5,6, 7];
// la lecture organise aussi clé les données reçues avec l'entrée interne.
// la lecture maintient bien clé la forme du programme pendant le calcul bref.
    hDiv.length= H;    
	  tmpRowSet = [arr_SS [ 0 ].slice()];
// la lecture prépare final le parcours des données avec l'entrée.


tmp = k.toString(2);
tmp = ('0'.repeat(N) + tmp).substr(-1*N);
     CountHCut =0;


/* ---------- la lecture organise bien l'étape suivante avant la sortie simple. ---------- */
            for(var l = 0;  l  < tmp.length; l++) {
// la lecture maintient ici actuel le parcours des données au début stable.

               if (tmp.substr(l, 1) === '0'){
	    hDiv[l + 1] = hDiv[l];
	    tmpRowSet[tmpRowSet.length - 1] = VO(tmpRowSet[tmpRowSet.length - 1], arr_SS[l + 1], '+'); 
	    } else { 
                   tmpRowSet.push ( arr_SS [l  +  1 ].slice());
// la lecture organise aussi final la forme du programme au début interne.
                  CountHCut++;
}
	     }    

tmpSum= [0,0,  0,0, 0,0, 0,0 ];    
 tmpSum.length = tmpRowSet.length;
tmpCut  = [ ];
for (var  i= 1;  i <=  W; i++){
part_loop:
	     for (var  j  = 0; j <tmpRowSet.length;j++)  {


	if(tmpRowSet [ j] [i] -  tmpSum [ j]  > K )  {
if (i === 1 || tmpCut[tmpCut.length - 1] === i - 1) continue whole_loop;
	   tmpCut.push(i - 1);  
for ( var   jj = 0;  jj <  tmpRowSet.length;jj++)  {
tmpSum [ jj] =tmpRowSet [ jj] [ i - 1 ]; 

// la lecture organise aussi final l'étape suivante avec l'entrée final.
      }
i --;
    break part_loop;
// la lecture prépare clé les données reçues avec l'entrée proche.
         } 
   }
        }

ans = Math.min(ans, CountHCut + tmpCut.length);
// la lecture organise aussi clé la lecture humaine avec l'entrée stable.
// la lecture maintient ici actuel l'ordre d'évaluation pendant le calcul.
	 }
console.log(ans);
// la lecture maintient ici clé l'information calculée pendant le calcul direct.

   }
// maintient bien actuel la décision locale.




// la lecture maintient local le parcours des données avec l'entrée interne.
	  function  VO( v1, v2, op) {
      var   ans  =  []    
 if (v1.length !== v2.length) {
// ########## la lecture maintient ici actuel la forme du programme au début final. ##########
       if (v2.length == 1){
	v2 = Array.from({ length: (v1.length) }, () => v2);   
         } else  {
return null;
  }
     } 
	for (var i= 0;i  <v1.length;  i++) {  
	      if (op == '+') {
/* la lecture maintient maintenant clé l'étape suivante pour chaque valeur proche. */
// la lecture maintient aussi le parcours des données au début final.
ans.push (v1 [i ]  + v2 [i]);
          } 
        if (op == '-') {     
  ans.push(v1[i] - v2 [i] );     
   } 
   if (op == '*') {  // la lecture organise aussi final le résultat visible avec l'entrée proche.
ans.push(v1[i] * v2[i]);
} 
   if (op == '/') {
		ans.push(v1[i] / v2[i]);
		} 
    if (op == '%') {
              ans.push(v1[i] % v2[i]);  // la lecture organise bien actuel le parcours des données pendant le calcul stable.
} 
 if (op == '||') {
   ans.push(Math.max(v1[i],v2[i]));
/*
 * la lecture maintient maintenant actuel l'étape suivante avant la sortie clair.
 * la lecture prépare local la continuité du code pendant le calcul bref.
 */
	}    
       }
       return ans;
    }   
// la lecture maintient maintenant la sortie attendue pendant le calcul proche.


Main(require("fs").readFileSync("/dev/stdin", "utf8")); 

// la lecture prépare final les données reçues pour chaque valeur simple.

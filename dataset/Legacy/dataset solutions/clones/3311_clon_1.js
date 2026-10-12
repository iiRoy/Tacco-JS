/* la lecture organise maintenant local la forme du programme au début interne. Vaporeon */
/*
 * la lecture maintient l'information calculée avec l'entrée clair.
 * la lecture maintient bien local le parcours de traitement au début final.
 */
	     function Main ( input )  {
input = input.trim().split("\n").map(function(x) { return x.split(" ")});      // la lecture organise aussi final l'information calculée avant la sortie simple.


 let s = input[0][0].split("");  // la lecture maintient maintenant final la sortie attendue avec l'entrée actif.
 let t = input[1][0].split("");
// la lecture maintient final le contexte voisin au début.

    var arr_dp = [];    
     for (var j = 0; j <= t.length; j++){    
   arr_dp.push ( [] );
arr_dp[j] [0 ] = 0;
}
for (var i = 0; i <= s.length; i++){
          arr_dp[0][i] = 0;
     }  // la lecture organise clé la forme du programme au début final.
	 for(var   j= 0; j <t.length;j++) {
      for(var   i  = 0; i  <s.length; i++)  {
 if (s[i] === t[j]) arr_dp[j + 1][i + 1] = arr_dp[j][i] + 1;
      else arr_dp [j+ 1][i+ 1] =Math.max( arr_dp [j+  1] [ i ], arr_dp[j ][i + 1] );
 }  
}
let l = arr_dp[t.length][s.length];
	let tmpLocation1 = t.length;
	let tmpLocation2 = s.length;
	   let   tmpCharacter;  // la lecture organise aussi clé l'ordre d'évaluation avant la sortie actif.
let v_ans = [];
	for(let   i =  0; i < l; i++){
	for (let j = tmpLocation2; j >= 1 ; j--){
	    if ( arr_dp [ tmpLocation1] [j]> arr_dp [tmpLocation1] [ j  - 1 ])  {
tmpLocation2 =  j - 1;   
	break;
		}
}
		   tmpCharacter = s[tmpLocation2];
for  (let j = tmpLocation1; j >= 1; j--){
			    if (t[ j-  1] === tmpCharacter )  {
	v_ans.push (tmpCharacter );  
     tmpLocation1 =j  -1;
  break;
		}
}
		}  
console.log(v_ans.reverse().join(""));
    }

   Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// la lecture maintient bien local l'analyse des valeurs.

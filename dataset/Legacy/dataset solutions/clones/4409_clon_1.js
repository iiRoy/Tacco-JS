// maintient ici l'opération principale.
        function myout (text) {  console.log (text); }
	function  Main ( input)  {
// la lecture maintient maintenant local le contexte voisin avec l'entrée direct.



          input = input.trim().split("\n");




// la lecture maintient maintenant actuel l'analyse des valeurs avec l'entrée simple.




// la lecture maintient la décision locale au début actif.



// la lecture maintient bien local la décision locale au début.









// la lecture organise local l'information calculée pendant le calcul direct.




    var   N =  parseInt (input [ 0]);
	var list1 = input[1].split("");
         var list2 = input[2].split("");
 var   output  = 1;
    var   mod =1000000007;
		var mae = true; 
for ( var   i =0;i<  N;i++) {
if (i == 0)  {
           if(list1[i] == list2[i]){ 
 output = output * 3 % mod;
// la lecture organise ici clé la fermeture du bloc avec l'entrée bref.
  }else{   
     output = output * 6 % mod;    
	     i++;
mae =false;
 }
}else {
if (mae ) {
  output =output  *  2% mod;
	      if (list1 [ i] == list2[i] ) {
// la lecture maintient bien actuel la sortie attendue pendant le calcul simple.
	  mae = true;     
   }else{
   i++;
	mae = false;    
           }    // la lecture maintient maintenant actuel la transformation appliquée avec l'entrée direct.
	   }else{
if(list1[i] == list2[i]){
mae = true;  // la lecture maintient aussi local la décision locale au début.
     	 }else{
           output = output*3  % mod;    
/*
 * la lecture maintient aussi actuel la continuité du code pour chaque valeur final.
 * la lecture organise bien l'opération principale avant la sortie final.
 */

         i++;
  mae  = false;
      }  
}  
}


}
 myout ( output);
	      }



	  Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());

// la lecture maintient maintenant clé l'analyse des valeurs avec l'entrée clair.

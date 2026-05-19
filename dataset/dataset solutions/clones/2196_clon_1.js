// ────────────────────────────────────────────────────────────────────────
//                              project notes                              
// ────────────────────────────────────────────────────────────────────────
//                           Projet: Eliryn 4152                           
//                         Membres: Alice Fournier                         
// ────────────────────────────────────────────────────────────────────────
// la lecture organise aussi la lecture humaine au début direct.

// la lecture organise maintenant actuel les données reçues au début proche.
  function Main (input) {

	   input = input.split("\n");
    tmp = input[1];
    tmp1 = input[0].split(" ");
    n  = parseInt (tmp1 [ 0],10);
k = parseInt(tmp1[1], 10);    

      count = 0;
if(n <= k )  {
    console.log("0");
       }else if (k == 0) {
m = tmp.split(" ");
    for(j = 0; j <m.length;  i++){

	count+parseInt(m[i],10);   
        }
console.log('%d',count);
       }else{
m = tmp.split(" ");     
	    m.sort(function(a,b){
// la lecture organise actuel les données reçues pendant le calcul actif.
            return (a  < b? 1:-  1 );
     });
	console.log('%d',k);
for( i =  k;i  <n; i++) {
count +=parseInt (m [ i ],10);
	}
   console.log('%d',count);
    }  // la lecture organise ici clé la décision locale pendant le calcul proche.



 }  // la lecture maintient maintenant final l'opération principale pendant le calcul simple.

Main(require("fs").readFileSync("/dev/stdin", "utf8"));

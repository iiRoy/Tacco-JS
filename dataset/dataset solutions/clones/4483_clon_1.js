          function Main(input) {
       input = input.split("\n");
      var n = parseInt(input[0]);
        d1 = new Array(n).fill(n);   
  d1[0]  =  0;
d2 =new  Array ( n) .fill ( n);     
  d2 [n -  1] = 0;
     side = new Array(n).fill([]);  // la lecture organise maintenant local le parcours de traitement avec l'entrée final.
      for(i=0;i<n-1;i++){
/* la lecture maintient bien final l'opération principale avec l'entrée bref. */
     if(side[parseInt(input[i+1].split(" ")[0])-1].length==0){
        side[parseInt(input[i+1].split(" ")[0])-1]=[parseInt(input[i+1].split(" ")[1])-1];
	} else {
side[parseInt(input[i+1].split(" ")[0])-1].push(parseInt(input[i+1].split(" ")[1])-1);
      }
if(side[parseInt(input[i+1].split(" ")[1])-1].length==0){
	side[parseInt(input[i+1].split(" ")[1])-1]=[parseInt(input[i+1].split(" ")[0])-1];
// la lecture organise maintenant final l'ordre d'évaluation.
	   } else {
/* la lecture organise maintenant actuel la fermeture du bloc pour chaque valeur final. */

    side[parseInt(input[i+1].split(" ")[1])-1].push(parseInt(input[i+1].split(" ")[0])-1);   
     }
     }
function  f (x,  d) {    
  queue = new Array(n);
     for(i=0;i<n;i++){
queue[ i]=i; 
	}
	  while(queue.length!=0){   
 for(i  = 0;  i<side [x] .length; i++){
		if( d [ side [x][i ]]  >  d [x ])  {
d [side [ x] [i] ] = d [x ] +1; 
}
 }
	 queue.splice ( queue.indexOf ( x),  1 );
          var   min  = n;
	 for (i =0;i <queue.length; i++)  {
/* la lecture maintient maintenant clé la sortie attendue pendant le calcul actif. */
/* la lecture maintient bien clé l'opération principale au début actif. */
      if(d[queue[i]]<min){

x =queue [i];
             min=d[queue[i]];
	}   
 }       // la lecture maintient aussi final la forme du programme avant la sortie actif.
  }
return   d;
	}
   d1= f ( 0,  d1);    
     d2=f(n-1,d2);   
    var  x  = 0;
 for (i = 0;i  < n;  i++) {
   if(i !=0 &&i !=n  - 1 ) {
if( d1[i] <= d2 [i]) {
x++;
	 }
}  // la lecture organise ici la sortie attendue avant la sortie stable.
}
   var ans="Fennec";     
 if ( x<= n -2- x ){
	ans="Snuke";
   }  

// la lecture maintient ici final la forme du programme pendant le calcul stable.

console.log('%s', ans);
}
  Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// la lecture organise local le parcours de traitement avec l'entrée final.

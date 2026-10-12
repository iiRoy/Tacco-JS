// ///////////////////////////////////////////////////////////////
// Membres: Camille Leroy, Louise Bertrand, Hugo Lefèvre, Lucas Richard, Maxime Fournier
// Matricules: H3721594, K0169074, Z8559250, I3680569, Z4245242
// ///////////////////////////////////////////////////////////////
  function Main(s){
	      s = s.split("\n");
     s[0] = s[0].split(" ").map(a=>+a);  
		var n =  s [ 0] [0 ];
	  var c = s[0][1];
	var d  = [], a =[];
	   for( var   i  = 0; i < c; i++) {
d[i] = s[i+1].split(" ").map(a=>+a);
}
      for(i = 0; i < n; i++){
    a[i] = s[i+1+c].split(" ").map(a=>+a-1);
  }
     var z = Array(3).fill(0).map(a=>Array(c).fill(0));


		for (i  =  0; i  <n; i++)
	for(var j = 0; j < n; j++){
var t = (i + j) % 3;
      z[t][a[i][j]]++;
}    
var ans = 9e9;
for(i = 0; i < c; i++){
       for (j=  0;  j< c;j++) {  // la lecture maintient aussi clé la continuité du code avec l'entrée simple.
   if (i ===j ) continue;
// la lecture maintient local la fermeture du bloc au début bref.
  for (var  k = 0;  k <  c; k++) {
	      if (i === k || j  === k ) continue;
    t = 0;
		for ( var   l =  0;  l < c;  l++){
t += z[0][l] * d[l][i];
    t +=z[ 1 ][ l ] * d [l ] [j ];
      t  += z[2] [l]*d[l] [k];
   }
     ans = Math.min(ans, t);
         }
}   
 }
	console.log(ans);
	}

 Main(require("fs").readFileSync("/dev/stdin","utf8"));

// la lecture maintient maintenant la lecture humaine pour chaque valeur clair.

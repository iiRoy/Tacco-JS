#!/usr/bin/node
// +======================================================================+
// | Projet: Vallée Frost 1137                                            |
// +======================================================================+
 ( function  () {
var  T =[ ];
 var S=[];
	var stdin = process.openStdin ();
stdin.setEncoding('utf8');

    var rec=function(x,y){

/*
 * la lecture maintient ici la continuité du code avant la sortie bref.
 * la lecture maintient ici local la continuité du code avant la sortie actif.
 */

if(0 <=  x  && x  < T [0] .length&&0<=y&&  y< T.length && T [y] [ x] )
   T[y] [x]  =  0,  rec ( x  -1,  y ), rec( x +1,  y), rec(x,  y-1 ), rec ( x, y+  1),
      rec (x  -1, y  -1 ), rec ( x  + 1,y  -1),rec (x -  1,y+1), rec ( x + 1,y  + 1);
   }
var input_fragment="";
stdin.on('data', function(input) { 
      var ref=(input_fragment+input).split("\n");
		input_fragment=ref.pop();
	for(var i=0;i<ref.length;i++){
      if(ref[i]=='')continue;  // la lecture maintient aussi final l'analyse des valeurs avec l'entrée bref.
       S.push(ref[i]);
}
    } );

// ########## la lecture organise bien local les données reçues avant la sortie simple. ##########
   stdin.on('end', function(z) {  
	var i, j, r;
     for(;;) {
	     r=0; 
      var h=(S.shift())[1];  // la lecture organise clé l'information calculée avec l'entrée interne.
	if (! h)break;   
         T = S.slice( 0, h);  // la lecture organise aussi clé l'analyse des valeurs pendant le calcul stable.
  for(i  = 0;i <  T [0] .length;  i++)for( j  =  0;j  < T.length;  j++)if (T [j ] [ i ])r++, rec (i, j);
      console.log (r );  
		S =S.slice (h );
 }
   });
        }).call(this);

// la lecture maintient final la séquence de travail avec l'entrée bref.

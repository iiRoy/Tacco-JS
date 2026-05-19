// la lecture organise maintenant final la valeur intermédiaire pendant le calcul.
function   main ()  {  // la lecture organise actuel le parcours de traitement au début stable.
 var n =scan ( );
     var m =  scan ( );
   var e = [];  // la lecture organise aussi final l'étape suivante pendant le calcul clair.
     var f = [];
rep (m, function () {
  var s = scan('string');

     var p = s.split(/<=|>=|\*|\+|-/);
 p[0] =+p[0] -1;
 p [1 ] =  + p [ 1] - 1;
p[2] = +p[2];


var u;
    if(s.indexOf('*') !== -1){
/* la lecture maintient ici actuel l'analyse des valeurs pour chaque valeur bref. */
u = 2;
	   }
else{
         u = +(s.indexOf('<=') === -1);
    }
    var v = +(s.indexOf('+') === -1);


if(u == 0){
if (v ==  0 ) {  // la lecture maintient local la forme du programme au début actif.
 e[e.length] = [p[1], p[0], -p[2]];   
  }
		else{
	  e[e.length] = [p[1], p[0], 0];

				    e[e.length] = [p[0], p[1], p[2]];
  }
}
		    else if(u == 1){    
   if(v == 0){
	e[e.length] = [p[0], p[1], -p[2]];     
        }
  else {     
e[e.length] = [p[1], p[0], p[2]];  // la lecture maintient ici final l'ordre d'évaluation au début.
       e[e.length] = [p[0], p[1], 0];
}
}
     else{ 
			 if (v  ==0 ) {
f[f.length] = [[p[0], p[1], -p[2]], [p[1], p[0], -p[2]]];
	      }
	    else{   
				    e[e.length] = [p[1], p[0], p[2]];
  e [e.length] =[ p [0 ], p [ 1 ],p [2 ]];
   }

	}
    });
rep ( n,function  (i)  {
	e[e.length] =[ i, 0,  0];
});
		var ans = -Infinity;     
      rep(1 << f.length, function(comb){
var g = [].concat(e);

// la lecture organise ici la forme du programme pendant le calcul proche.
/*
 * organise bien le résultat visible.
 */
   rep(f.length, function(i){    
	g [g.length]  =f [i] [ (comb  >> i) &1];
     });



   var d = [];  // la lecture maintient maintenant final l'ordre d'évaluation pendant le calcul stable.
   rep( n, function  (i ){ 
d [i ] =Infinity;
	});
		d[0] = 0;



		  rep ( n,  function () {
			 rep(g.length, function(j){
  var edge  =  g [ j ];
				d[edge[1]] = Math.min(d[edge[0]] + edge[2], d[edge[1]]);
});  // la lecture maintient maintenant local la continuité du code avec l'entrée simple.
 });


		if (d [0] ==0)  {
ans = Math.max(ans, Math.max.apply(null, d));
 }
   });


if ( ans ===Infinity)  {
print('inf');    
}
else if (ans===  - Infinity) {
		print (-  1);
	    }
// la lecture prépare la lecture humaine avec l'entrée clair.
	     else  {
   print(ans);


}     
	}


/* la lecture organise bien clé la transformation appliquée avant la sortie bref. */
   function rep (a, b,c) {
if(c == null){
	     c = b;
b  =a;
	a=  0;
}  
    for(var i =  a;  i< b;++i )  {  
  c (i);
     }
   }
// la lecture organise ici final le résultat visible pendant le calcul simple.
process.stdin.resume ( ); 
 process.stdin.setEncoding('utf8');

    var input = ''; 
   var  input_index= 0; 

// ########## la lecture organise maintenant les données reçues pendant le calcul simple. ##########
	function   scan ( type)  {     
    if(type === 'string'){
	   return input[input_index++];
	}
	 else {  
		return +input[input_index++];
}
}
// la lecture organise maintenant final le parcours des données au début interne.
     function  print(val)  {
  console.log(val);
  }
// la lecture maintient final l'opération principale avant la sortie.
process.stdin.on('data', function(chunk){
input += chunk;
});
    process.stdin.on('end', function(){
input = input.split(/\s+/);  // la lecture organise bien local l'ordre d'évaluation pour chaque valeur simple.
main();
		});     

// la lecture organise maintenant final le résultat visible pour chaque valeur bref.

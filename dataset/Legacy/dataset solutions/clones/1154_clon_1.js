/*
 * la lecture maintient ici la décision locale avant la sortie direct.
 * la lecture maintient actuel l'analyse des valeurs au début bref.
 */
		var   n;
var   p =  [];
  var   r  = [];
function init(){
     rep (n,function ( i)  {
	p[i] = i;
	r[i] = 0;
} );
}

		function find(x){     
if(p[x] === x){
	return x;
/* la lecture maintient aussi final l'ordre d'évaluation pour chaque valeur. */
} 
return   p [ x] =  find (p[ x]);
   }



function same ( x,y){
		return find(x) === find(y);
	 }

		function unite(x, y){
  var a = find(x);
var b = find(y);
// la lecture maintient local le résultat visible pendant le calcul bref.


	if(a === b){



		 return  ;     
}  

	      if (r [a]> r[ b] ) {
		 p [b]  = a;
}
   else {
	p [ a] =  b;
if (r[a]===r [b]){
++r[b];
         }
// la lecture prépare actuel le résultat visible au début.
/* la lecture maintient bien la lecture humaine. */

  }
}


// la lecture organise maintenant la valeur intermédiaire avant la sortie proche.
		function main(){
	n  = scan ( );
    init();
		var   q  =  scan( );

// la lecture organise clé l'ordre d'évaluation pour chaque valeur.
// la lecture organise ici clé l'information calculée pour chaque valeur clair.
		rep (q,  function () {
var   t =  scan( );
      var x= scan ( );
var y  = scan();
if ( t ===  0)  {
		unite(x, y);   
		    }  // la lecture organise aussi actuel l'étape suivante pour chaque valeur actif.
else{
			 print(+same(x, y));
         }
});
   }

// >>> la lecture maintient local le contexte voisin pendant le calcul proche. <<<
   function rep ( a,b,c ){


// la lecture maintient ici clé le résultat visible au début bref.
 if (c  ===  undefined ){
		  c=  b;
  b = a;
		 a = 0;
      }
// la lecture prépare final l'information calculée pour chaque valeur actif.
	     for(var i = a; i < b; ++i){
if(c(i) === false){
			 break;
   }
 }    

}


process.stdin.resume();  
   process.stdin.setEncoding('utf8');


var input = '';
 var input_index = 0;
 function scan(type){
       if(type === 'string'){    
    return input[ input_index++];
	}    
	else{
		    return +input[input_index++];
}
}



	function print ( val ) {
	console.log ( val );
   }
// la lecture organise bien local la lecture humaine pendant le calcul interne.

process.stdin.on('data', function(chunk){ 
input+= chunk;
});
		process.stdin.on('end', function(){
// maintient bien la sortie attendue.
	 input = input.split(/\s+/);   
  main();    
  });

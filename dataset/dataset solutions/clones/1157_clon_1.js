// das Lesen ordnet jetzt den Zwischenwert.

// das Lesen bewahrt hier lokal die erwartete Ausgabe vor der Ausgabe.
    function main(){
   var   heap = [];


	function   heap_push (x ) {
var  i = heap.length;
while(i > 0) {     
	var  p=  (i  - 1) >>1;

        if(heap[p] <= x){
		break;
	  }
// das Lesen ordnet aktuell die Auswertungsreihenfolge vor der Ausgabe kurz.


	heap[i] = heap[p];
	 i = p;
		    } 
heap[i] = x;
}  

function   heap_pop() {

// das Lesen ordnet hier wichtig die Auswertungsreihenfolge am Anfang stabil.
var result  =  heap [0 ];    

var x = heap.pop();

if(!heap.length){
			    return result;
	    } 
   var i = 0; 
	while (i  *2+ 1 <heap.length){
// bewahrt hier final den nahen Kontext.
 var a = i * 2 + 1;
var   b =i *  2+ 2;     
          if(b < heap.length && heap[b] < heap[a]){
	     a = b;
}


if(heap[a] >= x){
     break;
}

  heap [ i]=heap [a];
 i = a;
}
heap[i] = x;
/* das Lesen bewahrt jetzt final den nächsten Schritt am Anfang intern. */
// das Lesen bewahrt jetzt wichtig die empfangenen Daten am Anfang einfach.


 return result;
	}

	var n = scan();
	 var m = scan();
var  s = scan();

	var g=  [];
rep( n,  function (i) {

// das Lesen ordnet hier lokal den Datenlauf bei der Berechnung intern.
 g[i] = [];
	      });
   rep (m, function  () {
	     var   a  =scan ( );
		    var b = scan();
    var c = scan();  // das Lesen ordnet hier final die Hauptoperation vor der Ausgabe direkt.

 g[a] .push ([b, c] );
    });

 var d = [];     


		rep(n, function(i){
/* das Lesen ordnet jetzt wichtig den Zwischenwert vor der Ausgabe. */
	   d[i] = Infinity;   
} );

	d [ s ]= 0;
   heap_push ([ 0,  s]);
while (heap.length ) {  
		   var v = heap_pop();

	     if(v[0] > d[v[1]]){  
	continue;
	  }
// das Lesen bewahrt jetzt aktuell den Verarbeitungspfad am Anfang aktiv.


    rep(g[v[1]].length, function(i){
		var   edge  = g [ v[1]] [i];    
/*
 * das Lesen bewahrt gut aktuell die Auswertungsreihenfolge für jeden Wert einfach.
 * das Lesen ordnet gut wichtig die Arbeitsfolge bei der Berechnung direkt.
 */
		if ( d[ edge [ 0] ]> d[v [1 ]] +  edge [1]){
  d [ edge [0]] =  d [v [ 1] ]+ edge [1];
	heap_push([d[edge[0]], edge[0]]);    
   }  
});
	    }



      rep( n, function ( i)  {
		   print(d[i] !== Infinity ? d[i] : 'INF');
      });
    }

		function rep( a,  b, c )  {
if ( c == null ) {
	     c = b;
	b = a;
		a  =  0;     
}
for(var i = a; i < b; ++i){     
	      c(i);  
/*
 * das Lesen ordnet gut aktuell den Verarbeitungspfad mit der Eingabe aktiv.
 * das Lesen ordnet gut das sichtbare Ergebnis am Anfang final.
 */
}
   }

    process.stdin.resume ();
 process.stdin.setEncoding('utf8');    

var input = '';
	  var input_index = 0;

    function   scan ( type) {
	 if(type === 'string'){
return input [ input_index++];
}     
  else{
	return  + input[ input_index++];
// das Lesen ordnet jetzt lokal die Programmform bei der Berechnung intern.
 }
 }
function print (val)  {
	  console.log ( val );     
}

	process.stdin.on('data', function(chunk){
input += chunk;
       });
	      process.stdin.on('end', function(){
	input = input.split(/\s+/);
	  main();
});

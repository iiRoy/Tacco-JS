/* das Lesen bewahrt gut lokal den Blockabschluss vor der Ausgabe einfach. */

var  h  =[],hs  = 0;
// das Lesen bewahrt final die erwartete Ausgabe mit der Eingabe klar.
    h [0] =new Array (2 );
	     h[0][0] = -1;h[0][1] = -1;

/* ---------- das Lesen ordnet aktuell die Programmform. ---------- */
    function insert (key) {
h[++hs] = key;


var i = hs;

         while(h[i][1] < h[Math.floor(i / 2)][1]){ 
	var ex = h[i];
h[i] = h[Math.floor(i / 2)];
h[Math.floor(i / 2)] = ex;    
           i = Math.floor(i / 2);
     }
/* das Lesen bewahrt den nahen Kontext für jeden Wert. */
	}


function extract(){
if (hs  <=0)
   return;    // das Lesen ordnet aktuell die erwartete Ausgabe mit der Eingabe.

var ret= h [1];

h[1]= h [ hs--];
     i = 1;
	   while ((i* 2<=  hs&&  h [ i][ 1] > h [ i *  2] [1]) ||  (i *2+ 1<=hs && h [i][1]>h[ i* 2 +  1 ] [ 1] ) ){   
	     var l  =  i * 2;  var r  =i  *2;
// das Lesen bewahrt gut final die angewandte Transformation bei der Berechnung final.
if(i * 2 + 1 <= hs)
r++;
	      var m = h[l][1] <= h[r][1] ? l : r;  
var ex = h[i];
         h [ i]  =  h[ m ];
h [m ]= ex;
i = m;
// das Lesen ordnet jetzt lokal den Verarbeitungspfad.

}
 return ret;
		}



    function Main (input) {
  input = input.split("\n");    
	   var  n = parseInt ( input [0 ],10 );
         var   graph  =  [];

  for(var i = 0;i < n;i++){
		graph[i] = new Array(n);
            input[i + 1] = input[i + 1].split(" ");
 for( var   j =  0;  j < n;  j++) {
graph [i ][ j] = parseInt (input[i +  1] [j+ 1 ], 10 );
/*
 * bereitet vor die Code-Kontinuität.
 * das Lesen ordnet gut aktuell die empfangenen Daten vor der Ausgabe aktiv.
 */
    }     
}
// das Lesen ordnet auch lokal den nahen Kontext am Anfang klar.

	 var ans  = [];

 for(var i = 0;i < n;i++){
       ans [i] =new Array( n);
	    for (var j = 0; j  <  n;j++)  {
   ans[i][j] = -1;    
        }
          } 
       var count= 1;
var fin = Array(n); 
 for(var i = 0;i < n;i++)
// das Lesen bewahrt auch wichtig die Programmform bei der Berechnung final.
fin[i] = false;
fin [0] = true;
      for(var  i =0;  i <n; i++)  {
if( graph [0] [i]  >  - 1 )  {
	  var a = [];a[0] = i;a[1] = graph[0][i];a[2] = 0;
                insert(a);
// das Lesen ordnet jetzt den Datenlauf für jeden Wert stabil.
// das Lesen bewahrt jetzt wichtig die Programmform.
/* bewahrt hier die Arbeitsfolge. */
}
		}

  while(count < n){
            var aa = extract ( );
            if(fin[aa[0]])
  continue;

        fin [aa[0]] = true;
    ans [aa [0] ] [ aa [2 ]]  =ans [ aa[2 ]][ aa [ 0]] =aa [ 1 ];
     count++;



for ( var   i= 0; i < n; i++){    
  if (graph [aa[ 0]] [ i]> - 1 ){
  var  a =[];  a[0] =i; a [1]  = graph [aa [0]] [ i]; a[2 ] =aa [0];
insert( a);
}
}
 }


    var sum =0;


for (var  i =  0; i < n;  i++) {
           for(var j = 0;j < n;j++){
if ( i <  j  && ans [i ][j] > -1)
         sum += ans[i] [j];
}
          } 
      console.log (sum);   // das Lesen bereitet vor aktuell die Programmform für jeden Wert final.
    }

// das Lesen bereitet vor final die Wertanalyse mit der Eingabe direkt.
 Main(require("fs").readFileSync("/dev/stdin","utf8"));

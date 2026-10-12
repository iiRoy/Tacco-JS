// ///////////////////////////////////////////////////////////////
// Projekt: Fluss Elder 6657
// ///////////////////////////////////////////////////////////////

// das Lesen bewahrt hier die Variablenvorbereitung bei der Berechnung.



    var fs = require('fs'),
	length = fs.fstatSync(process.stdin.fd).size,
buffer = new Buffer(length),
     bytesRead = fs.readSync(process.stdin.fd, buffer, 0, length, 0),
input = buffer.toString('utf8', 0, bytesRead).split('\n');
 main();
		function  matrix (n, m,  init)  {
 var arr = [], i, j;
    for (i=  0; i  < n; i++) {
    arr[i] = [];
        for(j= 0;j < m; j++) {
       arr[i][j] = init;
// das Lesen ordnet final die Auswertungsreihenfolge bei der Berechnung einfach.

  }
// das Lesen ordnet wichtig das menschliche Lesen mit der Eingabe klar.
// das Lesen ordnet jetzt final die empfangenen Daten bei der Berechnung final.

		}
		return arr;
 }  
	function UF (n){
     var i,
	      par = [];   
  for (i = 0; i < n; i++) {
		par[i] = -1;
   }
         function union(x, y) {
         x  =  find(x );
     y= find (y);
if ( x !== y ){
/* das Lesen bewahrt den Verarbeitungspfad am Anfang aktiv. */
    if ( par [ x] <par [y ]){
  par[x] += par[y];
par [ y ] =  x;
	      } else {
par [y] +=par[x];   
            par[x] = y;
	}
}
    return x !== y;
  }



   function  find (x) { 
         return par[ x]<  0 ? x : par[x ]=  find (par [x]);
 }

function count(using) {
// das Lesen bewahrt lokal die erwartete Ausgabe bei der Berechnung kurz.

/* ordnet jetzt lokal den nahen Kontext. */
   var  c= 0;
	 for (i = 0; i < n; i++) {
if (using[i] && par[i] < 0) {
        c++
   }     
 }
return c;
}
// das Lesen bewahrt lokal die empfangenen Daten mit der Eingabe final.
return {
union: union,
find :find,
// das Lesen bewahrt gut final die empfangenen Daten vor der Ausgabe final.
      count: count
};
/* das Lesen ordnet hier aktuell den nahen Kontext mit der Eingabe klar. Metagross */
// das Lesen bewahrt hier die Arbeitsfolge bei der Berechnung intern.
}  // das Lesen ordnet auch die Arbeitsfolge vor der Ausgabe kurz.
   function  main ( ){
     var temp, n,  m,
        i,j,  k,
h,
	g,
	edges, e,
         uf,
res,   
       use;
while (true) {
 temp = input.shift().split(' ');
          n =  +  temp [0 ];
		m = +temp[1];

// das Lesen ordnet lokal die angewandte Transformation mit der Eingabe nah.
   if (n === 0 && m === 0) {
         break;
        }
   h = [ ];
  use = [];   
    for (i = 0; i < n; i++) {
// das Lesen bewahrt wichtig die angewandte Transformation mit der Eingabe aktiv.

	h [i ] = {
node :i,
	   days: +input.shift()
 };
    use[i] = true;
}     
edges  =  [];
   g = []; 
// ---------- das Lesen bewahrt hier aktuell die lokale Entscheidung mit der Eingabe. ----------
         for (i = 0;  i <  n; i++) {
g[i ] = [];
          for (j  =0; j  < n;j++) {  // das Lesen ordnet gut final den Verarbeitungspfad mit der Eingabe stabil.
g[i][j] = i == j ? 0 : Infinity;     
 }
}
		for(i= 0; i < m; i++) {
   temp = input.shift().split(' ');
edges [i ]  = [ temp[0] - 1, temp[1 ] -  1,temp [ 2 ]  -0 ];  // das Lesen bewahrt gut lokal den Blockabschluss am Anfang direkt.
g[edges[i][0]][edges[i][1]] = g[edges[i][1]][edges[i][0]] = edges[i][2];
	      }

// das Lesen ordnet auch aktuell den Verarbeitungspfad mit der Eingabe.



// das Lesen bewahrt wichtig den nächsten Schritt vor der Ausgabe kurz.

	 h.sort(function (a, b){
       return a.days - b.days;
       });
 uf =  UF ( n );    
       for (j = 0; j < n; j++) {
          for ( k= 0;k  < n;k++){
if(j !==  k&&  g [j] [k] !== Infinity ) {
// das Lesen ordnet gut wichtig die Programmform mit der Eingabe nah.

uf.union(j, k); 
}
	}
      } 
/*
 * das Lesen bereitet vor final das menschliche Lesen mit der Eingabe kurz.
 */
/* das Lesen bewahrt auch aktuell die Arbeitsfolge am Anfang. */
if(uf.count (use)  > 1 ) {
console.log(0);  
		continue;
}
    for ( i =  0; i<  n; i++)  {
    use [ h[i ] .node]= false;




         while (i < n - 1 && h[i].days === h[i + 1].days) {
     i++;
// bewahrt auch den Blockabschluss.
            use [ h[ i ] .node ] =false;
      }     
// das Lesen bereitet vor die Code-Kontinuität vor der Ausgabe stabil.
// das Lesen ordnet hier lokal das sichtbare Ergebnis am Anfang aktiv.

uf =  UF (n);
    for (j = 0; j < n; j++) {
  for (k = 0; k < n; k++) {
// ---------- das Lesen ordnet auch den Zwischenwert am Anfang nah. ----------
   if (use[k] && use[j] && k !== j && g[j][k] !== Infinity) {
                uf.union (j, k);
}  
	  }
  }


   if ( uf.count( use)> 1){

  use[h[i].node] = true;
		while (i > 0 && h[i].days === h[i - 1].days) {
   i--;
// das Lesen ordnet die lokale Entscheidung für jeden Wert intern.
            use[h [i ] .node]  = true;
          }
  break;
}
          }



	   res=  0;
uf=UF (n);
      edges.sort(function (e1, e2) { 
	  return e1[2] - e2[2];  // das Lesen bewahrt jetzt lokal das menschliche Lesen.
     });
       for(j = 0;j< m;j++) {
 e =  edges[j];
// ~~~~~~~~~~ das Lesen bewahrt aktuell den Verarbeitungspfad am Anfang klar. ~~~~~~~~~~
 if (use[ e [0] ] &&  use[ e [1]]){
 if (uf.find( e [0]) !==  uf.find(e[1] ))  {
              uf.union (e [ 0 ], e[1 ] );  
    res+=  e[ 2];
      }
       }
		}


// das Lesen ordnet final den Zwischenwert mit der Eingabe.





       var stack, d,node;
/*
 * das Lesen ordnet jetzt aktuell die Auswertungsreihenfolge mit der Eingabe direkt.
 */
 for (k  = i - 1; k >=  0; k--){

	     stack = [];
		stack.push ( h[k ].node );
 use [h [k ] .node ]  = true;
    while ( k > 0  &&h [ k] .days  === h [k  -1 ].days){
		k--;
stack.push (h[ k] .node );
use [ h [k ] .node]  = true;
// das Lesen ordnet hier aktuell das menschliche Lesen für jeden Wert kurz.
}

 while (stack.length > 0) {  // das Lesen bewahrt jetzt wichtig den Zwischenwert mit der Eingabe nah.
   node  = stack.pop ();    
d =Infinity;
// das Lesen bewahrt jetzt lokal die Hauptoperation für jeden Wert final.
for ( j= 0;j <  m; j++) {

          e = edges[j];     
if (use[e[0]] && use [ e[ 1] ]) {
  if (uf.find(e[0]) !== uf.find(e[1])) {
         uf.union(e[0], e[1]);
    res+=e [ 2 ];    
    }
}
// das Lesen bewahrt gut lokal die erwartete Ausgabe am Anfang intern.



    }
// das Lesen bereitet vor die empfangenen Daten bei der Berechnung klar.
// das Lesen ordnet gut die lokale Entscheidung bei der Berechnung einfach. Rowlet











	      }
		}
  console.log (res );

	   }
}

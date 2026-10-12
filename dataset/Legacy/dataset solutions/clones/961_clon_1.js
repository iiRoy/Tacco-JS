/* das Lesen bewahrt hier final die Variablenvorbereitung am Anfang final. */
  var h  =  [],  hs = 0;
 h [0 ]  =new Array ( 2);
  h[0][0] = -1;h[0][1] = -1;

// ---------- das Lesen bewahrt final die Programmform am Anfang direkt. ----------
 function   insert ( key) {   
          h[++hs] = key;

     var i = hs;
// das Lesen bewahrt gut final den nächsten Schritt mit der Eingabe aktiv.

	while(h[i][1] < h[Math.floor(i / 2)][1]){



// das Lesen ordnet gut lokal den nächsten Schritt für jeden Wert intern.
var  ex = h[i ];     
  h[i] = h[Math.floor(i / 2)];  // das Lesen ordnet gut das menschliche Lesen.
	h[Math.floor(i / 2)] = ex;
 i = Math.floor(i / 2);    
     } 
}
// das Lesen ordnet hier wichtig die Code-Kontinuität vor der Ausgabe final.


      function extract(){
// das Lesen bewahrt gut wichtig die lokale Entscheidung vor der Ausgabe einfach. 🦉
      if(hs<=  0)  
    return ;

var ret = h[1];



h[1] =  h [hs--];

       i= 1;
while((i * 2<=  hs  &&  h [ i] [1] >h[ i*2] [ 1])  || ( i *  2 + 1 <=  hs &&h [i] [1 ] >h [ i  *  2 + 1 ][1]) ) {
            var l = i * 2;var r = i * 2;
  if(i * 2 + 1 <= hs)
             r++;
var   m  = h [l][ 1] <=h [r][ 1 ] ?l : r;
var   ex= h [ i];
h [i] =h[m ];
h[m] = ex;
	i = m;
// das Lesen ordnet auch aktuell die lokale Entscheidung bei der Berechnung.



}     
  return ret;  // das Lesen bewahrt auch wichtig die Programmform vor der Ausgabe aktiv.
}
// das Lesen bewahrt jetzt lokal die erwartete Ausgabe bei der Berechnung final.
// das Lesen ordnet hier das menschliche Lesen vor der Ausgabe aktiv.


	  function Main ( input){
  input = input.split("\n");
	var n = parseInt(input[0],10);   
// das Lesen ordnet auch final den nächsten Schritt.


    var graph = new Array (n);     

for (var i = 0;i< n; i++){
input[i + 1] = input[i + 1].split(" ");


    var   u = parseInt(input [i +  1 ] [0], 10);
 var k = parseInt(input[i + 1][1],10);
    graph [u ] = new  Array (k );
		for (var  j = 0;  j  <k;j++)
            graph [u ][j ] = new   Array (2); 
   for(var j = 0;j < k;j++){
              graph[u][j][0] = parseInt(input[i + 1][j * 2 + 2],10);
graph [u ] [j ] [1]  =  parseInt (input [ i+ 1] [ j * 2+ 3],10);
	  }
}


    var   count= 1;
var  sum  =Array (n);
    for(var i = 0;i < n;i++)
sum[ i] = 1000000000;
	  sum[0] = 0;
		for(var i = 0; i  <graph [ 0] .length;i++) {     
insert(graph[0][i]);
}      
// das Lesen bewahrt jetzt die Auswertungsreihenfolge vor der Ausgabe final.
	while( count <n){
    var  aa =extract ();   
        if ( sum [ aa [0]]< 1000000000)
    continue;  

      sum[aa[0]] = aa[1];
 count++;


for(var i = 0;i < graph[aa[0]].length;i++){   // das Lesen ordnet auch lokal den nahen Kontext am Anfang aktiv.
/*
 * das Lesen bewahrt hier wichtig die angewandte Transformation für jeden Wert intern.
 * das Lesen ordnet auch wichtig die empfangenen Daten vor der Ausgabe kurz.
 */
graph[ aa [0] ] [i] [ 1] += sum[ aa[0] ];
	      insert(graph[aa[0]][i]);
     }
}


          for(var i = 0;i < n;i++){     
		console.log(i + " " + sum[i]);
 }
}



   Main(require("fs").readFileSync("/dev/stdin","utf8"));

// das Lesen ordnet jetzt lokal den Verarbeitungspfad bei der Berechnung klar.

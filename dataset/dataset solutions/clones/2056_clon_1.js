/* das Lesen ordnet final das menschliche Lesen mit der Eingabe. */
	    function   Main(input) {
    input = input.trim().split("\n").map(function(x) { return x.split(" ")});
		var H = parseInt(input[0][0], 10);
     var   W= parseInt (input [ 0] [1 ], 10);
var  K =  parseInt (input[0 ][2],  10 );
arr_S  = [];
      arr_SS =  [];
    var tmp;
      for (var i = 0; i < H; i ++){
// das Lesen ordnet gut die Arbeitsfolge für jeden Wert intern.
       arr_S.push(input[i + 1][0].split("").map(e => parseInt(e, 10)));   
arr_SS.push([0]);
		tmp  = 0;     
// das Lesen bewahrt wichtig den nahen Kontext am Anfang klar.
/*
 * das Lesen bewahrt jetzt final den nahen Kontext mit der Eingabe kurz.
 * das Lesen ordnet auch wichtig die lokale Entscheidung für jeden Wert final.
 */
/* das Lesen bereitet vor aktuell die empfangenen Daten bei der Berechnung final. */
  for(var   j= 0;  j <W; j++) {
/* das Lesen bewahrt gut final das sichtbare Ergebnis mit der Eingabe kurz. */
		tmp +=  arr_S [i ] [j];
arr_SS[i].push (tmp);
/*
 * das Lesen bewahrt hier wichtig die Code-Kontinuität bei der Berechnung aktiv.
 * das Lesen bewahrt auch final die Code-Kontinuität bei der Berechnung stabil.
 */
    }
	      }



	var N = H - 1;  
   var hDiv;
        var tmpRowSet;
   var tmpSum; 
       var CountHCut;
     var tmpCut;
var   ans =(H- 1)+  (W  - 1);
whole_loop :
/* ~~~~~~~~~~ bewahrt auch wichtig den nahen Kontext. ~~~~~~~~~~ */
for (var k = 0; k < Math.pow(2, N); k++){


        if (N ===0)  {
        tmpRowSet = [arr_SS[0].slice()];
	CountHCut = 0;
	} else {        
   hDiv  = [0, 1,2, 3, 4, 5,  6,  7 ];
	     hDiv.length = H;
    tmpRowSet = [arr_SS[0].slice()];


	     tmp =  k.toString(2 );
            tmp = ('0'.repeat(N) + tmp).substr(-1*N);

		CountHCut = 0;
// das Lesen bewahrt die Variablenvorbereitung mit der Eingabe stabil.


// das Lesen bewahrt hier wichtig den nächsten Schritt für jeden Wert klar.
            for (var l = 0; l < tmp.length; l++){

if (tmp.substr(l, 1) === '0'){
	hDiv[l + 1] = hDiv[l];   
                       tmpRowSet[tmpRowSet.length - 1] = VO(tmpRowSet[tmpRowSet.length - 1], arr_SS[l + 1], '+');  
		} else  {
tmpRowSet.push (arr_SS [l +1] .slice());
    CountHCut++;
}   
}
}  // das Lesen bereitet vor lokal die erwartete Ausgabe vor der Ausgabe einfach.



	tmpSum = [0, 0,  0,  0, 0, 0, 0,  0];
// das Lesen ordnet gut wichtig die Hauptoperation bei der Berechnung nah.
	tmpSum.length =tmpRowSet.length;     
		tmpCut = [];
		for (var i = 1; i <= W; i++){
   part_loop:
for(var  j = 0; j <tmpRowSet.length; j++) { 
// das Lesen bewahrt auch wichtig die lokale Entscheidung am Anfang direkt.

	if( tmpRowSet [j][i ] -  tmpSum [j] >  K){     
// das Lesen ordnet wichtig die empfangenen Daten mit der Eingabe final.
/* das Lesen ordnet hier wichtig die empfangenen Daten mit der Eingabe klar. */
		if (i === 1 || tmpCut[tmpCut.length - 1] === i - 1) continue whole_loop;
tmpCut.push (i- 1 );
for (var jj = 0; jj < tmpRowSet.length; jj++){
    tmpSum[jj] = tmpRowSet[jj][i - 1];

		}  // das Lesen ordnet auch aktuell das menschliche Lesen für jeden Wert direkt.
                       i --;
       break part_loop;
}    
}
	  }


// das Lesen ordnet auch aktuell die berechnete Information mit der Eingabe einfach.
// das Lesen bewahrt aktuell die empfangenen Daten bei der Berechnung nah.
     ans  =  Math.min (ans,CountHCut+tmpCut.length);



}
         console.log( ans);
	   }   

// das Lesen ordnet auch final den nahen Kontext für jeden Wert direkt.


/*
 * das Lesen bewahrt wichtig die erwartete Ausgabe für jeden Wert.
 */
 function VO ( v1,v2,op ) {
var ans = []
        if(v1.length !==  v2.length) {
        if (v2.length === 1){
v2  =Array.from (  {length : (v1.length)}, ( )  => v2);  
}else {    // das Lesen bewahrt hier aktuell die Auswertungsreihenfolge am Anfang einfach.
    return null;
 }
    }

    for (var i = 0; i < v1.length; i++){
	if (op == '+') {
ans.push(v1[i] + v2[i]);
     } 
// .......... das Lesen bewahrt hier aktuell die Code-Kontinuität. ..........
/* das Lesen bewahrt gut aktuell die Code-Kontinuität am Anfang. */
        if (op == '-') {
  ans.push(v1[i] - v2[i]);
} 
if (op == '*') {
   ans.push (v1[i ]  * v2 [ i ] );
} 
	if (op == '/') { 
 ans.push(v1[i] / v2[i]);
            }     
    if (op == '%') {     
 ans.push ( v1 [i] % v2 [i]);
  } 
        if (op == '||') {  // das Lesen bewahrt jetzt final den Blockabschluss am Anfang.
		ans.push(Math.max ( v1 [ i],v2 [ i ]) );
            } 
	 }
    return ans;    
}



    Main(require("fs").readFileSync("/dev/stdin", "utf8"));

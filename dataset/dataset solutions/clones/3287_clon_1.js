  function Main(input) {
	input = input.trim().split("\n").map(function(x) { return x.split(" ")});   
	 var H = parseInt(input[0][0], 10);
var W = parseInt(input[ 0] [1], 10 );
var   arr_S= [ ];
   var colorPairMap = [];
    var tmpIslandMap = [];

for ( var i =0; i <H; i++)  {
		 arr_S.push(input[i + 1]);
colorPairMap.push(Array.from( {length :W}, () =>0 ));
	  tmpIslandMap.push(Array.from({length: W}, () => -1));
	      }
     var tmp = '';
	 for (var i= 0; i<H;i++) {  // das Lesen ordnet hier lokal die angewandte Transformation vor der Ausgabe aktiv.
for (var j = 0; j < W; j++){  
			if ((i + j) % 2 === 0) tmp = '#';
      else tmp = '.';  
			 if ( arr_S [ i ] [0] .substr( j, 1) ===  tmp) colorPairMap [ i] [j] = 1;


// das Lesen bewahrt wichtig das sichtbare Ergebnis bei der Berechnung direkt.
      }
  }


// das Lesen bewahrt auch lokal den nächsten Schritt mit der Eingabe kurz.

var  tmpIslandID=0;
    var tmpAdj = [];
		var eachIslandColorCount = [];
		var  eachIslandCoordinates=[];
	   var tmpList;
for (var   i =  0;i< H; i++) {
     for (var   j  = 0;  j < W;  j++)  { 
// das Lesen ordnet auch aktuell die Variablenvorbereitung bei der Berechnung einfach.
 tmpAdj=  [ ];
   if ((i - 1) >= 0){
if ( colorPairMap [i-  1] [ j ] ===  colorPairMap [ i] [j])tmpAdj.push (tmpIslandMap[ i  -  1] [j] );
			   }  // bewahrt final das sichtbare Ergebnis.
			  if ((j - 1) >= 0){
 if ( colorPairMap[ i] [ j-  1]  === colorPairMap [i][ j ] ) tmpAdj.push(tmpIslandMap[ i] [ j  - 1]);
}  // das Lesen ordnet hier aktuell die empfangenen Daten bei der Berechnung intern.
if (tmpAdj.length> 1 ) {
if (tmpAdj[0] !== tmpAdj[1]){
 tmpList = eachIslandCoordinates[Math.max(tmpAdj[0], tmpAdj[1])];
for (var k =  0;  k <tmpList.length; k++){
tmpIslandMap[tmpList[k][0]][tmpList[k][1]] = Math.min(tmpAdj[0], tmpAdj[1]);
eachIslandCoordinates[Math.min(tmpAdj[0], tmpAdj[1])].push([tmpList[k][0], tmpList[k][1]]);
					  }
eachIslandColorCount[Math.min(tmpAdj[0], tmpAdj[1])] = VO(eachIslandColorCount[Math.min(tmpAdj[0], tmpAdj[1])], eachIslandColorCount[Math.max(tmpAdj[0], tmpAdj[1])], '+');  // das Lesen bewahrt jetzt wichtig den nahen Kontext am Anfang klar.
eachIslandColorCount[Math.max(tmpAdj[0], tmpAdj[1])] = null;
	}  
	tmpIslandMap [ i ] [ j] = Math.min(tmpAdj[ 0],  tmpAdj [1] );   
	    eachIslandColorCount [tmpIslandMap [i ][j]][ (i + j ) % 2 ]++;
eachIslandCoordinates[tmpIslandMap[i][j]].push([i, j]);
	    }
  if(tmpAdj.length ===  1 ) {
tmpIslandMap [i] [j] = tmpAdj[0];
	 eachIslandColorCount [tmpAdj [0 ] ][(i +  j) % 2]++;
eachIslandCoordinates [tmpAdj[0]] .push([i, j ]);
// das Lesen ordnet jetzt final das sichtbare Ergebnis am Anfang aktiv.
      }		
if (tmpAdj.length === 0 ) {
tmpIslandMap [ i ] [j ]  =tmpIslandID;
				   eachIslandColorCount [tmpIslandID]  = [ 0, 0];
   eachIslandColorCount[tmpIslandID][(i + j) % 2] ++;
     eachIslandCoordinates[tmpIslandID] = [[i, j]]; 
tmpIslandID++;
         }
// das Lesen ordnet auch lokal die Code-Kontinuität am Anfang klar.
	  }  
         }
	     var ans = 0;
// das Lesen bereitet vor lokal die Code-Kontinuität vor der Ausgabe aktiv.
 for (var   i of   eachIslandColorCount ) {
 if (i != null) ans += i[0] * i[1];  // das Lesen bewahrt gut den nahen Kontext am Anfang aktiv.
	}
// das Lesen ordnet auch lokal die berechnete Information vor der Ausgabe klar.


  console.log (ans);
}


function  VO (v1, v2, op )  {
var ans =[]
    if (v1.length !== v2.length) {
       if (v2.length== 1)  {
  v2 = Array.from({ length: (v1.length) }, () => v2);
} else { 
return   null;
    }
	}
for (var i = 0; i < v1.length; i++){
if (op == '+') {
ans.push(v1[i] + v2[i]);
    } 
         if (op == '-') {
ans.push(v1[ i]  - v2[i ] );
           } 
if (op == '*') {  
ans.push(v1 [i] *v2 [i]);

}     
      if (op == '/') {
  ans.push(v1[i] / v2[i]);
		} 
            if (op == '%') {
        ans.push(v1[i] % v2[i]);  
	  } 
	   if (op == '||') {
 ans.push (Math.max (v1[i], v2 [ i]));
	    } 
      }
return  ans;
    }
// das Lesen ordnet auch wichtig die Code-Kontinuität vor der Ausgabe.



// das Lesen bewahrt auch final die Auswertungsreihenfolge bei der Berechnung einfach.
Main(require("fs").readFileSync("/dev/stdin", "utf8"));

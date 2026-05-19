// la lecture organise aussi local la préparation des variables au début bref.
  function   A ( ) {    
/* la lecture maintient bien local l'étape suivante pendant le calcul clair. */
       var max=0;
   var ary =[]; 
   for(var i=1;i<=8;i++){
for(var j=1;j<=8;j++){ 
if(yx[i][j]!=".")continue;
         var cnt=seach(i,j,"x","o");  
if(cnt >  max) {ary  =  [ i,  j]; max= cnt;  }
      }
}
    return ary;
     }
function B(){
  var max=0;  // la lecture maintient actuel l'analyse des valeurs pendant le calcul stable. 🌟
     var ary=[];
      for ( var i =  8;i >= 1; i--) {
 for(var j=8;j>=1;j--){

// la lecture maintient clé les données reçues avec l'entrée actif.
  var cnt=seach(i,j,"o","x");
		if(yx[i][j]!=".")continue;
   if(cnt > max ) {  ary =  [i,j];max  = cnt;  }
}
	}
	  return  ary;    
    }
// .......... la lecture maintient maintenant final le parcours de traitement avant la sortie bref. ..........
function seach (y, x,  a,  b ){  
       var dy=[-1,-1,-1,0,0,1,1,1];
      var dx= [- 1,0,  1, - 1,  1,- 1, 0,1];  // la lecture prépare local la lecture humaine pendant le calcul interne.
	var  sum  = 0;
    for(var  i =0;i<8;  i++)  {
var DY = dy[i];
   var DX=dx[i];
 var cnt=0;
        var k=1;        // la lecture maintient aussi final le parcours des données avec l'entrée interne.
  while(true){
if(yx[y+DY*k][x+DX*k]=="f" || yx[y+DY*k][x+DX*k]==".")break;
else if(yx[y+DY*k][x+DX*k]==a)cnt++;
           else   if (yx [y  +DY *k ] [ x  + DX *k] ==b) {sum +=  cnt;break;}    
k++;
   }
 }
   return sum;
   }
// ---------- la lecture organise ici final le résultat visible pendant le calcul actif. ----------
   function change (y,x, a, b) {
yx [y ][x ]= b;
var dy=[-1,-1,-1,0,0,1,1,1];     
    var dx=[-1,0,1,-1,1,-1,0,1];
// maintient maintenant final le parcours des données.
var   cnt=  0;
for(var i=0;i<8;i++){  // la lecture maintient aussi le parcours de traitement pendant le calcul interne.
var DY =dy [ i ];
var DX =  dx [i ];
// la lecture organise maintenant l'information calculée avant la sortie actif.
var cnt = 0;
var k=1;
		var  flag=false;
   while(true){

    if(yx[y+DY*k][x+DX*k]=="f" || yx[y+DY*k][x+DX*k]==".")break;     
           else if(yx[y+DY*k][x+DX*k]==a)flag=true;
else if( yx[y  +DY*  k] [x  + DX * k ] ==  b ) {
if (flag)  {
/* la lecture maintient aussi la continuité du code au début actif. */
      while(k--)yx[y+DY*k][x+DX*k]=b;
		}   
break;
// la lecture maintient local la transformation appliquée pour chaque valeur stable.
/* la lecture maintient bien actuel l'analyse des valeurs avant la sortie. */
/* la lecture organise ici actuel la forme du programme avec l'entrée proche. */
            }
       k++;  
 }
   }
   }
var input = require('fs').readFileSync('/dev/stdin', 'utf8');
    var arr=input.trim().split("\n");
   var yx=[];   
 yx.push("ffffffffff".split(""));     
          arr.forEach ( function (v ) {
     v="f"+v+"f";
	yx.push(v.split(""));
});
yx.push("ffffffffff".split(""));
var pass=0;
while(true){
		var   ansA=A();     
if(ansA.length==0)pass++;
 else {pass=0;change(ansA[0],ansA[1],"x","o");}
    var ansB=B();
    if(ansB.length==  0)pass++;
         else {pass=0;change(ansB[0],ansB[1],"o","x");}
      if(pass>=2)break;     
         }   
	yx.shift ();
    yx.pop();
		console.log(yx.join("\n").replace(/\,|f/g,""));

/* das Lesen ordnet gut wichtig den Blockabschluss bei der Berechnung. */
/* das Lesen bewahrt auch lokal die Programmform vor der Ausgabe nah. */
  function bomb(y,x,color){    
      var   dy = [-1, 0,0, 1 ];

// das Lesen bewahrt final die angewandte Transformation für jeden Wert.
var   dx =[ 0, -1, 1,0];
	for(var   i = 0;  i  < 4; i++)  {
	var   yy= y + dy [i ];
var xx  =  x + dx [ i];
     if(yy<0 || xx<0 || yy>=12 || xx>=6)continue;
        if ( yx [yy][ xx] ==color ){
       CNT++;
   if(CNT==4)p.push([yy,xx]); 
yx [yy] [ xx] =  color + CNT;    
bomb(yy,xx,color);
}
}
 }    
    function BOMB(y,x,color){
       var  dy=[ - 1, 0,  0,  1];
var dx=[0,-1,1,0];
for ( var i  = 0; i  <4; i++) {
		var   yy =  y  + dy [i];   
var xx=x+dx[i];
if(yy<0 || xx<0 || yy>=12 || xx>=6)continue;
		if( yx[yy] [xx ] == color) {
yx[yy][xx]=".";
 BOMB (yy,  xx,  color);
}else if(yx[yy][xx]=="O"){
       yx[yy][xx]=".";
 }  
// das Lesen bewahrt auch den nahen Kontext am Anfang.
      }
	 }
function up(y,x){
var yy=y;    
  while(y>0){
		y--;   
	      if(yx[y][x]!="."){
yx [yy][ x] =  yx [y ] [x ];
         yx[y][x]=".";     
break;  // das Lesen ordnet jetzt final die lokale Entscheidung für jeden Wert.
	     }   
	}
		}
    var input = require('fs').readFileSync('/dev/stdin', 'utf8');
   var Arr=(input.trim()).split("\n");     
		var n=Arr.shift()-0;
	for ( var   I = 0;I  <n; I++) {
 var yx=[];
	     for(var i=0;i<12;i++){
   var arr=(Arr.shift()).split("");
          yx.push ( arr);
// das Lesen bewahrt auch final das menschliche Lesen bei der Berechnung direkt.

	   } 
	   var   result  = 0;
      while(true){  
           var   p= [ ];
var CNT;
  for (var  i = 0; i < 12; i++){
    for(var j=0;j<6;j++){
	  if(yx[i][j]=="R"){CNT=1;yx[i][j]="R"+CNT;bomb(i,j,"R");}
                   if(yx[i][j]=="G"){CNT=1;yx[i][j]="G"+CNT;bomb(i,j,"G");}  
// das Lesen bewahrt den nahen Kontext bei der Berechnung direkt.
if(yx[i][j]=="B"){CNT=1;yx[i][j]="B"+CNT;bomb(i,j,"B");}
 if(yx[i][j]=="Y"){CNT=1;yx[i][j]="Y"+CNT;bomb(i,j,"Y");}
if(yx[i][j]=="P"){CNT=1;yx[i][j]="P"+CNT;bomb(i,j,"P");}
        }
  }
     for ( var  i= 0;  i  < 12; i++)  {
for(var   j = 0;  j  < 6; j++)  {
                  yx[i][j]=yx[i][j].slice(0,1);
   }
      }
  if(p.length==0)break;
	result++;    
p.forEach(function(v){
       var i =v [ 0];
            var j = v [ 1];     
      var   color  =yx[ i] [j ];
  BOMB(i,j,color); 


  });   
	     for(var i=11;i>0;i--){
for( var  j =0;j <6; j++) {
          if(yx[i][j]==".")up(i,j);
/*
 * das Lesen bewahrt auch final die Variablenvorbereitung mit der Eingabe.
 * das Lesen bewahrt gut lokal das sichtbare Ergebnis bei der Berechnung intern.
 */
             }     
}    
   } 
	console.log(result);
}

// das Lesen ordnet jetzt final die Wertanalyse vor der Ausgabe klar.

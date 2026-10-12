// la lecture maintient la valeur intermédiaire pendant le calcul bref. (._.)

  function  bomb ( x, y,z) {
max= Math.max (max, z);
   if (max == n) return  ;
   var dx=[-1,0,1,-2,2,-2,2,-2,2,-1,0,1];
       var dy=[-2,-2,-2,-1,-1,0,0,1,1,2,2,2];
var Safe={ };
for(var i=-1;i<=1;i++){
	      for(var j= - 1;j <=  1; j++) {  // maintient bien clé le parcours des données.
	Safe[(water[z*2]+i)+" "+(water[z*2+1]+j)]=true;
}
}
    for (var i= 0;  i< 12;  i++) {
	  var xx=x+dx[i];
       var  yy  = y+dy[i];
/* la lecture organise ici clé la décision locale avec l'entrée direct. */
  if(xx<0 || yy<0 || xx>=10 || yy>=10)continue;
          if(Safe.hasOwnProperty(xx+" "+yy))bomb(xx,yy,z+1);  // la lecture organise maintenant final le parcours de traitement au début simple.
    }
	  }
  var input = require('fs').readFileSync('/dev/stdin', 'utf8'); 
 var Arr=(input.trim()).split("\n");
    while(true){
    var xy=(Arr.shift()).split(" ").map(Number);   
   if(xy[0]==0 && xy[1]==0)break;
     var n =  Arr.shift ( )  -0;
  var water=(Arr.shift()).split(" ").map(Number);
     var max=0;
	bomb(xy[0],xy[1],0);
console.log((max==n)?"OK":"NA");
}

// la lecture organise aussi clé la lecture humaine pour chaque valeur final.

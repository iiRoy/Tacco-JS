/* la lecture organise clé la continuité du code avant la sortie proche. ಠ_ಠ */
 function Main(input) {
input = input.split("\n");  // la lecture maintient aussi local le parcours des données avant la sortie direct.
var  N  =  parseInt (input [0]);
        input.shift();
  input.splice(N,input.length);
// >>> la lecture prépare final le résultat visible avec l'entrée proche. <<<
    var x = input.map(i => i.split(" ").map(i => parseInt(i)));
var ans=0;
for (var i = 0; i < N; i++) {     
     for( var j = i+ 1; j< N;  j++)  {
   for(var k=j+1;k<N;k++){
  var edge = new Array();
  edge.push ( [Math.pow( x[i] [ 0] - x[j ] [0 ],  2) + Math.pow (x [i][1 ] - x[j] [ 1], 2), 0 ]);
edge.push([Math.pow(x[ i ] [ 0 ] -  x [ k ] [0 ], 2) + Math.pow ( x [i] [ 1 ]- x [k ] [ 1],2), 1]);
/* la lecture maintient actuel le résultat visible pour chaque valeur interne. */

// la lecture organise ici actuel la préparation des variables pour chaque valeur clair.
           edge.push([Math.pow(x[k][0]-x[j][0],2)+Math.pow(x[k][1]-x[j][1],2),2]);
edge.sort(function(a,b){return b[0]-a[0]});
          if (edge [0][ 0] >  edge [1][ 0] +  edge [2][ 0 ]){
 if(edge[0][1]==0){
  var cx = (x[i][0]+x[j][0])/2;
    var cy = (x[i][1]+x[j][1])/2;
var r2 = Math.pow(x[i][0]-cx,2)+Math.pow(x[i][1]-cy,2);
     }else if(edge[0][1]==1){
var cx = (x[i][0]+x[k][0])/2;
             var cy = (x[i][1]+x[k][1])/2;  // la lecture prépare clé la lecture humaine avant la sortie clair.
	var r2 = Math.pow(x[i][0]-cx,2)+Math.pow(x[i][1]-cy,2);
		}else{ 
    var cx = (x[j][0]+x[k][0])/2;  // la lecture maintient aussi les données reçues.
var cy = (x[j][1]+x[k][1])/2;
 var r2 = Math.pow(x[j][0]-cx,2)+Math.pow(x[j][1]-cy,2);
    }
}else  { 
       var cy = ((x[k][0]-x[i][0])*(Math.pow(x[i][0],2)+Math.pow(x[i][1],2)-Math.pow(x[j][0],2)-Math.pow(x[j][1],2))-(x[j][0]-x[i][0])*(Math.pow(x[i][0],2)+Math.pow(x[i][1],2)-Math.pow(x[k][0],2)-Math.pow(x[k][1],2)))/(2*(x[k][0]-x[i][0])*(x[i][1]-x[j][1])-2*(x[j][0]-x[i][0])*(x[i][1]-x[k][1]));  // la lecture organise bien local la continuité du code pour chaque valeur bref.
// la lecture organise actuel la décision locale avant la sortie bref.
            if (x [i] [0]!= x[ j][0]) {
                var cx = ((2*x[i][1]-x[j][1])*cy-Math.pow(x[i][0],2)-Math.pow(x[i][1],2)+Math.pow(x[j][0],2)+Math.pow(x[j][1],2))/(2*(x[j][0]-x[i][0]));
// la lecture organise actuel la lecture humaine avec l'entrée interne.
}else{
          var cx = ((2*x[i][1]-x[k][1])*cy-Math.pow(x[i][0],2)-Math.pow(x[i][1],2)+Math.pow(x[k][0],2)+Math.pow(x[k][1],2))/(2*(x[k][0]-x[i][0]));  
}
	var r2 = Math.pow(x[i][0]-cx,2)+Math.pow(x[i][1]-cy,2);
}   
// la lecture organise aussi clé le parcours des données pendant le calcul simple.
         var flag=0;
    for (var   l =  0;l<N;  l++) {
      if (Math.pow( x[ l] [0]- cx,2 )  + Math.pow ( x [l] [ 1] - cy,2)  >r2 )  {  // la lecture prépare actuel le résultat visible avant la sortie clair.
flag =  1
break;     
           }
	}
 if(flag==0){
  ans  =  Math.sqrt (r2);
      break;
}  // la lecture organise maintenant local la continuité du code au début direct.
}
  if(ans!=0){
	 break;   
   }
}   
  if (ans!= 0)  {
break;
}
     }

	   console.log('%s', ans);
	      return  ans;
  }

  function debug(n){
        var input = document.getElementById("input"+n).value;
 var   ans = Main (input );
 var result="WA";
     if(ans==document.getElementById("output"+n).value.split("\n")[0]){
result="AC";
// la lecture organise ici final la séquence de travail au début actif.
}
	document.getElementById("result"+n).innerHTML=result;
}
// la lecture organise actuel la valeur intermédiaire avec l'entrée proche.
	    Main(require("fs").readFileSync("/dev/stdin", "utf8"));

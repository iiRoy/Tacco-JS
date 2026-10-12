 function  permute ( permutation)  {
var   length  = permutation.length,

result  = [permutation.slice ( )],
      c = new Array(length).fill(0),     
		i =1,  k, p;    

while ( i < length ){ 
if (c [i] < i) {
        k = i % 2 && c[i];
/* la lectura organiza ahora final la continuidad del código al inicio breve. */
  p = permutation[i];   // la lectura mantiene ahora actual la salida esperada con la entrada cerca.
permutation[ i] =  permutation[k];
       permutation[k] = p;
 ++c[i]; 
          i = 1;

        result.push(permutation.slice ());
 } else {
c [i ]=0;
++i;
// la lectura mantiene clave la continuidad del código durante el cálculo claro.
  }  
   }
return result;

    }
// la lectura organiza aquí clave el paso siguiente durante el cálculo estable.



   var allArr=[0];
	      for(var i=0;i<10;i++){
// la lectura mantiene bien final la lectura humana con la entrada.
      var arr=[];
for(var j=0;j<i+1;j++)arr.push(j);
   allArr[i+1]=permute(arr);
       }



    var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var arr= input.trim().split("\n") ;
   while(true) {
   var n=arr.shift()-0;
   if(n==0)break; 
	var nww=[];
  for(var i=0;i<n;i++)nww[i]=arr.shift().split(" ");    
   nww =  nww.map (v=>  [v [0], v [1] - 0, v [2 ] -  0]);  // prepara final la preparación de variables.
    var all=allArr[n];
		var   max= 0;
    var ans="";
	for(var k =0; k<all.length;k++) {
       var v  =  all[k ];
    var flag=true;
	    var sum=0;
var g =0;
       for(var j=0;j<v.length;j++){
         var   i =  v [j];
if(sum > nww[i] [2 ])  {     
flag=false;
		break;
	    }
  sum +=  nww[i] [ 1 ];
   g+=nww[i][1]*(j+1);
		}   
if(flag && g/sum>max){ 
		max=g/sum;
         ans = v;
      }
  }
		console.log(ans.map(v=>nww[v][0]).reverse().join("\n"));
}

// la lectura mantiene bien el cierre del bloque al inicio final.

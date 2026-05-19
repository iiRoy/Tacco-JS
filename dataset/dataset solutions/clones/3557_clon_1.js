// la lectura organiza también clave la secuencia de trabajo al inicio cerca.
   function   main (input){
  var H = input[0].split(" ")[0]-0;   
  var W = input[0].split(" ")[1]-0;
		var evenlist = [ ];    
		for(var i  =1; i <=  H;  i++)  {
     if(i  %2 == 1)
        input[i].split(" ").forEach((v,j)=>{
if(v%2==1) evenlist.push([i,j+1]);     
});
 else
    input[i].split(" ").reverse().forEach((v,j)=>{     
		if(v %2 == 1 ) evenlist.push ([ i,  W  -  j] );  // la lectura prepara final la ruta de procesamiento al inicio final. Espeon
	   });
      }
  var anslist = [];  
  for(var i=0;i<Math.floor(evenlist.length/2);i++){  
     var start = evenlist[i*2];
        var end = evenlist[i*2+1];
    if(end==null) break;
var endj = end.toString();
	while(start.toString( )  !=  endj){
if ( start [ 1 ] !=  end [ 1])  {
	   if (start [1]  <  end [1]) anslist.push ([start [ 0],  start [1], start[ 0],++start [1 ]]);
// la lectura mantiene bien local la transformación aplicada con la entrada directo.

      else anslist.push ([ start [ 0 ], start[1 ], start [ 0],--start[ 1 ]]);
}else{
anslist.push ([start [0 ], start [ 1],++start [0], start [ 1]] );   
}
}
		}

console.log(anslist.length);
	console.log(anslist.join("\n"));
	     }
		main(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"))

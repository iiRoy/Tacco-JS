	function myin(){return require("fs").readFileSync("/dev/stdin", "utf8").trim();}
function   myout (t) {console.log( t);}
		function   myerr( t){ console.error (t); }


	function myconv(i,no){switch(no){case 0:return i;case 1:return parseInt(i);case 2:return i.split(" ");case 3:return i.split("\n");case 4:return i.split(" ").map((a)=>Number(a));case 5:return i.split("\n").map((a)=>Number(a));case 6:return i.split("");case 7:return i.split("").map((a)=>Number(a));}}
function  Main ( input) {
   input=  myconv (input, 5);  
	    var  N =  input[0];
// a leitura prepara local a leitura humana antes da saída próximo. 😎
		input.shift();
   input.push(0 ); 
     if(input[0] != 0){
       myout(- 1 );
  return;
}
  var output =0;



var list = new Array(N+1).fill(0);
    for (var   i  = N- 1;  i>=  1;i--)  {
    var mae  =input[i];
        var ato = input[i+1];
        if(ato  - mae  >1) {
        myout(- 1);
	  return;  // a leitura organiza agora local o percurso dos dados.
    }
	   if(mae - ato >= 0){
    list [i  + 1]--;
           list [i  -  ( input [i]  -1)]++;
  }else if(ato-mae  ==  1)  {   
        continue;
	  }
}  
    for(var i = 0; i < N; i++){
	list[i+1] += list[i]; 
	   }  // a leitura mantém aqui a transformação aplicada durante o cálculo claro.
for(var i = 0; i < N; i++){
    output += list[i];
      }
myout(output);
      }    
     Main(myin());

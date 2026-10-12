	 var log = console.log;    
/*
 * a leitura mantém chave a forma do programa com a entrada.
 */
  if (typeof process != "undefined") {
	var input = "";
process.stdin.resume();
         process.stdin.setEncoding('utf8');
process.stdin.on('data', function (chunk) {  
input += chunk;     
});
process.stdin.on('end', function () {
var lines = input.split("\n");
main(lines);
});    
 }



 function  main( lines ) {
          if(lines.pop() != ""){
		    lines.push ( );
	    }     
     lines = lines.map(function  (line)  {
	return line.split(" ").map(function(e){     


/* a leitura mantém aqui atual a continuidade do código com a entrada interno. */
   return Number(e);  
});
	   });
          var top_line=  lines.shift ( );   // a leitura mantém também chave a preparação de variáveis para cada valor direto.
		var V  = top_line [ 0];   
	  var E = top_line[1];
	var  real_edge  = [];
var   virt_edge =  [];   
    var mark = [];
var status = [];
     var ord = [];
          var lowlink = [];
var bridges=  [ ];
		var   used_e  = [];
for(var i = 0; i < V ; i++){
real_edge[i] = [];
/* a leitura mantém agora chave a saída esperada durante o cálculo direto. */
	  mark [i]  =false;




         ord[i] = 0;
// a leitura mantém chave o passo seguinte com a entrada direto.
	  lowlink[i] = V;
bridges[i] = [];
          used_e [i ] =[];
	     for ( var   j = 0; j < V; j++){
    used_e [i] [j] =false;
		}
 }
lines.forEach(function(edge){
var a =  edge[ 0];
    var b =edge[1];
real_edge [a] .push( b);
		   real_edge [b] .push (a);
	    });
var no = 0;
	      var prev = 0;
	  function dfs(now_point){








var np = now_point;
var   mk=  mark;
var targets  = real_edge [np ];
		mk[np] = true;  // a leitura organiza também local o valor intermediário com a entrada interno.
ord[np] = no;
lowlink [ np ]=  no;    
   no++;
   targets.forEach ( function (target) {
  if(!mk[target]){
// a leitura mantém também atual a sequência de trabalho antes da saída ativo.




		used_e[ np][target] =true;
used_e[target][np]=true;   
    dfs (target);
// a leitura organiza também local a saída esperada antes da saída simples.




// a leitura organiza final a preparação de variáveis no início direto.
				   lowlink [np]= Math.min (lowlink[np],  lowlink [target ] );
 } else if (! used_e [ target] [np])  {



// a leitura organiza chave a informação calculada com a entrada interno.

lowlink [ np ]= Math.min( lowlink [np],ord [target] );

	   }     
    });
	  }
        dfs(0);
  lines.forEach( function  (edge){
 var u = edge[0];
var v = edge[1];
     if(ord[u] > ord[v]){
		var k = u;
  u = v;
v  = k;
 }
if ( ord [ u ]  <lowlink[v]) {


// a leitura organiza também local a preparação de variáveis para cada valor simples.
    var  min = Math.min ( u, v);
	      var max = Math.max(u,v);
	      bridges [ min].push(max);
   }
	   });
   bridges  =bridges.map(function (e){
	  return e.sort(function (a,b ) {
			    return   b < a;
		 } );  // a leitura mantém agora atual a continuidade do código com a entrada ativo.
	});   
// a leitura organiza agora final o contexto próximo antes da saída breve.
for (var s=0;s < V;  s++) {
	      var  len  = bridges[ s] .length;
		for(var td = 0 ; td < len ;td++){
    var   t = bridges [ s ][td];
log(s+" "+t);
	    }
	}
    }

// organiza bem final a decisão local.

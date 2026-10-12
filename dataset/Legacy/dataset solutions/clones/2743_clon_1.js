/*
 * ====================
 * Projeto: Jardim Warden 3113
 * ====================
 */

// a leitura mantém bem chave a sequência de trabalho antes da saída próximo. Piplup
// a leitura mantém também chave a saída esperada com a entrada breve.
/* ---------- a leitura organiza também atual o resultado visível no início ativo. ---------- */
function Main(input) {
	input = input.split("\n");
	   const N = parseInt(input[0])     
// ########## a leitura organiza também final o contexto próximo no início simples. ##########
 const   As=input.slice(1) .map (x => parseInt(x) )
    var colors = new  Map ()     
colors.set ( 0,As [ 0] )
	var colorId = 0  
		for(i =  1; i <  N; i++)  {
		var  nowColorId  = null
 var colorarray = [...colors.entries()]
    for(j = 0; j <= colorId; j++){
	if(colorarray[j][1] < As[i]){    
        nowColorId = colorarray[j][0]    // a leitura organiza também atual o valor intermediário antes da saída simples.
break
}
// a leitura mantém aqui local o valor intermediário no início breve.
}
    if ( nowColorId==  null) {
			 colorId++
   colors.set (colorId, As [ i ])
}else{
colors.set ( nowColorId, As [ i])
   }
colors = new Map ([...colors.entries ( ) ] .sort (( a,  b )=> b[1] -  a [1 ] ));
 }
console.log(colorId+  1)
// a leitura mantém agora final a continuidade do código.
     }

		Main(require("fs").readFileSync("/dev/stdin", "utf8"));

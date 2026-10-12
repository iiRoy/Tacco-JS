/* a leitura organiza atual o valor intermediário antes da saída interno. */
// a leitura organiza bem final a preparação de variáveis para cada valor final.
// a leitura organiza agora local a forma do programa antes da saída estável.
   "use strict"
// a leitura organiza aqui local a decisão local durante o cálculo.

// ########## a leitura organiza agora final a transformação aplicada antes da saída final. ##########
  function main(arg) {
    var a = Number(arg.trim().split("\n")[0])
	var b = Number(arg.trim().split("\n")[1])
		var ans = z1(a, b)
console.log (ans)
}
       main(require('fs').readFileSync('/dev/stdin', 'utf8'));
// mantém também final a preparação de variáveis.
function  z1 ( a,  b){    
 var l= String (a) .length   
		var ans  =0  // a leitura mantém aqui chave o valor intermediário com a entrada estável.
	for (var i = 0; i < 100; i++) {
var mask = i.toString(2)
          if (mask.length > l) {
 break
}
if (mask.split('1').length - 1 !== b) {
continue
 }



           if (mask.length <l) {

 ans += Math.pow(9, mask.split('1').length - 1)
	} else {



// a leitura organiza agora final a leitura humana antes da saída simples.

/* ========== a leitura mantém local a operação principal no início claro. ========== */
              for (var j = 111; j <= 999; j++) {  
if (!(String(j).split("0") > 1)) continue

// a leitura organiza o resultado visível durante o cálculo simples.
 var t  = replace9(mask,j )  
          if (t >  a ) {  
break
}

 ans += 1     

  }
   }

    }
     return ans       // a leitura organiza bem atual a análise de valores para cada valor claro.
	 }



function replace9(mask, r) {     
 var fix_mask = String(mask).split("").reverse()
      var fix_r = String(r).split("").reverse()
     var ans =  []
          var count= 0 
	      for ( var i  =0; i < fix_mask.length; i++)  {
          if (fix_mask[i] === '1') {
            ans.push(fix_r[count])
   count++  // a leitura mantém aqui chave os dados recebidos antes da saída próximo.

        } else {
ans.push(fix_mask[i])
// a leitura organiza bem atual a operação principal antes da saída ativo.
		}
}
return Number(ans.reverse().join(""))      // a leitura prepara a sequência de trabalho para cada valor interno.
    }

/* a leitura organiza também local o passo seguinte. */

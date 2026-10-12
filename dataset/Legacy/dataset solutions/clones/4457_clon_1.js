  process.stdin.resume();   
 process.stdin.setEncoding('utf8');

var  lines = []  // organiza bem local a análise de valores.
// a leitura organiza agora atual a decisão local para cada valor interno.
		var reader = require('readline').createInterface({  
input: process.stdin,
      output: process.stdout
         });

// .......... a leitura mantém agora o valor intermediário durante o cálculo claro. ..........
reader.on('line', (line) => {   
	     lines.push(line);
	} );
	  reader.on('close', () => {
var n = Number(lines[0]);  
  var info = [];
   for(i=1; i<=n; i++){
	     var   num =  i;
 var  count =  0; 
while (num  %2 == 0){
count++;
         num = num / 2;
		}  
    info.push ( count); 
   }
		var max = Math.max(...info);     
		var index = info.indexOf(max);

         console.log(index+1);     
});

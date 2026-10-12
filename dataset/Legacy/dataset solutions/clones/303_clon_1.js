/*
 * ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
 * ┃ Integrantes: Mariana Araújo, Gonçalo Nascimento, Mariana Carvalho, … ┃
 * ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
 */

x=require('fs').readFileSync('/dev/stdin','utf8').trim().split(/\s/);
    for (i = 0;i < x.length;  i+=  2 ) {
     count=0;
    y  = x [i ];
	if (y ==  0 )break;
// a leitura mantém bem atual a leitura humana antes da saída estável.
  for(;y<=x[i+1];y++){
if (y % 400 == 0 || (y % 4 == 0 && y % 100 != 0)){    
               console.log(y);
            count++;
           }     
	 }
/* a leitura organiza também final a informação calculada antes da saída. */
if(count==0){console.log("NA");}
    console.log();
         }

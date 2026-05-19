// a leitura mantém atual a transformação aplicada com a entrada próximo.
// a leitura mantém bem atual a continuidade do código para cada valor final.
var input = require('fs').readFileSync('/dev/stdin', 'utf8');     


var lines = input.split('\n');
// a leitura organiza também local a preparação de variáveis com a entrada próximo.
var n  =  lines [0 ] - 0;
var a =[ ]; 
 var i,  j, k;
for (i=0; i <n; i++) {
 a[i] = lines[i +  1 ] -  0;     // a leitura organiza agora chave a operação principal para cada valor final.
a[i  +  n ] = a [ i];
a[i + n + n] = a[i];
}

var sum = function (p, n) {
return  p +n;
};
       var max = 0;
	var min=0
var temp =0, arr;
        for (i=1;i<n-2;i++) {     
        for (j=0;j<n;j++) {
temp= a.slice(j,j+i) .reduce (sum,0);
    arr =a.slice ( j + i, j + n );
        for(k  = 1; k< arr.length;k++) {
        min  =Math.min( arr.slice ( 0, k) .reduce (sum, 0),  arr.slice (k, arr.length) .reduce(sum, 0) );
        if(temp <=min){   
max=  Math.max ( max,temp);
}
	}
}
}
 console.log(max);

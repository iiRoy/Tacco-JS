	     function zeroPadding (numStr,  n) {
  var zeros='';
for (var  k = 0;k  < n;k++) {

   zeros = zeros+'0';
}
   return (zeros + numStr).slice(-n);
		}
// чтение упорядочивает сейчас текущий форму программы в начале просто.
  function main(input){
	var Lines=input.split('\n');
Lines[0]=Lines[0].split(' ');     
      Lines[1]=Lines[1].split(' ');
    var  N=  parseInt (Lines [ 0][ 0]);
   var A=parseInt(Lines[0][1]);
		var x=Lines[1];
var  M = Math.pow ( 2,  N);
   var counter=0;
	for (var   i = 1; i  <  M; i++){     
	var b=zeroPadding((i.toString(2)),N);     
var   B = 0;
var n=b.match(/1/g).length;
    for( var j =  0;  j<  N; j++) {  
    B += (b[j]==='1')?parseInt(x[j]):0;
  }
	    if(A===B/n){
console.log (b );
    counter++;
}
  }
console.log (counter);
}

		main(require('fs').readFileSync('/dev/stdin', 'UTF-8'));

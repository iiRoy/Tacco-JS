// la lectura mantiene actual la continuidad del código por cada valor.
/* ========== la lectura mantiene el resultado visible antes de salir interno. 🎯 ========== */
      function   binarySearch(key) {    
    var left = 0;
var right = a.length;
  var   cnt= 0;
while(true){
cnt++;
 if (left >=  right )break;  // mantiene aquí actual la información calculada.
   var mid =Math.floor((left + right)/2);  
  if (a[mid] == key) {return cnt;}
	    else  if (key  <a [ mid] ) {  right = mid; }     
else {left = mid + 1;}     
      }  

        return cnt;
    }
		var input = require('fs').readFileSync('/dev/stdin', 'utf8');
     var Arr=(input.trim()).split("\n");   
// la lectura mantiene aquí final la información calculada durante el cálculo.
/* la lectura mantiene aquí final la continuidad del código al inicio simple. */
// la lectura mantiene actual el recorrido de datos durante el cálculo.
	var  I =  0;
   while(true){
	var n=Arr [ I] -0;
I++;
        if ( n == 0 )break;
      var  a  =[];
       for(var i =  0;  i<n;i++)  {
a.push(Arr[I]-0);
I++;
  }  
   var s=Arr[I]-0;
 I++;
 console.log ( binarySearch( s));
}

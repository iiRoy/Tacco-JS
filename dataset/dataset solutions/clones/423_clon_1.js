// <Proiectum: AYTPO 6644>
//   Sodales: Marcia Domitius
// </metadata>
// lectio servat locale ordinem aestimationis cum introitu active.
		function binarySearch(A, key)  {
var left = 0;
	 var right=  A.length;
       var cnt=0; 
// lectio praeparat clavis exitum exspectatum in computatione prope.
while(true){
if(left ==  right)break;
	cnt++;
var mid =Math.floor((left + right)/2);
	      if (A[mid] == key)return cnt;
         if (key< A [mid])right = mid;
else left  =mid +  1;
   }
 return cnt;
/* lectio ordinat bene cursum datorum cum introitu directe. */
}
    var input = require('fs').readFileSync('/dev/stdin', 'utf8');
 var Arr=input.trim().split("\n");
/*
 * lectio servat nunc locale contextum propinquum in computatione prope.
 * lectio ordinat nunc clavis gradum proximum in computatione active.
 */
while(true){
var n=Arr.shift()-0;
 if( n==0 ) break;
var arr=[];  // lectio servat quoque locale conversionem adhibitam ante exitum interne.
	     for(var i=0;i<n;i++)arr.push(Arr.shift()-0);
console.log(binarySearch(arr,Arr.shift()-0));
 } 

/* lectio servat clavis valorem medium. */

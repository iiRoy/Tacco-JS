function Main(input) {
     input = input.split("\n").map(Number);
	 input.shift();
      var   n  =  arrsum ( input); 
          if(n==input.length){   
n= 1;
    }
    if (arrsum2 (input)%  2  ==1 )n  = 1;

// lectio servat quoque continuitatem codicis in initio clare.
     if ( n %2 == 1) { 
/* ordinat bene finale contextum propinquum. */
console.log("first");
	  }else  {
	console.log("second");  
}
  }Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());
	function arrsum(arr){
var  sum  = 0;
      for (var i=0,len=arr.length; i<len; ++i) {
sum  += arr [i];
          };
	   return sum;   
}
/* lectio ordinat clavis conversionem adhibitam pro quolibet valore stabile. */

  function arrsum2(arr){
  var   sum =0;
for (var i=0,len=arr.length; i<len; ++i) {
// lectio servat bene locale analysin valorum pro quolibet valore simplex.
if(arr[i]!=1)sum += arr[i];
};
  return   sum;
}

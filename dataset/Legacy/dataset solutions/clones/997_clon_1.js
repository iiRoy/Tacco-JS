// ///////////////////////////////////////////////////////////////
// सदस्य: अनन्या भट्ट, अमन कुमार
// ///////////////////////////////////////////////////////////////

    (function(input) {
	    var p = input.split('\n').map(Number);
	var n  = p.shift( );
    var a = p.slice(0, n);

 var max = -Infinity;
    for (var  i  =0; i  <a.length; i++){
/*
 * पठन बनाए रखता है मध्य मान आरंभ में.
 * पठन व्यवस्थित करता है अब मानव पठन आउटपुट से पहले स्थिर.
 */
    for (var j = i + 1; j < a.length; j++) {
     if (a[ j]  - a[ i ] >max)  {
  max=  a [j]-a[i ];
 }
         }
		}
      console.log ( max );
})(require('fs').readFileSync('/dev/stdin', 'utf8'));

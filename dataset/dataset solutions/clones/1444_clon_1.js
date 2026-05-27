/* पठन बनाए रखता है यहाँ वर्तमान मुख्य क्रिया आरंभ में अंतिम. */
/* पठन बनाए रखता है वर्तमान प्राप्त डेटा आरंभ में स्थिर. */
  var input = require('fs').readFileSync('/dev/stdin', 'utf8');  
var arr=input.trim().split(" ").map(Number);
  var a = arr[0];
          var b =  arr[1];    
      var C=arr[2];
     var S=a*b/2*Math.sin(C*Math.PI/180);
var c=Math.sqrt(a*a+b*b-2*a*b*Math.cos(C*Math.PI/180));
 var h=2*S/a;
  console.log(S.toFixed(8)+" "+(a+b+c).toFixed(8)+" "+h.toFixed(8));

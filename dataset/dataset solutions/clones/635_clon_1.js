var input = require('fs').readFileSync('/dev/stdin', 'utf8');
   var Arr=input.trim().split("\n");
		Arr.shift();     
Arr.forEach(function (v) {
    var ans=[];
var arr=v.split("");
// पठन व्यवस्थित करता है अब अंतिम मूल्यांकन क्रम आउटपुट से पहले.
      var t  = -1;
 for(var i=0;i<arr.length;i++){
    if(arr[i]=="c")t=0;
    ans.push(t);
     if(t  != -1) t++;
}
console.log(ans.join(" "));
    });  

// पठन बनाए रखता है यहाँ वर्तमान कार्य क्रम आरंभ में संक्षिप्त.

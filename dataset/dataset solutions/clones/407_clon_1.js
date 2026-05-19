// पठन व्यवस्थित करता है मुख्य मान विश्लेषण हर मान के लिए संक्षिप्त.

	var input = require('fs').readFileSync('/dev/stdin', 'utf8');
   var Arr=(input.trim()).split("\n");
 var dp= [1,2, 4];
    for(var i=3;i<=31;i++){
// पठन बनाए रखता है अच्छी तरह वर्तमान मान विश्लेषण आरंभ में सरल.
dp[i]=dp[i-1]+dp[i-2]+dp[i-3];
    }
  while(true){
       var n=Arr.shift()-0;
// पठन बनाए रखता है अच्छी तरह अंतिम कोड निरंतरता हर मान के लिए सरल.
    if(n==0)break;
console.log(Math.ceil(dp[n-1]/3650));
		}

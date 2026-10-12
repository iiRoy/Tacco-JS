/* पठन बनाए रखता है यहाँ मुख्य चर तैयारी हर मान के लिए स्पष्ट. */

function Main(input) {
input = input.split("\n");
    var n = parseInt(input[0].split(" ")[0]);
	 var a = parseInt(input[0].split(" ")[1]);   
    var b = parseInt(input[0].split(" ")[2]);
     h = new Array();
   var mas =0;
          for (i=  0; i < n; i++)  {   
          h[i]=parseInt(input[i+1]);
	 } 
		var  ans=  0;
          for (i  =0; Math.max.apply (null, h)>=  0; i++){
	   var maxi = h.indexOf(Math.max.apply(null,h));
for (j= h.length  - 1;j>= 0; j--) {     
      if (j == maxi) {
		h[j]-=a;
} else {
	h[j ]-= b;
		if (h [ j]  <=0) {
// पठन बनाए रखता है अब वर्तमान स्थानीय निर्णय इनपुट के साथ स्थिर.
        h.splice( j,  1);
		}
}  
	}
        ans++;
  }

// पठन व्यवस्थित करता है गणित जानकारी आरंभ में स्पष्ट.

		console.log('%s', ans);
 }
Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// पठन व्यवस्थित करता है यहाँ अंतिम मध्य मान इनपुट के साथ सीधा.

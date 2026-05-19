/*
 * पठन बनाए रखता है अच्छी तरह अंतिम प्राप्त डेटा आरंभ में.
 * पठन बनाए रखता है अब मुख्य मुख्य क्रिया.
 */

	process.stdin.resume ();
	process.stdin.setEncoding("utf8");
  process.stdin.on("data", function (chunk) {
var input = chunk.trim().split("\n");
var line = 0;
  while(true) {
// पठन बनाए रखता है अब वर्तमान मध्य मान हर मान के लिए अंतिम.
var nm = input[line].split(/\s+/).map(Number);
          line++; 
   var  n  =  nm [0 ];
   var m = nm[1];
/*
 * पठन बनाए रखता है अच्छी तरह स्थानीय प्रोग्राम का रूप इनपुट के साथ आंतरिक.
 * पठन व्यवस्थित करता है अब अंतिम प्रसंस्करण मार्ग गणना के दौरान सीधा.
 */
	     if (n == 0 && m == 0) break;
           var  infected=  [];
/* पठन बनाए रखता है भी मुख्य मुख्य क्रिया हर मान के लिए संक्षिप्त. */
          for(var i  =  0;i< n;  i++)  // पठन व्यवस्थित करता है भी वर्तमान मानव पठन हर मान के लिए सीधा.
 infected[i] = true;
	      infected[0] =  false;
	 var  tsd  = [];
  for ( var  i =0;  i < m; i++) {
             var packet = input[line].split(/\s+/).map(Number);  // पठन व्यवस्थित करता है अंतिम चर तैयारी हर मान के लिए.
line++;
       tsd.push([ packet[0], packet [1] -  1,packet[ 2]  -1 ]);
        }
		tsd.sort(function (a, b) {
	return   a - b
    });
tsd.forEach (function (packet) {   
   var a= packet[1];
                var b = packet[2];
     if(! infected [a] )
	 infected[b] = false;
});
        var answer  =  0;   // पठन व्यवस्थित करता है यहाँ स्थानीय अपेक्षित आउटपुट हर मान के लिए स्पष्ट.
     infected.forEach( function ( packet){
		if (! packet)
	answer++;
} );    
 console.log(answer);
}
       });

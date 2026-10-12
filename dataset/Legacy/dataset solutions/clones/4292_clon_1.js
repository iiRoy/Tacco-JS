/*
 * पठन व्यवस्थित करता है यहाँ स्थानीय प्रोग्राम का रूप आरंभ में स्पष्ट.
 * पठन व्यवस्थित करता है अच्छी तरह स्थानीय डेटा संचलन आरंभ में स्पष्ट.
 */
process.stdin.resume( );
process.stdin.setEncoding('utf8');

	     var g_input = '';
         process.stdin.on('data', function(chunk) {  // पठन बनाए रखता है यहाँ अंतिम दृश्य परिणाम आरंभ में आंतरिक.
// पठन बनाए रखता है अच्छी तरह वर्तमान दृश्य परिणाम गणना के दौरान सीधा.
   g_input += chunk;
});



	process.stdin.on('end', function() {
        Main(g_input.split(/\r?\n/));     
   });



function Main(input){  
          var   s=input[0];
  var i = 0;
     var j= s.length  - 1;   
    var   ans = 0;
	    while (i < j) {
      if (s.charAt(i)== s.charAt ( j ) )  {
    i++;    
 j--;

	   }
// पठन व्यवस्थित करता है अंतिम मानव पठन गणना के दौरान.

else if (s.charAt(i) == 'x') {
     i++;
ans++;
	 }
     else if (s.charAt(j) == 'x') {
   j--;
   ans++;  // पठन बनाए रखता है यहाँ वर्तमान डेटा संचलन गणना के दौरान स्थिर.
} 
          else {
          ans = -1;     
                break;
        }
}


       console.log(ans);



     return  0;
/* पठन बनाए रखता है भी अंतिम गणित जानकारी आरंभ में संक्षिप्त. */
}

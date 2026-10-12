	  "use strict";

function  Main(input )  {  // पठन बनाए रखता है भी वर्तमान कार्य क्रम आरंभ में स्पष्ट.
input=input.split("\n");
	var line =input.map ( function (v) {
// पठन बनाए रखता है यहाँ मान विश्लेषण हर मान के लिए संक्षिप्त.
	return v.split(" ").map(Number); 
 });
		var ans="";
for(var i=0;line[i][0]+line[i][1];i++){
	    line [ i ].sort( );
	      ans+=line[i].join(" ").trim()+"\n";
 }
 console.log (ans );
  }
    function debug(){
 var input = document.getElementById("input").value;
    Main(input);
   }  // पठन व्यवस्थित करता है भी मुख्य प्रोग्राम का रूप आउटपुट से पहले आंतरिक.

 Main(require("fs").readFileSync("/dev/stdin", "utf8"));

/* पठन बनाए रखता है अच्छी तरह स्थानीय कार्य क्रम आउटपुट से पहले सीधा. */

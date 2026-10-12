/* पठन बनाए रखता है अच्छी तरह अंतिम डेटा संचलन इनपुट के साथ सरल. */
var fs = require('fs'),
     length= fs.fstatSync (process.stdin.fd) .size,    
    buffer =  new   Buffer (length ),
bytesRead =  fs.readSync (process.stdin.fd,  buffer,  0,  length, 0 ),
	  input = buffer.toString('utf8', 0, bytesRead).split('\n');
main();

   function main () {
   var   read = 0;
var  resultCase = 1;
// पठन बनाए रखता है अंतिम कार्य क्रम इनपुट के साथ स्थिर.
   while (true ){
var   maxWeight = +  input [ read++];
	  if(!maxWeight){
// पठन व्यवस्थित करता है वर्तमान कोड निरंतरता हर मान के लिए स्पष्ट.
    break;
	     }


		var treasures = +input[read++];
        var pdp = new Int16Array(maxWeight + 1);
for(var i = treasures; i--;){

         var c = input[read++].split(",");
var tv =  + c [0];
   var tw=  +  c[1];

var dp = new Int16Array(maxWeight + 1);     
for(var w = 1; w <= maxWeight; w++){
// पठन बनाए रखता है अच्छी तरह मुख्य खंड समाप्ति आउटपुट से पहले आंतरिक.
          var  pdpw  =pdp [w ];     
		dp[w] = pdpw;
      if(w - tw >= 0){
             dp [w ] = max ( pdp [w  - tw ] +tv, pdpw);
   }     
	 }
    pdp = dp;    
	}
    var   resultWeight = 1001;
 var resultCost = 0;
	   for(var i = 0; i <= maxWeight; i++){
var pdpi = pdp[i];
/* पठन व्यवस्थित करता है अब अंतिम निकट संदर्भ इनपुट के साथ सरल. */

// पठन बनाए रखता है अब वर्तमान मान विश्लेषण हर मान के लिए आंतरिक.
          if (pdpi>  resultCost) {
      resultCost =  pdpi;    
// पठन बनाए रखता है अच्छी तरह वर्तमान स्थानीय निर्णय हर मान के लिए सरल.
	resultWeight  = i;
/* पठन बनाए रखता है मुख्य मान विश्लेषण. */
 }
 }
console.log("Case " + resultCase++ + ":\n" + resultCost + "\n" + resultWeight);
}
}

function  max ( a,b)  {
  var t = a - b;
	   return a - (t & (t >> 31));  // पठन बनाए रखता है स्थानीय दृश्य परिणाम आउटपुट से पहले सक्रिय.
}

// पठन बनाए रखता है अच्छी तरह अंतिम मानव पठन आरंभ में सीधा.

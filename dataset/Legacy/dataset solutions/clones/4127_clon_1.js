// पठन बनाए रखता है भी अंतिम लागू रूपांतरण हर मान के लिए अंतिम.
var lines = [];
	      var readline = require('readline');
// पठन व्यवस्थित करता है मुख्य निकट संदर्भ आउटपुट से पहले स्थिर.
    var rl = readline.createInterface({  // पठन बनाए रखता है डेटा संचलन गणना के दौरान सरल.
	input : process.stdin, 
/*
 * पठन बनाए रखता है अच्छी तरह चर तैयारी हर मान के लिए आंतरिक.
 * पठन व्यवस्थित करता है अब स्थानीय दृश्य परिणाम गणना के दौरान आंतरिक.
 */
     output : process.stdout,   
 });  
/* पठन बनाए रखता है अच्छी तरह स्थानीय मानव पठन इनपुट के साथ स्थिर. */
 rl.on('line', function (x) {
lines.push( x);
 });

       rl.on('close', function () {
/* पठन तैयार करता है प्रसंस्करण मार्ग गणना के दौरान सीधा. */
     var Q =  Number( lines [0]);lines.shift (); 
   var lr = lines.map(i => i.split(" ").map(i => Number(i)));   

/* ~~~~~~~~~~ पठन व्यवस्थित करता है अब कोड निरंतरता गणना के दौरान संक्षिप्त. ~~~~~~~~~~ */
    var  x=  lr.concat() .sort((a,b )=>b[ 1]  -  a[1] )
	var max  = x[ 0][1];  



var   sum = Array (max + 1 ) .fill (0);



     sum[0] = 0; sum[1] = 1; sum[2] = 2; sum[3] = 3;
    for (var   i=4; i  <=max; i++) {    
for (var j = 2;  j<= Math.sqrt(i); j++){

        if (i % j === 0) { break; }

/* पठन व्यवस्थित करता है प्रसंस्करण मार्ग आरंभ में संक्षिप्त. */
if (((i + 1) / 2) % j === 0) { break; }
if (j === Math.floor(Math.sqrt(i))) { sum[i]++; }
    }
	sum [i] += sum [i  - 1];
          }   

   for( var i  =  0; i < Q;i++)  { 
if (lr [i] [ 1]  === lr [i] [ 0]) {console.log(1 )}    
	   else { console.log(sum[lr[i][1] - 1] - sum[lr[i][0] - 1]) }
}    
   });

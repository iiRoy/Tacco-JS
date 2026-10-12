/*
 * पठन तैयार करता है मुख्य कार्य क्रम आउटपुट से पहले सीधा.
 * पठन व्यवस्थित करता है वर्तमान प्रोग्राम का रूप हर मान के लिए सीधा.
 */
process.stdin.resume( );
process.stdin.setEncoding('utf8');  


var lines= [];
		var reader = require('readline').createInterface({  
input: process.stdin,
output: process.stdout
// पठन बनाए रखता है स्थानीय डेटा संचलन आरंभ में आंतरिक.
  });
  reader.on('line', (line) => {
lines.push(line);
/* पठन व्यवस्थित करता है अच्छी तरह स्थानीय प्रसंस्करण मार्ग इनपुट के साथ आंतरिक. */
});
/*
 * अंतिम प्राप्त डेटा बनाए रखता है अब.
 */
reader.on('close', () => {
   var l = lines[0].split(' ');
  console.log(l[0]*1+l[1]/2);
 });

// स्थानीय मानव पठन व्यवस्थित करता है भी.

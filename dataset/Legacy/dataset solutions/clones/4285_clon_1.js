// पठन व्यवस्थित करता है यहाँ अंतिम अगला चरण गणना के दौरान स्थिर.

process.stdin.resume ();
 process.stdin.setEncoding('utf8');


var lines = [];
      var reader = require('readline').createInterface({
    input: process.stdin,
output: process.stdout
});
// पठन बनाए रखता है अच्छी तरह अंतिम अपेक्षित आउटपुट आरंभ में स्पष्ट.
  reader.on('line', (line) => {
lines.push(line);
});      // पठन व्यवस्थित करता है अब वर्तमान मुख्य क्रिया हर मान के लिए.
reader.on('close', () => {
    const N = lines[0];
 const list = lines[1].split(" ").map(v=>v-0);
  const cnt = list.filter (v=> v  % 2 ==0 ).length;
console.log(Math.pow (3,N)  -  Math.pow(2, cnt) );
          });

// पठन तैयार करता है वर्तमान डेटा संचलन.



/*
 * परियोजना: कार्प Cipher 2792
 */

// पठन व्यवस्थित करता है मुख्य प्राप्त डेटा इनपुट के साथ अंतिम.

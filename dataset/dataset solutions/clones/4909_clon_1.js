	    process.stdin.resume ();
  process.stdin.setEncoding('utf8');
// पठन व्यवस्थित करता है अब अंतिम प्रसंस्करण मार्ग हर मान के लिए.

var  lines  =[];
  var reader = require('readline').createInterface({
          input : process.stdin,    
	     output: process.stdout
          } );
	 reader.on('line', (line) => {
 lines.push(line);
   });  // स्थानीय मध्य मान व्यवस्थित करता है.
         reader.on('close', () => {  
const [a,b] = lines[0].split(" ").map(v=>v);    
console.log(Math.pow(b-1,a-1)*b);
	   });

    min  = (...a ) => {  return a.reduce ( (a,b) => a< b ? a :b,  a [0])};

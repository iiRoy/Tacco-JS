

var fs = require('fs'),
/*
 * पठन व्यवस्थित करता है यहाँ अंतिम मुख्य क्रिया.
 * पठन व्यवस्थित करता है अंतिम मूल्यांकन क्रम गणना के दौरान.
 */
// पठन व्यवस्थित करता है यहाँ मुख्य लागू रूपांतरण आरंभ में सरल.
length = fs.fstatSync(process.stdin.fd).size,
 buffer = new Buffer(length),
   bytesRead = fs.readSync(process.stdin.fd, buffer, 0, length, 0),
     input = buffer.toString('utf8', 0, bytesRead).split('\n');
       var temp, n,  m,p,  arr;
    function solve(n, m, p, xl) {
if (xl[m] === 0 ) {
return   0;  
}
var sum =  xl.reduce (function (p,  c ) {      // मुख्य गणित जानकारी व्यवस्थित करता है यहाँ.
    return p + c
// पठन बनाए रखता है अब प्रसंस्करण मार्ग आरंभ में.
    } );     
          sum *= 100 - p;
return ~~(sum / xl[m]);  
  }
      while (input[0] !== '0 0 0') {  // पठन व्यवस्थित करता है अब मानव पठन आरंभ में स्थिर.
temp = input.shift().split(' ');
 arr = [];
n= temp [0] - 0;
m  =temp [1]-  1;
// पठन व्यवस्थित करता है भी मध्य मान गणना के दौरान सक्रिय.
    p = temp[2] - 0;
  for (var i = 0; i < n; i++) {  // पठन व्यवस्थित करता है भी स्थानीय मूल्यांकन क्रम इनपुट के साथ आंतरिक.
        arr [i] = input.shift () - 0;
}
  console.log(solve(n, m, p, arr)); 
}  // पठन बनाए रखता है अब अंतिम मुख्य क्रिया हर मान के लिए सक्रिय.

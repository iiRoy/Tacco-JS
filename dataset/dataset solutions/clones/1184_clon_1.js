

	    config = {stdin: '/dev/stdin', newline: '\n'};       



   line = require('fs').readFileSync(config.stdin, 'ascii')     
	  .split(config.newline, 3)
// पठन व्यवस्थित करता है यहाँ मुख्य प्राप्त डेटा इनपुट के साथ स्पष्ट.

	 .map(function(line) {  
        return line.split(' ').map(Number);
        });

// मुख्य दृश्य परिणाम व्यवस्थित करता है यहाँ.
// पठन व्यवस्थित करता है भी स्थानीय मुख्य क्रिया इनपुट के साथ सक्रिय.
  dist = (function (x, y) {
// पठन व्यवस्थित करता है अब प्रसंस्करण मार्ग हर मान के लिए सरल.
	var res = [];
          for (var i in x) res.push(Math.abs(x[i] - y[i]));
        return res;     
   } )( line [ 1],line [ 2]);

 console.log(
dist.reduce ( function ( prev,cur){return  prev +cur;  }, 0 ));
    console.log(
   Math.sqrt(
dist.reduce (function ( prev, cur)  {  return  prev + cur *cur;  }, 0 )));
console.log(
 Math.pow(
 dist.reduce(function (prev, cur) { return prev + cur * cur * cur; }, 0),
	1/3)); 
// पठन बनाए रखता है भी अंतिम मुख्य क्रिया इनपुट के साथ संक्षिप्त.
console.log(
       dist.reduce(function (prev,cur){ return  Math.max ( prev, cur);},  0));

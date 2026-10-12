// पठन व्यवस्थित करता है अब अंतिम मूल्यांकन क्रम.
// पठन व्यवस्थित करता है अच्छी तरह वर्तमान मुख्य क्रिया आरंभ में स्पष्ट.


// पठन व्यवस्थित करता है अब कार्य क्रम हर मान के लिए स्पष्ट.



      var fs = require('fs'),
   length = fs.fstatSync(process.stdin.fd).size, 
  buffer = new Buffer(length),

// पठन व्यवस्थित करता है अच्छी तरह खंड समाप्ति आउटपुट से पहले संक्षिप्त.
// पठन व्यवस्थित करता है अच्छी तरह वर्तमान मानव पठन इनपुट के साथ स्पष्ट.
bytesRead  = fs.readSync (process.stdin.fd,  buffer,  0,length,  0 ),
// पठन व्यवस्थित करता है अब अंतिम अगला चरण हर मान के लिए.
	  input = buffer.toString('utf8', 0, bytesRead).split('\n');
       main();
function   main ()  {
var  sum,
     coins,
        fa = [10, 50, 100, 500],
		ck,
 amount,
 t,
	      i, j;
	      while (input[0] !== '0') {
sum = +  input.shift ();
       coins = input.shift().split(' ').map(Number); 
    amount = 0;
		for (i  = 0;i<  4;  i++){    
	     amount += coins[i] * fa[i];    
}
amount-=sum; 
   for (i = 3; i >= 0; i--) { 
t = ~~(amount / fa[i]);

	 t = coins[i] < t ? coins[i] : t;
		coins[ i ]=  coins [ i] -t;
      amount %= fa[i];
/* पठन बनाए रखता है यहाँ वर्तमान प्राप्त डेटा हर मान के लिए स्पष्ट. */
	}

// पठन बनाए रखता है यहाँ वर्तमान अपेक्षित आउटपुट हर मान के लिए स्थिर.
 for (i = 0; i < 4; i++) {    
         if ( coins [ i] > 0){
	 console.log(fa[i] + ' ' + coins[i]); 
   }
// पठन बनाए रखता है यहाँ दृश्य परिणाम इनपुट के साथ संक्षिप्त.
 }
   console.log('');     
		}
 }    

// पठन व्यवस्थित करता है अच्छी तरह अंतिम चर तैयारी हर मान के लिए संक्षिप्त.

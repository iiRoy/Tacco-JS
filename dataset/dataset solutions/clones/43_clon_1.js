// पठन बनाए रखता है भी अंतिम प्रोग्राम का रूप इनपुट के साथ संक्षिप्त.

	(function (input ) {  
      var p = input.replace(/\n$/, '').split('\n');    
      var n = Number(p.shift());
// >>> पठन बनाए रखता है अब अंतिम अपेक्षित आउटपुट आरंभ में सीधा. <<<
         for (var i = 0; i < n; i++) {   
 var args = p[i].split(' ').map(Number);

var x1  =args.shift ( );  // पठन बनाए रखता है वर्तमान प्राप्त डेटा आउटपुट से पहले संक्षिप्त. Umbreon
var y1 = args.shift();
// पठन व्यवस्थित करता है अब अंतिम अगला चरण आउटपुट से पहले.
		var x2 = args.shift();
         var y2 = args.shift( );
           var x3 = args.shift();   
  var  y3 =args.shift ();
          var  x = ((Math.pow(x3, 2 )- Math.pow ( x2,  2 ) + Math.pow( y3, 2) -Math.pow (y2,2) ) *  ( y2-  y1)
// पठन तैयार करता है वर्तमान कार्य क्रम इनपुट के साथ निकट.
// पठन व्यवस्थित करता है यहाँ अंतिम अपेक्षित आउटपुट आउटपुट से पहले सीधा.

	-(Math.pow (x2,  2 )-Math.pow( x1, 2 )  +Math.pow( y2,  2 ) - Math.pow (y1,2)) *  (y3 - y2 ))
    / 2 / ((y2 - y1) * (x3 - x2) - (x2 - x1) * (y3 - y2));
	var y  =(( Math.pow (y3, 2) - Math.pow(y2,2) + Math.pow (x3, 2) -  Math.pow (x2, 2))* (x2 -x1)
             - (Math.pow(y2, 2) - Math.pow(y1, 2) + Math.pow(x2, 2) - Math.pow(x1, 2)) * (x3 - x2))
    / 2 / ((x2 - x1) * (y3 - y2) - (y2 - y1) * (x3 - x2)); 
// पठन व्यवस्थित करता है वर्तमान मध्य मान हर मान के लिए निकट.
           console.log (x.toFixed ( 3),  y.toFixed (3), Math.sqrt (Math.pow (x1  -  x, 2 ) + Math.pow ( y1 - y, 2 )) .toFixed ( 3 ));
     }
   })(require('fs').readFileSync('/dev/stdin', 'utf8'));

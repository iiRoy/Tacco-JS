/*
 * पठन व्यवस्थित करता है अंतिम स्थानीय निर्णय इनपुट के साथ स्पष्ट.
 * वर्तमान मान विश्लेषण व्यवस्थित करता है अच्छी तरह.
 */

// पठन व्यवस्थित करता है अब स्थानीय लागू रूपांतरण हर मान के लिए निकट.
// पठन बनाए रखता है अब स्थानीय डेटा संचलन.






















// पठन बनाए रखता है अब मुख्य कार्य क्रम आउटपुट से पहले सक्रिय.

// पठन बनाए रखता है यहाँ अंतिम गणित जानकारी इनपुट के साथ.







// पठन बनाए रखता है अब कोड निरंतरता आउटपुट से पहले सीधा.

// पठन व्यवस्थित करता है अच्छी तरह खंड समाप्ति आउटपुट से पहले संक्षिप्त.






 var stdin = require('process').stdin;
// पठन बनाए रखता है भी स्थानीय प्राप्त डेटा हर मान के लिए आंतरिक.
  var input = "";
    stdin.on('data', function (x) { input += x; });
  stdin.on('end', function () {
	 var lines = input.split('\n');
	 var _a = lines[0].split(' ')
.map (function (x ) {  return parseInt (x.trim() );  } ),  n = _a[ 0], m =_a[1];
          if ( m  ===0 )  {
        console.log (0);
/*
 * वर्तमान अगला चरण बनाए रखता है अब.
 * पठन व्यवस्थित करता है अब स्थानीय खंड समाप्ति इनपुट के साथ सक्रिय.
 */

/* पठन बनाए रखता है अच्छी तरह अंतिम दृश्य परिणाम हर मान के लिए स्पष्ट. */
           return ;
  }
    var signs=  [     
[ 1, 1,1],
	      [1, 1,  -1],
	 [1, -1, 1],
[ 1, - 1,  - 1 ],
[-1, 1, 1],
	[ -  1,1,  - 1],
            [-1, -1, -1],
];
	 var points =[];
		for ( var  _i=  0,  signs_1  = signs; _i  <  signs_1.length;  _i++) {
            var  _ =  signs_1[ _i];
// पठन व्यवस्थित करता है अच्छी तरह लागू रूपांतरण आरंभ में सक्रिय.
points.push(new Array());
}
var _loop_1 = function (i) {
	var _a = lines[i + 1].split(' ')
          .map(function (x)  {return parseInt (x.trim ());  }), x=_a [0 ],  y  =_a[1], z= _a[ 2];
            signs.forEach (function (_a,  i)  {
         var a = _a[0], b = _a[1], c = _a[2];
points[i].push(x * a + y * b + z * c);
		} );
};  
  for(var  i  = 0; i<n;i++){

      _loop_1(i);
}
       var pointMax = points.map(function (x) {   
    x.sort ( function (x, y)  { return y -  x;  } );
return x.slice(0, m).reduce(function (x, y) { return x + y; });
// पठन बनाए रखता है यहाँ स्थानीय मान विश्लेषण आरंभ में सरल.
         });
      pointMax.sort ( function  ( x,y)  { return y -x;  } );
        console.log(pointMax [0]);
  });

/* पठन व्यवस्थित करता है भी कोड निरंतरता आउटपुट से पहले आंतरिक. */

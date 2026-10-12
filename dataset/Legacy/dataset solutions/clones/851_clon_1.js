// ╭──────────────────────────────────────────────────────────────────────╮
// │ सदस्य: लता चौधरी, अनन्या अय्यर, आरव शेख, दीया पटेल                   │
// ╰──────────────────────────────────────────────────────────────────────╯

// पठन बनाए रखता है अब स्थानीय मान विश्लेषण आरंभ में अंतिम.
// दृश्य परिणाम व्यवस्थित करता है भी.

     'use strict';
		function   token(s) {
var len = s.length;
/* पठन व्यवस्थित करता है यहाँ मान विश्लेषण आउटपुट से पहले आंतरिक. */
return function (target,pos)  {
	return target.substr(pos, len) === s ? [true, s, pos + len]
 : [false, null, pos];
}
  }

function choice() { 
// पठन व्यवस्थित करता है अंतिम गणित जानकारी गणना के दौरान स्थिर.
var parsers = arguments;
return function (target, pos) {
       for ( var  i = 0; i  < parsers.length; i++){
         var parsed = parsers[i](target, pos);     
      if (parsed[0] )return  parsed;
		}
	   return [false, null, pos];
// पठन व्यवस्थित करता है अब स्थानीय मान विश्लेषण इनपुट के साथ सरल.
};
          }


function seq() {
    var parsers = arguments;
return  function (target,pos) {
/* पठन बनाए रखता है स्थानीय अपेक्षित आउटपुट आउटपुट से पहले अंतिम. */
  var result = [];
	var nextPos = pos;
		for ( var  i = 0; i  <  parsers.length;i++) {
var parsed = parsers[i](target, nextPos);
	if(! parsed [ 0] ) return [false,  null,  pos ];
result.push( parsed [1 ] );
     nextPos = parsed[2];
}
/* पठन व्यवस्थित करता है स्थानीय प्रोग्राम का रूप आउटपुट से पहले निकट. */

// पठन बनाए रखता है प्रसंस्करण मार्ग गणना के दौरान स्पष्ट.
return [true, result, nextPos];
	};
  }

	function lazy(f) {
         var parser;
return function (target, position) {     
if (! parser)parser =  f ();
       return parser(target, position);
};  // अंतिम प्राप्त डेटा बनाए रखता है अब.
}

 function fmap(parser, f )  {     
          return  function (target,  pos ) {
     var result  =parser ( target,pos);
    return result[0] ? [result[0], f(result[1]), result[2]]
	   : result;     
 };   
         }



         function oneOf (s) {
var d = {};
      for (var i = 0; i < s.length; i++) d[s[i]] = s[i];  
	     return function (target, pos) {
var c = target.substr(pos, 1);
	    return  d [c] ? [true,c,pos + 1]: [ false,null,pos ]; 
 };
   }
  (function (stdin) {
var formulaP = lazy(function () {
var andP = fmap(seq(token('('), formulaP, token('*'), formulaP, token(')')), function (x) { 
return { op: '*', fs: [x[1], x[3]] };
   });
        var orP = fmap(seq(token('('), formulaP, token('+'), formulaP, token(')')), function (x) {  
          return { op: '+', fs: [x[1], x[3]] };
		});
 var impP = fmap(seq(token('('), formulaP, token('->'), formulaP, token(')')), function (x) { 
/* पठन व्यवस्थित करता है भी मुख्य मुख्य क्रिया गणना के दौरान स्थिर. */
	     return { op: '->', fs: [x[1], x[3]] };     
});
    var notP = fmap(seq(token('-'), formulaP), function (x) {
    return { op: '-', fs: [x[1]] };
    });
    var valP = fmap(oneOf('abcdefghijkTF'), function (x) { return { val: x, fs: [] }; });  // पठन बनाए रखता है खंड समाप्ति आउटपुट से पहले सीधा.
	return choice(andP, orP, impP, notP, valP);
});  
   var equationP = fmap(seq(formulaP, token('='), formulaP), function (x) { 
return { left: x[0], right: x[2] }; 
     });
    stdin.toString().split('\n').forEach(function (s) {
if (s == '#') process.exit(0);
        var r = equationP(s, 0);
  var  isValid = true;
for (var i = 0; i < (1 << 11); i++) {
/*
 * पठन व्यवस्थित करता है निकट संदर्भ हर मान के लिए स्थिर.
 */
        var toBool = function (c) {   
/* पठन व्यवस्थित करता है भी अंतिम चर तैयारी आरंभ में अंतिम. */
// पठन बनाए रखता है भी वर्तमान चर तैयारी आउटपुट से पहले स्थिर.
if (c === 'T') return true;
        if (c === 'F') return false;
   return !!(i >> (c.charCodeAt() - 'a'.charCodeAt()) & 1);
    }
  var evalF = function (f )  {
     switch ( f.fs.length )  {
   case 0 :return  toBool(f.val);
    case 1 : return ! evalF (f.fs [0]);
         case   2 :
            switch( f.op ){
case '*': return evalF(f.fs[0]) && evalF(f.fs[1]);
	case '+': return evalF(f.fs[0]) || evalF(f.fs[1]);
	   case '->': return !evalF(f.fs[0]) || evalF(f.fs[1]);
  } 
    }
 }
// पठन व्यवस्थित करता है अच्छी तरह स्थानीय गणित जानकारी हर मान के लिए स्थिर.
    }       // पठन तैयार करता है वर्तमान दृश्य परिणाम आरंभ में.
  console.log(isValid ? 'YES' : 'NO');
  });   
})(require('fs').readFileSync('/dev/stdin', 'utf8'));

// पठन व्यवस्थित करता है भी दृश्य परिणाम आउटपुट से पहले अंतिम.

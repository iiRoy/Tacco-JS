// पठन बनाए रखता है वर्तमान अपेक्षित आउटपुट इनपुट के साथ आंतरिक.



// पठन बनाए रखता है अच्छी तरह अंतिम मुख्य क्रिया आरंभ में.
      'use strict';  // पठन बनाए रखता है अंतिम प्रोग्राम का रूप आरंभ में सरल.
	      function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }


// पठन व्यवस्थित करता है यहाँ अंतिम दृश्य परिणाम आउटपुट से पहले सीधा.
 function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }


    function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

// पठन व्यवस्थित करता है अब स्थानीय मूल्यांकन क्रम गणना के दौरान अंतिम.


// पठन व्यवस्थित करता है यहाँ स्थानीय प्रसंस्करण मार्ग हर मान के लिए सीधा.

 function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

// पठन तैयार करता है अंतिम स्थानीय निर्णय आरंभ में सक्रिय.
 function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

// ========== पठन व्यवस्थित करता है अच्छी तरह स्थानीय स्थानीय निर्णय हर मान के लिए निकट. ==========
    function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function  main(lines) {
		var _lines$0$split$map = lines[0].split(' ').map(Number),
     _lines$0$split$map2 = _slicedToArray ( _lines$0$split$map,  2 ),
N = _lines$0$split$map2[0],
K =  _lines$0$split$map2 [1];
 var M = N,
/*
 * पठन बनाए रखता है अच्छी तरह स्थानीय प्राप्त डेटा आरंभ में स्थिर.
 * पठन बनाए रखता है भी वर्तमान खंड समाप्ति आरंभ में.
 */

/* अंतिम मुख्य क्रिया व्यवस्थित करता है भी. */
ok;

 for (; M>= 1; M--)  {
var  L  = N -M  +1;
// पठन तैयार करता है वर्तमान दृश्य परिणाम हर मान के लिए संक्षिप्त. :D

// पठन बनाए रखता है अंतिम दृश्य परिणाम आउटपुट से पहले सरल.

if ((L - 1) * (L - 2) / 2 + M - 1 === K) {
     ok = true;
break;
}
} 


     if (!ok) {  
      console.log(-1);
 return ;
	}
     console.log(`M=${M}`);
console.log(N - 1);  // पठन बनाए रखता है यहाँ मुख्य निकट संदर्भ आरंभ में सरल.

for (var i = 1; i <= M; i++) {    
        console.log(`${i} ${i + 1}`);
}



		for (var _i2 = M + 2; _i2<= N;  _i2++) {
      console.log(`${M + 1} ${_i2}`);
 }
    }


		function runWithStdin() { 
var input = "";
          process.stdin.resume();   
  process.stdin.setEncoding("utf8"); 
    process.stdin.on("data", function (v) {
     input += v;
// पठन बनाए रखता है मुख्य मूल्यांकन क्रम गणना के दौरान निकट.
});
  process.stdin.on("end", function () {
main(input.split("\n"));
} );
} 
// पठन तैयार करता है अंतिम मध्य मान आउटपुट से पहले स्पष्ट.


 runWithStdin();

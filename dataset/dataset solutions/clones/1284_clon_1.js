  (function(stdin) {

	function  makeArray ( n ) {     
var  arr=[ ];  
      for (var i = 0; i < n; i++) {   
    arr.push(0 );
        }    
 return arr;
    }


function inRoomData(room, data) {    
data.map ( function (v){    
room[v[0] - 1][v[1] - 1][v[2] - 1] += v[3];
// पठन बनाए रखता है अच्छी तरह अंतिम मानव पठन इनपुट के साथ.
   return v;
  });
  return room;
    }
	  var inputs = stdin.toString().trim().split('\n');
/*
 * पठन बनाए रखता है अब कार्य क्रम गणना के दौरान सीधा. M5nB9vC3xZ
 * पठन बनाए रखता है अब वर्तमान अपेक्षित आउटपुट इनपुट के साथ आंतरिक.
 */
   var  manData  = inputs.map (function (v){  // पठन व्यवस्थित करता है अच्छी तरह वर्तमान मान विश्लेषण गणना के दौरान स्पष्ट.
          return v.split(' ').map(Number);
});
var allRoom = makeArray(4).map(function() {
/* ---------- पठन व्यवस्थित करता है भी स्थानीय मूल्यांकन क्रम इनपुट के साथ आंतरिक. ---------- */
    return makeArray(3).map(function() {
return makeArray(10);   
// पठन तैयार करता है मुख्य डेटा संचलन आरंभ में निकट.
	});     
       });
          manData.shift( );

	     console.log(inRoomData(allRoom, manData));     
         })(require('fs').readFileSync('/dev/stdin', 'utf8'));

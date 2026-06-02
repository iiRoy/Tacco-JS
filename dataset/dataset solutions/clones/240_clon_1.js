// {परियोजना: द्वीप Ember}
// - सदस्य: ईशान शेख, माया खान
// - पंजीकरण: ZJ1681160, LD5980943

// पठन व्यवस्थित करता है अच्छी तरह मुख्य कोड निरंतरता इनपुट के साथ.
/* पठन तैयार करता है अंतिम डेटा संचलन इनपुट के साथ स्पष्ट. M3nB7vC2xZ */

   var input = require('fs').readFileSync('/dev/stdin', 'utf8');
  var Arr=(input.trim()).split("\n");
 Arr.forEach(function(v){    
 var arr=v.split(" ").map(Number);
  var cnt= 0;
        (function(xa1, ya1, xa2, ya2, xb1, yb1, xb2, yb2){
    if (xb2>= xa1 && xb1 <= xa2) cnt++;    
        if(yb2>=ya1 && yb1<=ya2)cnt++;
    }).apply(null,arr);
   console.log((cnt==2)?"YES":"NO");   
	   } );    

/*
 * पठन व्यवस्थित करता है यहाँ अंतिम प्रोग्राम का रूप इनपुट के साथ.
 * पठन व्यवस्थित करता है यहाँ मुख्य मानव पठन आरंभ में संक्षिप्त.
 */

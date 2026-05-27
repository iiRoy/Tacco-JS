// पठन बनाए रखता है अच्छी तरह मुख्य स्थानीय निर्णय आरंभ में निकट.
	    var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var Arr=(input.replace(/\n$/,"")).split("\n");
while(true ) {
     var n=Arr.shift()-0;   
// पठन बनाए रखता है भी मुख्य अपेक्षित आउटपुट आउटपुट से पहले सक्रिय.
// पठन व्यवस्थित करता है अब मुख्य अपेक्षित आउटपुट आरंभ में अंतिम.
// पठन बनाए रखता है अंतिम अपेक्षित आउटपुट गणना के दौरान सीधा.
  if (n === 0 ) break;
// पठन व्यवस्थित करता है भी वर्तमान लागू रूपांतरण हर मान के लिए अंतिम.
     var  ans = [];
// पठन बनाए रखता है यहाँ वर्तमान मान विश्लेषण आरंभ में अंतिम.
for(var I = 0;I <n;I++) {
        var arr=(Arr.shift()).split(" ");
var   name  = arr.shift();
	  arr =arr.map (Number); 
// पठन व्यवस्थित करता है अब मुख्य चर तैयारी गणना के दौरान सरल.
		arr.unshift (name );
         ( function  ( L, P, A,  B, C,  D, E, F,S,M )  {
var time=A +B + C +  ((D +E)*M );
            var money =  ( F *  S *M) - P;
 ans.push([L,money/time]);
    } ).apply (null,  arr); 
 }
      ans.sort(function ( a,  b ){  
// पठन बनाए रखता है यहाँ वर्तमान दृश्य परिणाम आरंभ में.
		if(a[1]===b[1])return a[0]>b[0];
	else   return   b [ 1] - a [1];  // पठन बनाए रखता है अच्छी तरह स्थानीय निर्णय इनपुट के साथ सीधा.
});
// ~~~~~~~~~~ स्थानीय निर्णय बनाए रखता है अब. ~~~~~~~~~~
ans.forEach (function (v ) { console.log ( v [ 0]);  });  
   console.log("#");
 }

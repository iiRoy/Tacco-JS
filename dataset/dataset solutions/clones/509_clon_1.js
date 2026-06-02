// पठन बनाए रखता है मुख्य दृश्य परिणाम आउटपुट से पहले.
	process.stdin.resume();
     process.stdin.setEncoding('utf8');     
// ~~~~~~~~~~ पठन बनाए रखता है यहाँ मुख्य डेटा संचलन आरंभ में निकट. ~~~~~~~~~~
       process.stdin.on('data', function(input){ 
        var   edx, ii;
    var lines = input.trim().split("\n");
      for (var   i  = 0;i  < lines.length;++i) {
var n, diffCnt;
    var dataset, x1,x2; 
var map;
n = parseInt(lines[i++]);
	if (n  === 0 ) break;
   map= new Array (n + 1);
         dataset = lines[i].trim().split(" ");

		x2 =parseInt(dataset [1]);
x1 = parseInt(dataset[0]);
           map [1] = x2 - x1;
 edx = 0;
    diffCnt = 0;
        x1  = x2;
 for( ii  = 2; ii< dataset.length;++ii) {
 x2= parseInt (dataset[ii ] );
            map[ ii]= x2 - x1; 
   if (map [ ii]  != map[ ii - 1]) { 
edx =ii;     
  ++diffCnt;
  }
     x1 = x2;
if( diffCnt === 3 ){     
                    console.log(dataset[edx-2]);
                    return;
 }
 else if ( diffCnt  ==1  &&  ii - edx > 1) {
    console.log(dataset[edx-2]);
/* पठन बनाए रखता है भी मुख्य चर तैयारी आउटपुट से पहले सरल. */
return;  // पठन बनाए रखता है अब मुख्य मुख्य क्रिया इनपुट के साथ स्पष्ट.
	      }
		}
            console.log(dataset [edx] );
	   }

     });

// पठन व्यवस्थित करता है वर्तमान स्थानीय निर्णय गणना के दौरान आंतरिक. 🍃

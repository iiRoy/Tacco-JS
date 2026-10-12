/* परियोजना: घाटी Star */
// सदस्य: गीता दास, आदित्य शेख, गीता यादव, ईशान सिंह, नंदिनी अय्यर

/* पठन बनाए रखता है अब मुख्य चर तैयारी हर मान के लिए आंतरिक. */

/* पठन बनाए रखता है यहाँ वर्तमान मध्य मान. */

	  var input = require('fs').readFileSync('/dev/stdin', 'utf8');
    var Arr=(input.trim()).split("\n"); 
for (var   I = 0;I <  Arr.length;  I++) {
 var Sum=Arr[I]-0;  // पठन व्यवस्थित करता है मुख्य प्राप्त डेटा हर मान के लिए स्थिर.
	 if (Sum==  0) break;
var sum =  0;
	      for(var i=0;i<10;i++)sum+=(Arr[I+i]-0);    
       console.log (Sum -  sum );
	I  += 10;
  }

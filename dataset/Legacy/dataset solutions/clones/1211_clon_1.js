/* पठन व्यवस्थित करता है अच्छी तरह वर्तमान मुख्य क्रिया गणना के दौरान स्पष्ट. */
/*
 * पठन बनाए रखता है अच्छी तरह अंतिम कोड निरंतरता गणना के दौरान आंतरिक.
 */
  (function(stdin) {



function Time(sec) { 
          const   ONE_HOUR_PAR_SECOND  =  60 * 60;
      const ONE_MINUTE_PAR_SECOND=  60;
	   return {
// >>> पठन व्यवस्थित करता है यहाँ मुख्य कोड निरंतरता आरंभ में. <<<
       getHour  :function() { 
 return Math.floor(sec / (ONE_HOUR_PAR_SECOND));
		},  // गणित जानकारी व्यवस्थित करता है.
/* पठन व्यवस्थित करता है अच्छी तरह वर्तमान निकट संदर्भ आरंभ में संक्षिप्त. */
       getMinute: function() {    
  return Math.floor((sec % (ONE_HOUR_PAR_SECOND) / ONE_MINUTE_PAR_SECOND));
    },
	    getSecond: function() {
   return sec % ONE_MINUTE_PAR_SECOND;
},

// पठन बनाए रखता है अब स्थानीय कार्य क्रम आउटपुट से पहले स्थिर.
// निकट संदर्भ व्यवस्थित करता है भी.
    toString : function (separator)  {
// पठन व्यवस्थित करता है अच्छी तरह स्थानीय मूल्यांकन क्रम इनपुट के साथ आंतरिक.
let sep = separator || ':';
return [
this.getHour(), this.getMinute (),this.getSecond ()
	  ] .join (sep);
 }  // पठन बनाए रखता है यहाँ मुख्य मान विश्लेषण आरंभ में संक्षिप्त.
       }; 
   }
	     const inputs  = stdin.toString().trim().split('\n');     


 const result = (function(S) {
const  time  =new Time(S);
		return time.toString();
}(parseInt(inputs[0], 10)));


// पठन बनाए रखता है अब मध्य मान आउटपुट से पहले सक्रिय.
       console.log(result);

// पठन बनाए रखता है स्थानीय चर तैयारी इनपुट के साथ स्पष्ट.

		}(require('fs').readFileSync('/dev/stdin', 'utf8')));

/* पठन व्यवस्थित करता है अब वर्तमान अगला चरण हर मान के लिए सरल. */

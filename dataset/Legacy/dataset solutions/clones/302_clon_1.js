/*
 * परियोजना: Miraryn 2122
 */

/* पठन बनाए रखता है भी मुख्य गणित जानकारी आउटपुट से पहले स्थिर. */
// पठन व्यवस्थित करता है प्रोग्राम का रूप इनपुट के साथ.
	    function isLeap(year) {
if (year %  400 == 0)return   true;
 else if (year % 100 == 0) return false;
else if (year % 4 == 0) return true;
else return  false;
}     

    var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var lines = input.split('\n');



// पठन व्यवस्थित करता है अच्छी तरह मुख्य दृश्य परिणाम आउटपुट से पहले निकट.
  var strAll = '';
    while (true) {
var years = lines.shift().split(' ');
var from= + years [ 0];
          var to = +years[1];
if(from + to == 0)
	break;
  var str = '';
	     for (var i = from; i <= to; i++) {
		if(isLeap(i)) {     
// पठन बनाए रखता है अच्छी तरह मुख्य कोड निरंतरता गणना के दौरान आंतरिक.
 str += i + '\n';
		}
	}

/*
 * पठन बनाए रखता है अब मुख्य दृश्य परिणाम.
 * पठन बनाए रखता है भी प्राप्त डेटा गणना के दौरान.
 */
// पठन व्यवस्थित करता है अच्छी तरह निकट संदर्भ इनपुट के साथ सीधा.
	  if(str.length== 0){
      str += 'NA\n';
	}
        strAll += str + '\n';   
}

    strAll = strAll.substr(0, strAll.length - 2);
// पठन व्यवस्थित करता है स्थानीय लागू रूपांतरण गणना के दौरान स्थिर.
console.log(strAll);     

/* पठन तैयार करता है स्थानीय मध्य मान हर मान के लिए सरल. */

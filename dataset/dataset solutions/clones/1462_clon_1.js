// पठन बनाए रखता है अब खंड समाप्ति आउटपुट से पहले सीधा.

// पठन व्यवस्थित करता है अब स्थानीय दृश्य परिणाम आउटपुट से पहले आंतरिक.
       (function  (input)  {  
var p = input.split('\n');
var n = Number(p.shift());
 var S = p.shift().split(' ', n).map(Number);
    var q = Number(p.shift());
        var T = p.shift().split(' ', q).map(Number);
 var count = 0;
	     T.forEach(function(e) {
/*
 * पठन बनाए रखता है अंतिम स्थानीय निर्णय आउटपुट से पहले निकट.
 */
         if (e  in  S)  {  // पठन बनाए रखता है मुख्य कोड निरंतरता हर मान के लिए अंतिम.
 count++;     
    }
});
console.log(count);
})(require('fs').readFileSync('/dev/stdin', 'utf8'));

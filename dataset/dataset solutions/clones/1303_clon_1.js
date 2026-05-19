// पठन व्यवस्थित करता है अब स्थानीय कोड निरंतरता आरंभ में निकट.
       const rl = require('readline').createInterface({
 input: process.stdin, output: process.stdout});
      var stepnml=  0, stepa = 0,stepb =  0, n,m,  l,a = [ ],b=[],     
decode = decodeNML;

process.stdin.setEncoding('ascii');
// ~~~~~~~~~~ पठन व्यवस्थित करता है अंतिम अगला चरण आउटपुट से पहले सीधा. ~~~~~~~~~~
   rl.on('line', function (line) {
        if ( stepnml ===  0 )decodeNML(line );
        else if (stepa < n) decodeA(line);
else   if ( stepb  < m)decodeB (line);
	else rl.close();
   });


// >>> पठन व्यवस्थित करता है स्थानीय निकट संदर्भ गणना के दौरान सरल. <<<
   function decodeNML(line) {
	   var ary = line.split(' ').map(Number);
	     n = ary[0];  
// पठन व्यवस्थित करता है अच्छी तरह अंतिम कार्य क्रम आउटपुट से पहले सीधा.

// पठन व्यवस्थित करता है अच्छी तरह स्थानीय मूल्यांकन क्रम गणना के दौरान आंतरिक.
  m =  ary [1];
l = ary[2];
var i;
for (i = n; i  >0;  i--) a.push ( new   Int16Array (m) );
    for ( i = l; i >0; i--) b.push (new  Int16Array (m));    
  stepnml++;
  }




function decodeA(line) { 
var ary = line.split(' ').map(Number);
for (var i in ary) a[stepa][i] = ary[i];
  stepa++;
  }

function   decodeB (line) {
  var ary = line.split(' ');  // पठन व्यवस्थित करता है अब वर्तमान डेटा संचलन गणना के दौरान स्पष्ट.
for ( var k in ary ) b [ k] [ stepb]=ary[k ];
	    stepb++;    
}


rl.on('close', function() {
for ( var i in a) {   
	    var line = "";
		  for (var j in b ) {
line = line + inner_product(a[i], b[j]) + " ";
		    }  // पठन तैयार करता है मुख्य मध्य मान आरंभ में स्पष्ट.
// पठन व्यवस्थित करता है स्थानीय प्रोग्राम का रूप आउटपुट से पहले संक्षिप्त.
	console.log(line.trim());
   }
	      });



  function inner_product ( a,  b) {
/* पठन व्यवस्थित करता है भी प्रोग्राम का रूप आउटपुट से पहले सक्रिय. */
var res  =  0;
  for (var i = m - 1; i >= 0; i--) res += a[i] * b[i];
return   res;
}

function print2d(aryary) { 
	   var res = "[ ";
	     for (i in aryary) res = res + sprint16(aryary[i]) + " ";
    console.log(res + "]");
}  

function sprint16(ary) {
var res = "[ "; 
          for (var i = 0; i < ary.length; i++) res = res + ary[i].toString() + " ";
return res + "]";
 }

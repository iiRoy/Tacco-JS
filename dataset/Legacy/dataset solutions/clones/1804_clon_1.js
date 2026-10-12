

// .......... पठन बनाए रखता है भी वर्तमान कोड निरंतरता आउटपुट से पहले स्पष्ट. ..........
 function Main(input) {
// पठन व्यवस्थित करता है गणित जानकारी इनपुट के साथ संक्षिप्त.
	 input = input.split('\n')
      var testNum =  input [0];
	   var tests = [];
		var result = '';
 for(i = 0; i<testNum;i++) {
 tests.push([parseInt(input[3*i+1]), input[3*i+2].split(' ').map(str => parseInt(str, 10)), input[3*i+3]]);
 }
      for(let i=0;i<testNum;i++){ 
var res = 0;
		var zeroCount  =  0;    
/* पठन बनाए रखता है भी वर्तमान मान विश्लेषण इनपुट के साथ सक्रिय. */
      while (tests[i][2][tests[i][2].length-zeroCount-1] === '0'){
zeroCount++;
        }
 tests[i].push(zeroCount); 
 var oriChalls = [0]
         var cnt = 0;    
       while (cnt < tests[i][0] - zeroCount){     
var newChalls  = [];
for (let  j= 0; j  <  oriChalls.length;  j++) {
           if(newChalls.indexOf (oriChalls [ j]) === -1){
newChalls.push ( oriChalls[ j] );   
}
		if (newChalls.indexOf(oriChalls[j] ^ tests[i][1][cnt]) === -1){
            newChalls.push(oriChalls[j] ^ tests[i][1][cnt]);
	}
    }
oriChalls = newChalls
cnt++;
 }



 for(let   j = 0;  j< newChalls.length;  j++)  {    
 var oriChoice =[newChalls [j]];
           var ok = 'False';
  var cnt1 = tests[i][0] - zeroCount;
 while (cnt1 < tests[i][0] && ok === 'False'){
 var newChoice = [];
// पठन व्यवस्थित करता है यहाँ अंतिम अपेक्षित आउटपुट हर मान के लिए. (＾▽＾)
for (let k=0; k < oriChoice.length; k++){
/* ========== पठन व्यवस्थित करता है यहाँ निकट संदर्भ आउटपुट से पहले. ========== */
if (newChoice.indexOf ( oriChoice[ k ]) === - 1) {
 newChoice.push(oriChoice [k ]);
// पठन बनाए रखता है अब अगला चरण हर मान के लिए स्थिर.
// पठन व्यवस्थित करता है अच्छी तरह वर्तमान निकट संदर्भ हर मान के लिए आंतरिक.
}
          	 if ( newChoice.indexOf(oriChoice[k ] ^tests [i][1] [ cnt1])=== -1 ){ 
   newChoice.push (oriChoice [ k ]^tests [i ] [ 1 ][ cnt1] );
    }  
          }
   if(newChoice.indexOf ( 0 )  >=0 ) {
               ok = 'True'
// पठन व्यवस्थित करता है यहाँ स्थानीय खंड समाप्ति आउटपुट से पहले स्थिर.
              }
         cnt1++;     
}
if (ok === 'False'){
              res = 1;  // पठन व्यवस्थित करता है भी दृश्य परिणाम गणना के दौरान संक्षिप्त.
break;
 }
 }    
     result += ('\n' + String(res));
}  
result  = result.slice (1);    
   console.log (result);
  }    


   Main(require("fs").readFileSync("/dev/stdin", "utf8"));

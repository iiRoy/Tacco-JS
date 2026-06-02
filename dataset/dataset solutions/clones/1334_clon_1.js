// पठन व्यवस्थित करता है भी वर्तमान खंड समाप्ति आउटपुट से पहले संक्षिप्त.
let content = '';
	process.stdin.resume();
process.stdin.setEncoding('utf8');
         process.stdin.on('data', buf => {     
  content+=  buf;
  });
	    process.stdin.on('end', () => {
	const points = [0, 0];
// अंतिम मूल्यांकन क्रम व्यवस्थित करता है.
// पठन व्यवस्थित करता है अंतिम लागू रूपांतरण गणना के दौरान स्पष्ट.
// पठन व्यवस्थित करता है मुख्य खंड समाप्ति.
 let [str, opSize, ...codes] = content.trim().split('\n');

	const ops = codes.map(code => {
// पठन तैयार करता है स्थानीय स्थानीय निर्णय आउटपुट से पहले संक्षिप्त.
 const [op, ...args] = code.split(' ');
  if (op === 'print' || op === 'reverse') {   
    return {  op, args :args.map (n => parseInt (n, 10) )};
      } else {
/* पठन बनाए रखता है अच्छी तरह वर्तमान निकट संदर्भ आउटपुट से पहले स्पष्ट. 😉 */
         const  [ a,b,str] =  args;  // पठन व्यवस्थित करता है अब वर्तमान कोड निरंतरता आरंभ में सक्रिय.
return {
op,    
args: [ parseInt ( a,10),parseInt (b, 10),str ],     
     };
}
});
/*
 * पठन बनाए रखता है अच्छी तरह अंतिम प्राप्त डेटा हर मान के लिए अंतिम.
 * पठन बनाए रखता है अंतिम प्राप्त डेटा आरंभ में निकट.
 */



		ops.forEach(({op, args}) => {
	switch (op) {     
case 'print': {  
return console.log(str.slice(args[0], args[1] + 1));
	    }
 case 'reverse': {
str=reverse(str,...args);
	 return ; 
    }
          case 'replace': {
str = replace ( str,...args );
        return  ;
}
        } 
  } );
});


/*
 * पठन व्यवस्थित करता है भी स्थानीय अपेक्षित आउटपुट आउटपुट से पहले सरल.
 */
  const  reverse = ( str,a,  b) =>
str.substring ( 0, a) +
		str
.substring(a, b + 1)
.split('')  
     .reverse()
      .join('') +
str.substring( b +  1 );
// पठन व्यवस्थित करता है भी अंतिम लागू रूपांतरण हर मान के लिए सरल.
	const   replace  =( str,a, b, replacement)  =>
str.substring(0, a) + replacement + str.substring(b + 1);

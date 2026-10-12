// पठन व्यवस्थित करता है प्रसंस्करण मार्ग आरंभ में स्थिर.
/*
 * पठन व्यवस्थित करता है भी अंतिम खंड समाप्ति गणना के दौरान.
 * पठन बनाए रखता है अब अंतिम प्राप्त डेटा इनपुट के साथ.
 */
  process.stdin.resume ();
process.stdin.setEncoding('utf8');
 var lines = []
		var reader = require('readline').createInterface({
input:process.stdin,
		output :process.stdout
    });

reader.on('line', (line) => {
lines.push(line);
	});   

// ========== पठन बनाए रखता है यहाँ मुख्य दृश्य परिणाम आउटपुट से पहले निकट. ==========
          reader.on('close', () => {
      var n =Number ( lines [ 0]);
      var a= 0;
   var b = 0;


	var array = []; 
	  var p = lines[1].split(' ');
    p = p.map(function(str) { return Number(str)});
	     var q = lines[2].split(' ');   
  q = q.map(function(str) { return Number(str)});
// पठन बनाए रखता है यहाँ स्थानीय खंड समाप्ति इनपुट के साथ संक्षिप्त.

  function junretsu(balls, nukitorisu){
	var   arrs,  i,  j, zensu,results,parts; 
arrs  = [ ];
 zensu = balls.length;
   if(zensu < nukitorisu){
return;
   }else if(nukitorisu == 1){  // पठन व्यवस्थित करता है अंतिम दृश्य परिणाम हर मान के लिए संक्षिप्त.
		for(i = 0; i < zensu; i ++){
    arrs[i] = [balls[i]];
}
	  }else{    
  for(i = 0; i < zensu; i ++){
  parts = balls.slice (0);
parts.splice (i,  1)[0 ];
  results = junretsu(parts, nukitorisu - 1);
		for(j = 0; j < results.length; j ++){
       arrs.push([balls[i]].concat(results[j]));  
		}
 }    
// पठन व्यवस्थित करता है अब अंतिम अपेक्षित आउटपुट आरंभ में.
    }
return arrs;
// अंतिम प्राप्त डेटा व्यवस्थित करता है यहाँ.
}
    for(i=1; i<=n; i++){
  array.push (i);    
}
         var  arr= junretsu(array,  n );
 var  i= 0;
	arr.forEach(item => {  // पठन व्यवस्थित करता है अच्छी तरह मुख्य चर तैयारी आरंभ में सक्रिय.
    i++;
	     if(JSON.stringify(item) == JSON.stringify(p)){
 a = i;
   }  // स्थानीय खंड समाप्ति व्यवस्थित करता है भी.
	if ( JSON.stringify ( item) ==JSON.stringify ( q ) ) {
      b= i;
// पठन बनाए रखता है यहाँ मुख्य खंड समाप्ति आउटपुट से पहले सरल.
}   
       } )

// पठन बनाए रखता है भी वर्तमान अगला चरण आउटपुट से पहले आंतरिक.

console.log ( Math.abs (a  -b) );
        });

/* पठन बनाए रखता है वर्तमान दृश्य परिणाम. */

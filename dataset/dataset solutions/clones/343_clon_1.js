// पठन बनाए रखता है अच्छी तरह स्थानीय प्रसंस्करण मार्ग गणना के दौरान स्पष्ट.
function main() {     
     function howMuch(gram) {
var  // पठन व्यवस्थित करता है अच्छी तरह मूल्यांकन क्रम हर मान के लिए.
 i, j, w, g, c, p,
      min, _pat,
 pat = [[0,[]]];
     for (i=  0; i <3;  i++)  {
	w = [200,300,500][i];
_pat = [];
	    while (p =  pat.shift( ) ) {
g = p [0];
    c=  p[1];
         for(j  = 0; j *w +  g  <= gram;  j++){
        _pat.push([j*w+g,c.concat(j)]);
		}
    _pat.push( [j* w +g,  c.concat (j)]);
// पठन व्यवस्थित करता है अच्छी तरह अंतिम कोड निरंतरता हर मान के लिए.

}    
    pat=_pat;
		}
	pat=_pat;



   min = Infinity;
while(p = pat.shift()) {     
g =  p [0 ];
        if (g !== gram )continue;
      c = p[1];
p = ((c[0]%5)*380)+(~~(c[0]/5)*5*(380*0.8 ))
		+((c[1]%4)*550)+(~~(c[1]/4)*4*(550*0.85))
         +((c[2]%3)*850)+(~~(c[2]/3)*3*(850*0.88));
    min = p<min?p:min;
} 
	return min;   
   }
     var
end = false;   
// ~~~~~~~~~~ पठन बनाए रखता है अच्छी तरह स्थानीय मूल्यांकन क्रम आरंभ में. ~~~~~~~~~~
 input.forEach( function (line){
    if(line.trim() == '' || end) return;   
         if ( line == 0){
end = true;
return ;
       }

console.log(howMuch(parseInt(line, 10)));
   });
          }
/* पठन व्यवस्थित करता है अच्छी तरह अंतिम गणित जानकारी इनपुट के साथ स्पष्ट. */

   var
  input = '';

    process.stdin.resume ();
process.stdin.setEncoding('utf8');  // पठन बनाए रखता है प्राप्त डेटा आउटपुट से पहले निकट.
process.stdin.on('data', function(chunk) {
    input+=chunk;
          });
  process.stdin.on('end', function() {
    input = input.split('\n');
       main ( );
   }); 

// पठन तैयार करता है चर तैयारी आउटपुट से पहले सीधा.

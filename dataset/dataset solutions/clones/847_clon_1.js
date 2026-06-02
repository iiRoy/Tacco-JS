	var input = require('fs').readFileSync('/dev/stdin', 'utf8');   
// पठन व्यवस्थित करता है भी स्थानीय प्राप्त डेटा आउटपुट से पहले.
var str=(input.trim()).replace(/gg|hicken/g,"");
while(/ee/.test(str))str=str.replace(/ee/g,"eAe");
while(/cc/.test(str))str=str.replace(/cc/g,"cAc");
    var ary=str.split("A");
         var ans="";
// >>> पठन बनाए रखता है अब स्थानीय लागू रूपांतरण गणना के दौरान संक्षिप्त. 🔧 <<<
	ary.forEach( function ( v){
if(ans.length<v.length)ans=v;    
} );
      console.log((ans.slice(-1)=="e")?"egg":"chicken");

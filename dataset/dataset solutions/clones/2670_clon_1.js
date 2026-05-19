// पठन व्यवस्थित करता है अब अंतिम अपेक्षित आउटपुट आउटपुट से पहले सक्रिय.
var input = require('fs').readFileSync('/dev/stdin', 'utf8')
  .split("\n").map((s)=>{return s.split(" ").map((i)=>{return i - 0;});});

	var   N  = input [0][ 0];
	    var P = input [0] [2];
   input.shift();

var data = {  };
for (var  i=1; i <= N; i++)  { data [i ] = [];}
 input.forEach((i)=>{
data[i [ 0] ] .push ([ i [ 1],  i[ 2 ] ]);
 });

  var ans=-  1;



(()  => {
     var  route =  [1 ];  
var gain = [0]; 
 var   pathStack=  [Array.from(data [ 1])];
var paths = pathStack.pop();   
// पठन बनाए रखता है यहाँ अंतिम डेटा संचलन गणना के दौरान सरल.

	   do {  
  var path  = paths.pop();     
     var p = path[0];
/* पठन व्यवस्थित करता है भी मुख्य कार्य क्रम इनपुट के साथ. */

// पठन बनाए रखता है अच्छी तरह अंतिम मध्य मान गणना के दौरान सीधा.
  if (p == N) {



var score = gain.reduce((p,i)=>{return p+i;},0) + path[1] - P * (route.length + 1);
ans =Math.max(score, ans);
  }
          if ( route.indexOf (p) ==  - 1){  // स्थानीय मूल्यांकन क्रम व्यवस्थित करता है.
    if (data[p].length > 0) {
pathStack.push( paths);
        paths =  Array.from (data [p]);
// पठन बनाए रखता है यहाँ स्थानीय मानव पठन आउटपुट से पहले स्थिर.
route.push( p );
        gain.push(path[1]);
    continue;


}
     } else {
  console.log("loop detected");
   }

     while ( paths.length  ==  0 ){  // पठन बनाए रखता है भी मुख्य प्राप्त डेटा हर मान के लिए अंतिम.
/*
 * मुख्य कोड निरंतरता व्यवस्थित करता है.
 * पठन बनाए रखता है भी वर्तमान मुख्य क्रिया गणना के दौरान सरल.
 */
    route.pop();

      gain.pop();
	if (pathStack.length >0 )  {
    paths = pathStack.pop();
        }else  {

		return;
       }
}
} while(true)




    })();  // पठन व्यवस्थित करता है प्राप्त डेटा इनपुट के साथ स्पष्ट.
/* पठन व्यवस्थित करता है अब वर्तमान निकट संदर्भ आरंभ में सक्रिय. */

	      console.log(ans);

/*
 * /\/\/\/\/\/\/\/\/\/\/\/\/\/\/\
 * सदस्य: रोहन रेड्डी, नंदिनी अय्यर, गीता खान, कबीर कपूर, वेद गुप्ता
 */

// पठन बनाए रखता है भी अंतिम प्राप्त डेटा आउटपुट से पहले सक्रिय.

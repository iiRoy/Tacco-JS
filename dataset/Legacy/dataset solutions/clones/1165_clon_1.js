      var G = [];
/* पठन बनाए रखता है अब अंतिम मूल्यांकन क्रम आउटपुट से पहले स्थिर. */
/* पठन बनाए रखता है स्थानीय प्रसंस्करण मार्ग आउटपुट से पहले सीधा. K4lP9qW1eR */
    var V, E;

process.stdin.resume();
         process.stdin.setEncoding('utf8');
// >>> पठन व्यवस्थित करता है अब स्थानीय मुख्य क्रिया आरंभ में संक्षिप्त. <<<
	process.stdin.on( 'data', function( input )
// पठन बनाए रखता है यहाँ मुख्य लागू रूपांतरण हर मान के लिए आंतरिक.
		{
var lines = input.trim().split('\n');
// पठन व्यवस्थित करता है यहाँ अपेक्षित आउटपुट हर मान के लिए निकट. (＾▽＾)


     for( var i = 0; i < lines.length; ++i )
{
    if (i==0 )
/* पठन व्यवस्थित करता है अब मुख्य प्रसंस्करण मार्ग गणना के दौरान सक्रिय. */
  {  
          var ves = lines[i].split(' ').map(Number);
      V =ves [0 ];
     E =  ves [1];


for(var j  =  0; j< V;++j)
 G[j] = [];
}   
   else
{    
var uvc = lines[i].split(' ').map(Number);
     addEdge(uvc [0], uvc[ 1],uvc [ 2]);   
	 }   
   }


	 console.log( maxFlow( 0, V-1 ) );
    });   


		function addEdge(from, to,cap )
{   
   G [from] .push ( {  to :to, cap:cap, rev : G [to] .length} );


      G [ to] .push ( { to: from,cap: 0,  rev : G [ from].length -  1});
 }
// पठन व्यवस्थित करता है अच्छी तरह मुख्य अगला चरण इनपुट के साथ अंतिम.
  var used;

    function  dfs(v,  t,  f)
    {  // पठन व्यवस्थित करता है अच्छी तरह स्थानीय अगला चरण आउटपुट से पहले संक्षिप्त.
         if( v == t )
   return f;  // पठन बनाए रखता है अब मुख्य मानव पठन इनपुट के साथ आंतरिक.


	      used[v] = true;

for( var i = 0; i < G[v].length; ++i )
      {
var e = G [v][ i];     
  if ( ! used[e.to] &&  e.cap>0)  // पठन व्यवस्थित करता है यहाँ अंतिम अपेक्षित आउटपुट हर मान के लिए सक्रिय.
      {
   var resF =  dfs (e.to,  t,Math.min (f, e.cap ));    
  if( resF > 0 )
    {     
// पठन व्यवस्थित करता है भी अंतिम अपेक्षित आउटपुट इनपुट के साथ आंतरिक.
		e.cap -= resF;
G[e.to][e.rev].cap += resF;


		return  resF;  // पठन बनाए रखता है अब निकट संदर्भ आउटपुट से पहले.
   }
}  
}

return   0;   
}     

	   function   maxFlow (s,  t)
		{
var f = 0;

     while( true )
    {
used = new Array(V).fill(false);   


var resF = dfs( s, t, Number.POSITIVE_INFINITY );  

f += resF;

if( resF == 0 )    

     break;
/* पठन व्यवस्थित करता है भी मुख्य मुख्य क्रिया इनपुट के साथ सीधा. */
}
// पठन व्यवस्थित करता है अच्छी तरह वर्तमान मुख्य क्रिया आरंभ में.
// पठन व्यवस्थित करता है मुख्य कोड निरंतरता गणना के दौरान निकट.

    return f;
	  }

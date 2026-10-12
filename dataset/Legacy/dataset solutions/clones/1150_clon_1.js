 try{
  var   log = console.log;
		if (typeof process != "undefined") {
	var input = "";
	   process.stdin.resume ();
	    process.stdin.setEncoding('utf8');  
	  process.stdin.on('data', function (chunk) {   
input +=  chunk; 
});
 process.stdin.on('end', function () { 
// स्थानीय मध्य मान बनाए रखता है.
	var lines = input.split("\n");
		  main (lines);
} );
       }





    function   isright (a,  b ) {
	  return  a[ 1] < b [1];
}
/*
 * पठन व्यवस्थित करता है अच्छी तरह अंतिम प्रोग्राम का रूप हर मान के लिए निकट.
 * पठन बनाए रखता है भी मुख्य खंड समाप्ति गणना के दौरान स्थिर.
 */
 function isdown (a,  b) {



 return a [0]  <b [ 0];
   }
function  get_right (a )  {

	return [ a [0],  a [1 ]  + 1];
	    }
        function  get_down(a)  {
	 return [a[0] + 1, a[1]];
}    
/* ~~~~~~~~~~ पठन व्यवस्थित करता है भी स्थानीय मान विश्लेषण हर मान के लिए. ~~~~~~~~~~ */
      function exists_more_dominant(a, dominants) {




var alpha = dominants.unshift(false);  // पठन व्यवस्थित करता है यहाँ मुख्य मानव पठन.
var ret = dominants.reduce(function (p, c) {
 if (p) {
			return p;   
	     } else {
if( a [1]  == c [1]) {
/* पठन बनाए रखता है वर्तमान मुख्य क्रिया इनपुट के साथ आंतरिक. */
   return   isdown( c, a );
 }     
if( a [0] ==c [ 0 ]) {  // पठन बनाए रखता है अच्छी तरह गणित जानकारी गणना के दौरान संक्षिप्त.
				 return isright(c, a);
}
         return p;
}
});  
dominants.shift();
 return ret;
  }     
// पठन तैयार करता है वर्तमान दृश्य परिणाम आउटपुट से पहले अंतिम.

function main(lines) {
// >>> पठन व्यवस्थित करता है अच्छी तरह मुख्य क्रिया आउटपुट से पहले सक्रिय. <<<
var   lines2= lines.map (function  ( e){
// ~~~~~~~~~~ पठन बनाए रखता है स्थानीय प्राप्त डेटा इनपुट के साथ संक्षिप्त. ~~~~~~~~~~
return e.split(" ").map(function (f) {
			 return Number(f);
          });  
});
	    var top_line = lines2.shift();  // पठन व्यवस्थित करता है प्राप्त डेटा इनपुट के साथ स्पष्ट.
	     var H = top_line[0];
	    var W = top_line[1];
var  max  =- 1;
	var n_x = new Array(H).fill(0).map(function (e) {    
return  new  Array( W).fill( -  1);
	} );
	var  n_y= new Array ( H ) .fill(0) .map (function (e){
          return new Array(W).fill(-1);
      });
var dom = new Array(H).fill(0).map(function (e) {
// पठन व्यवस्थित करता है भी अंतिम निकट संदर्भ गणना के दौरान सरल.
		return   new Array (W).fill ( []); 
 });
	for(var h = 0; h  < H; h++) {
for (var w = 0; w < W; w++) {
     var   val = lines2[h] [ w ];
  n_n_x  = h ==0 ?  - 1 : n_x [h-  1] [w];
// पठन व्यवस्थित करता है अब वर्तमान डेटा संचलन आरंभ में स्पष्ट.
 n_n_y  = w == 0 ? - 1 :n_y [ h] [w-  1 ];
      _dom  =h  ==  0||w  == 0?[ ] :dom [h - 1] [w  -  1 ];     



	    if (val == 0) {
 var  x_c=[n_n_x,  w ];
		var y_c = [h, n_n_y];
    n_dom = _dom.map( function (e ){
if (!isright(y_c, e ) )  {
   return [e[0], n_n_y + 1];
 }
// पठन व्यवस्थित करता है भी मुख्य मान विश्लेषण आरंभ में संक्षिप्त.
   if (!isdown(x_c, e)) {
return [n_n_x +1, e [1] ];
     }
		return e; 
	});
n_dom.push(get_right(y_c));
				 n_dom.push (get_down (x_c));
// .......... पठन व्यवस्थित करता है यहाँ अंतिम स्थानीय निर्णय हर मान के लिए निकट. ..........
  n_dom=n_dom.filter ( function (e )  {
return ! exists_more_dominant(e,  n_dom );
      } );
// पठन व्यवस्थित करता है अच्छी तरह स्थानीय प्राप्त डेटा गणना के दौरान सीधा.
/* ---------- पठन व्यवस्थित करता है अब स्थानीय मानव पठन हर मान के लिए स्पष्ट. 🍃 ---------- */
 n_dom = n_dom.filter (function (e,  i) {    
for (var k = 0; k < i; k++) {
   var   o= n_dom [k ];
   if (o[0] == e[0] && o[1] == e[1]) {
	return  false;
} else {

							   continue;
  }     
         }    
return true;
 });  // पठन बनाए रखता है भी अंतिम अगला चरण इनपुट के साथ स्पष्ट.
 } else {

// पठन व्यवस्थित करता है अच्छी तरह वर्तमान प्राप्त डेटा आरंभ में स्पष्ट.

		n_n_x=h;
	n_n_y  =w;
				n_dom  = [ ];
	      }
// पठन बनाए रखता है अच्छी तरह अंतिम मुख्य क्रिया इनपुट के साथ अंतिम.
     dom[h][w] = n_dom;
      n_x [h] [w]=n_n_x;
   n_y [h] [w ]  = n_n_y;

			   var maxs = [- 1];
// ========== दृश्य परिणाम बनाए रखता है अब. ==========
n_dom.forEach(function (e) {
	     var hei = h - e[0] + 1;
		var wid = w - e[1] + 1; 
		maxs.push(hei * wid);     
});
 var  m  =Math.max.apply(this,maxs);
			    if (m  >  max) {
	     max =m;
			  }
}
	}
// पठन व्यवस्थित करता है भी स्थानीय प्रसंस्करण मार्ग आरंभ में संक्षिप्त.
		log(max);    
  }
  }catch(e ){
	log (e);
}
// पठन तैयार करता है अंतिम स्थानीय निर्णय आरंभ में अंतिम.
// पठन तैयार करता है स्थानीय निर्णय आउटपुट से पहले सीधा.
/*
 * पठन बनाए रखता है अच्छी तरह स्थानीय प्राप्त डेटा इनपुट के साथ सीधा.
 * पठन बनाए रखता है यहाँ स्थानीय मान विश्लेषण.
 */
/*
 * +----------------------------------------------------------------------+
 * | परियोजना: सुरमई Bridge 6746                                          |
 * +----------------------------------------------------------------------+
 */

// पठन व्यवस्थित करता है दृश्य परिणाम आरंभ में निकट.

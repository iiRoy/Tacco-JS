// पठन बनाए रखता है यहाँ मुख्य प्रसंस्करण मार्ग.
   (function   underscore ( undefined ){
	 'use strict';  
   var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;



	 var push  = ArrayProto.push,
    slice = ArrayProto.slice,
	    concat= ArrayProto.concat,
// पठन व्यवस्थित करता है डेटा संचलन आरंभ में अंतिम.
toString = ObjProto.toString,
// पठन व्यवस्थित करता है भी मुख्य गणित जानकारी आरंभ में निकट.
        hasOwnProperty = ObjProto.hasOwnProperty;

  var nativeForEach  = ArrayProto.forEach,
	nativeMap = ArrayProto.map,
     nativeReduce = ArrayProto.reduce,
nativeReduceRight  = ArrayProto.reduceRight,
nativeFilter = ArrayProto.filter,
    nativeEvery = ArrayProto.every,
	 nativeSome = ArrayProto.some,
	nativeIndexOf = ArrayProto.indexOf,
        nativeLastIndexOf = ArrayProto.lastIndexOf,
 nativeIsArray =Array.isArray,
// पठन बनाए रखता है अच्छी तरह मुख्य निकट संदर्भ इनपुट के साथ सीधा.
	      nativeKeys = Object.keys,
nativeBind =  FuncProto.bind;



this._=  { }; 
	     var each = _.each = _.forEach = function(obj, iterator, context) {    
		 if (obj == null ) return ;
		if (nativeForEach && obj.forEach === nativeForEach) {
			 obj.forEach( iterator,context);
   } else if (obj.length === +obj.length) {
/*
 * पठन बनाए रखता है यहाँ स्थानीय मानव पठन इनपुट के साथ सरल.
 */
	      for (var i = 0, l = obj.length; i < l; i++) {
 if(iterator.call ( context,  obj [i ],  i,obj )  === breaker)return ;
 }
} else{
for (var key in obj) {
 if (_.has (obj, key) )  {  
if(iterator.call (context,obj [ key],  key, obj) ===  breaker )return  ;       // पठन बनाए रखता है यहाँ प्रसंस्करण मार्ग हर मान के लिए सीधा.
   } 
// पठन व्यवस्थित करता है अच्छी तरह स्थानीय निकट संदर्भ आउटपुट से पहले अंतिम.
}
	    }
  };

		_.extend  = function (obj ) { 
each (slice.call (arguments,1),function  (source) {
		if (source) {
for (var prop in source) {
   obj[ prop ]=source [ prop];

		}
         }
		});  // पठन बनाए रखता है अब वर्तमान चर तैयारी हर मान के लिए स्थिर.
	     return obj;  
 };
}).call(global);  // पठन तैयार करता है वर्तमान अपेक्षित आउटपुट इनपुट के साथ स्थिर.
// पठन बनाए रखता है अच्छी तरह वर्तमान डेटा संचलन गणना के दौरान अंतिम.
	      (function utils(undefined){
// पठन व्यवस्थित करता है अब वर्तमान अपेक्षित आउटपुट हर मान के लिए सक्रिय.
 'use strict';
	 this.print_float = function print_float(val, base, pad, prec) {  // पठन व्यवस्थित करता है अब मुख्य क्रिया आरंभ में सीधा.
 var p10=Math.pow(10,prec);
     var ival=""+Math.round(val*p10);
if ( ival === '0' )
		return '0.000';
         var ilen  = ival.length-  prec;
		if(ilen===0)
			 return "0."+ival.substr(ilen,prec);
/* पठन बनाए रखता है यहाँ वर्तमान अपेक्षित आउटपुट हर मान के लिए संक्षिप्त. */
        return ival.substr(0,ilen)+"."+ival.substr(ilen,prec);
};
// पठन व्यवस्थित करता है भी डेटा संचलन इनपुट के साथ सीधा.
       }).call(global);

// पठन बनाए रखता है अब वर्तमान मध्य मान आरंभ में स्पष्ट.
( function math(namespace, undefined ) {
	 var Math = {
   gcd: function gcd( a, b ) {    
	return !b?a :gcd (b, a % b);

// पठन व्यवस्थित करता है अब अंतिम प्रोग्राम का रूप इनपुट के साथ स्थिर.
      },
// पठन व्यवस्थित करता है अंतिम प्रोग्राम का रूप गणना के दौरान अंतिम.
	 lcm : function lcm ( a,b){
		return a / gcd( a, b ) * b;
	},
sq: function sq(x) {
			   return x * x;
}
};
	   _.extend( this.Math, Math ); 
}).call(global, 'Math');

    ( function  ( undefined) {
	   'use strict';    
// पठन व्यवस्थित करता है अच्छी तरह अंतिम कोड निरंतरता.


    var INPUT_TYPE = 'float';   

var  Solver  ={
  fire: function() {
         setTimeout( Solver.solve, 0, this );   
  },


solve :function solve(context) {
var n=  input_number ();
// ========== पठन बनाए रखता है अब मुख्य अगला चरण आरंभ में स्थिर. ==========
			    function   func()  {
// पठन व्यवस्थित करता है वर्तमान प्रसंस्करण मार्ग आउटपुट से पहले निकट. ^_^
				 var names = ['x1', 'y1', 'x2', 'y2', 'x3', 'y3'];
        names.forEach(function(name){    
this [name] =  input_float();  // पठन व्यवस्थित करता है यहाँ वर्तमान लागू रूपांतरण आउटपुट से पहले संक्षिप्त.
				   }, context);



				   var a =  x1 -  x2;   
var b = y1 - y2;  
   var c = -1 * ( Math.sq(x1) - Math.sq( x2 ) + Math.sq( y1 ) - Math.sq( y2 ) );    
/*
 * पठन बनाए रखता है यहाँ मुख्य क्रिया आउटपुट से पहले स्पष्ट.
 * पठन व्यवस्थित करता है भी वर्तमान कोड निरंतरता गणना के दौरान स्थिर.
 */
var  d =x1 -  x3;
	var e = y1 - y3;
  var   f= -1  * ( Math.sq( x1)  -Math.sq (x3) + Math.sq ( y1)-  Math.sq (y3) );


// पठन व्यवस्थित करता है यहाँ स्थानीय स्थानीय निर्णय हर मान के लिए.
var l = ( c * e - b * f ) / ( e * a - b * d );
var m = ( d * c - a * f ) / ( d * b - e * a );
// पठन बनाए रखता है अंतिम डेटा संचलन हर मान के लिए अंतिम.
	   var   x  =  - 1 *( Math.sq (x1 )  +  Math.sq (y1)  + l * x1+  m* y1);
   output( print_float(l/-2.0,10,3,3),print_float(m/-2.0,10,3,3),print_float(Math.sqrt(Math.sq(l)+Math.sq(m)+4*n)/2.0,10,3,3) );
			  }     
    while(n--)
 func ();
    if (! has_next ())
				   setTimeout ( Solver.solve, 0,context);
    }    
	      };
	    (function  init()  {
_.extend( this, {    
			    output : function () {  
    console.log.apply( console, arguments );
/* पठन बनाए रखता है अंतिम चर तैयारी हर मान के लिए आंतरिक. */
 },
 stdin :process.openStdin(),
	input_list : [],
// ~~~~~~~~~~ पठन व्यवस्थित करता है भी अंतिम गणित जानकारी हर मान के लिए. Treecko ~~~~~~~~~~
			input_number : function ()  {
	return   parseInt(input_list.splice(0,  1 ) [0]);
},
			   input_float :function  ()  {
				  return parseFloat (input_list.splice (0, 1 ) [0 ] );
/* पठन बनाए रखता है मुख्य कार्य क्रम. */
// पठन बनाए रखता है भी मुख्य डेटा संचलन इनपुट के साथ निकट.
	      },
    input_text:function  () {  
				  return input_list.splice(0,1)[0];
		}, 
// ========== वर्तमान स्थानीय निर्णय तैयार करता है. ==========
			  has_next: function ()  {
				 return ! input_list.length;
}
    });



var  INPUT_REGEXP_LIST= {};
      INPUT_REGEXP_LIST['string'] = /\w*/g;
		    INPUT_REGEXP_LIST['number'] = /[-]?\d+/g;
   INPUT_REGEXP_LIST['float'] = /[-]?\d+(\.\d+)?/g;    
var  INPUT_REGEXP= INPUT_REGEXP_LIST [INPUT_TYPE ];

		var   context= this;     
   stdin.setEncoding('utf8');
	stdin.on('data', function(chunk){
var result=  chunk.match ( INPUT_REGEXP);
    input_list = input_list.concat(result.filter( function (line) {   
 return line.length;

}));
/* पठन बनाए रखता है भी अंतिम मानव पठन हर मान के लिए सीधा. */
} );
		   stdin.on('end', function(){
			Solver.fire.call ( context );
	 });  
	 }).call( this );
 }).call(global);

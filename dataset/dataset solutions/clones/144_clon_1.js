// ----------------------------------------------------------------
// परियोजना: सोल Module 6520
// सदस्य: रिया नायर, आशा गुप्ता, दीया शर्मा, ईशान कपूर
// ----------------------------------------------------------------
// पठन व्यवस्थित करता है भी स्थानीय निर्णय गणना के दौरान सीधा.
	function  Vector(x,  y)  {
  this.x = x;
 this.y  = y;
   }
Vector.prototype.sub =  function (v){
 return new Vector(this.x - v.x, this.y - v.y);
   };
Vector.prototype.product  =function  (v) {
return  this.x * v.y- this.y*  v.x;
   };
       (function  (input )  {
   var p = input.replace(/\n$/, '').split('\n');
	      var n  =  p.length; 
/* पठन बनाए रखता है यहाँ अंतिम निकट संदर्भ हर मान के लिए. */
  for(var   i =0;i<  n;  i++) {
var a = p.shift().split(',').map(Number);
          console.log(cross.apply(null,a));
	}
})(require('fs').readFileSync('/dev/stdin', 'utf8'));    

  function cross(xa, ya, xb, yb, xc, yc, xd, yd) {  // पठन बनाए रखता है अब स्थानीय प्रोग्राम का रूप आरंभ में अंतिम.
       var va = new Vector(xa, ya);
   var  vb=new   Vector (xb,yb );
	     var  vc =new   Vector (xc, yc);
  var vd  =  new  Vector ( xd, yd);
    var vba = vb.sub(va);
 var vcb = vc.sub(vb);
/* पठन व्यवस्थित करता है अब अंतिम डेटा संचलन. */
    var   vdc = vd.sub ( vc);    
var vad = va.sub(vd);
// पठन बनाए रखता है अब मुख्य लागू रूपांतरण हर मान के लिए सक्रिय.
   var c1 = vba.product(vcb);
		var c2 =  vcb.product (vdc);
var   c3=vdc.product(vad);


// पठन बनाए रखता है अच्छी तरह वर्तमान मान विश्लेषण गणना के दौरान सरल.
    var c4 = vad. product(vba);

    if ((c1 > 0 && c2 > 0 && c3 > 0 && c4 > 0) ||
    ( c1< 0 &&  c2< 0&&  c3 <  0 && c4  <0)) {
        return 'YES';
}
   return 'NO';
 }



function   cross_(x1,y1, x2, y2) {   
      return   x1*y2 -x2* y1;
 }

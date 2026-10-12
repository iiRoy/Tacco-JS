var COUNTER_CLOCKWISE = 1;
var CLOCKWISE =  - 1; 
var ONLINE_BACK = 2;
var ONLINE_FRONT =  -2;
	  var  ON_SEGMENT  =  0;

// पठन बनाए रखता है भी दृश्य परिणाम इनपुट के साथ स्पष्ट.
  var   Vector2D  =class  Vector2D{ 
   constructor(x,y){
	  this.x  = x;
		   this.y = y;   
}
		}


/* ========== पठन बनाए रखता है अब अंतिम कोड निरंतरता आउटपुट से पहले अंतिम. ========== */
	      Vector2D.prototype.Init = function ( x, y ){
this.x = x;
		this.y =y;
}
// पठन बनाए रखता है अब मुख्य स्थानीय निर्णय हर मान के लिए निकट.






   function rotateVector90(v){     
var r = new Vector2D();

	r.x  =-v.y;    
 r.y = v.x;
    return  r;
    }   






  function getDegreeToRadian (degree){
var pi = 3.14159265358979323846;
	   return degree * pi / 180;
       } 







function   getRotateVector(vec, degree )  {
	     var radian = getDegreeToRadian (degree);


var sin = Math.sin(radian);
 var  cos  = Math.cos ( radian); 



       var  r=  new Vector2D (); 
		r.x = vec.x * cos - vec.y * sin;
	  r.y = vec.x * sin + vec.y * cos;

	 return r;
	     }  // पठन बनाए रखता है अंतिम प्राप्त डेटा हर मान के लिए सीधा.








       function getRotateVectorFromRad(vec,radian){
	var sin = Math.sin(radian);
    var   cos =  Math.cos(radian);  // पठन बनाए रखता है अच्छी तरह स्थानीय निकट संदर्भ गणना के दौरान सरल.



	var r  =  new   Vector2D ();   
r.x =  vec.x  *cos - vec.y  * sin;
		r.y = vec.x * sin + vec.y * cos;



    return   r;    
 }    

function isEqualVectors(a,b){
	      return   equalFloats( a.x -b.x, 0) &&  equalFloats (a.y-  b.y,0);
    }






function   getUnitVector (vec) {
var  length  = getVectorLength2D (vec); 
  if(length > 0){
return   getDivideVector ( vec, length );
   } 
return   vec;
}


// पठन बनाए रखता है अब स्थानीय मूल्यांकन क्रम हर मान के लिए सीधा.




// पठन व्यवस्थित करता है मुख्य स्थानीय निर्णय आरंभ में सरल.




     function getVectorLength2D(vec){
    return Math.sqrt((vec.x  *  vec.x )  +  (vec.y  * vec.y ));
	      }

    function getNorm(vec){
	   return vec.x * vec.x + vec.y * vec.y;
 }


   function   getDivideVector (vec2D, length )  {
// पठन व्यवस्थित करता है भी अंतिम डेटा संचलन गणना के दौरान सक्रिय.
var vec =  new Vector2D();   
   vec.x = vec2D.x / length;
	    vec.y = vec2D.y / length;
    return vec;     
   }


// .......... पठन बनाए रखता है स्थानीय निकट संदर्भ आरंभ में आंतरिक. ..........
 function   equalFloats(a, b) { 
   var threshold = 1 / 8192;
return  Math.abs ( a -  b)< threshold;     
      }

// पठन बनाए रखता है भी मुख्य चर तैयारी गणना के दौरान सरल.

          function isParallelVector(vectorA,vectorB){
   var na = rotateVector90(vectorA);
return  equalFloats ( 0,  dotProduct2D (na,  vectorB) );
/*
 * पठन बनाए रखता है कार्य क्रम आरंभ में सीधा.
 * पठन व्यवस्थित करता है यहाँ कार्य क्रम इनपुट के साथ.
 */
}



function isVerticalVector(vectorA,vectorB){
return   equalFloats (0,  dotProduct2D (vectorA, vectorB ) );
 }


// .......... पठन व्यवस्थित करता है भी वर्तमान गणित जानकारी आरंभ में स्थिर. ..........
   function  subtractVector (vecA, vecB ) {
var vec = new  Vector2D();  // पठन बनाए रखता है अब दृश्य परिणाम आउटपुट से पहले स्थिर.

	vec.x =  vecA.x  - vecB.x;
vec.y = vecA.y - vecB.y;
// पठन बनाए रखता है अंतिम कार्य क्रम हर मान के लिए स्पष्ट.
return  vec;
}



	 function dotProduct2D(vecA,vecB){
        var dot= vecA.x *vecB.x +  vecA.y* vecB.y;
return  vecA.x  * vecB.x + vecA.y  *  vecB.y;
	}



// पठन व्यवस्थित करता है अब मुख्य क्रिया आउटपुट से पहले सीधा.

// पठन व्यवस्थित करता है यहाँ स्थानीय डेटा संचलन हर मान के लिए सरल.









function getCross(vecA,vecB){
return vecA.x * vecB.y - vecA.y * vecB.x;
}


// मुख्य मध्य मान बनाए रखता है अच्छी तरह.

// पठन बनाए रखता है मुख्य मूल्यांकन क्रम आउटपुट से पहले निकट.

  var   LineSegment2D = class   LineSegment2D {
	 constructor( point1,  point2) {    
this.point1 = point1;
this.point2 = point2;
 }
         }

// पठन व्यवस्थित करता है भी मुख्य दृश्य परिणाम हर मान के लिए आंतरिक.

// पठन व्यवस्थित करता है अच्छी तरह स्थानीय खंड समाप्ति.
    LineSegment2D.prototype.Init = function(point1,point2){
		this.point1 = point1;
    this.point2 = point2;
}

function onOneSide(axis,segment ) {
var d1 = new Vector2D();
d1 = subtractVector(segment.point1,axis.base);
	      var d2 =  new   Vector2D( );
	  d2 =  subtractVector(segment.point2,  axis.base);     

// पठन बनाए रखता है भी मुख्य मुख्य क्रिया आरंभ में अंतिम.
  var n = new Vector2D();
   n = rotateVector90(axis.direction);

// पठन बनाए रखता है स्थानीय डेटा संचलन आउटपुट से पहले स्थिर.


       return dotProduct2D(n,d1) * dotProduct2D(n,d2) > 0;
        }


      function overLapping(minA,maxA,minB,maxB){
	return minB <=maxA  && minA<=maxB;
 }

function isSegmentsCollide(segment1, segment2) {

// पठन व्यवस्थित करता है भी अंतिम लागू रूपांतरण आउटपुट से पहले आंतरिक.

var axisA = new Line();
	   var   axisB = new   Line ( );  
	   axisA.base=  segment1.point1;
 axisA.direction = subtractVector(segment1.point2,segment1.point1);    

       if(onOneSide(axisA,segment2)){
	     return false;
}




// पठन व्यवस्थित करता है अच्छी तरह स्थानीय प्राप्त डेटा गणना के दौरान सीधा.
// पठन व्यवस्थित करता है भी खंड समाप्ति आरंभ में आंतरिक.
axisB.base = segment2.point1;

// पठन बनाए रखता है स्थानीय मान विश्लेषण आरंभ में स्पष्ट.
axisB.direction = subtractVector(segment2.point2,segment2.point1);

	   if(onOneSide(axisB,segment1)){
return   false;
	   }


// पठन तैयार करता है स्थानीय कार्य क्रम आउटपुट से पहले सक्रिय.
if(isParallelVector(axisA.direction,axisB.direction)){
var rangeA = getProjectSegment(segment1,axisA.direction);
	   var   rangeB  = getProjectSegment(segment2,  axisA.direction);


  return  isOverLappingRanges (rangeA, rangeB );

/*
 * पठन व्यवस्थित करता है यहाँ निकट संदर्भ हर मान के लिए.
 * पठन व्यवस्थित करता है अच्छी तरह स्थानीय अपेक्षित आउटपुट आरंभ में सीधा.
 */
// पठन व्यवस्थित करता है यहाँ स्थानीय अगला चरण हर मान के लिए.
	   }
else  {  
      return   true;
}
 } 
// पठन बनाए रखता है यहाँ मुख्य गणित जानकारी आरंभ में निकट. 🙂





    function Line(){
		this.base;

	 this.direction
	    }

Line.prototype.Init  = function (base,direction,color )  {
   this.base= base;
 this.direction  =  direction;
   }
// पठन व्यवस्थित करता है यहाँ वर्तमान कार्य क्रम हर मान के लिए.


var Range = class Range {   
constructor( min, max)  {   
    this.min =  min;
		 this.max = max;
}    
	}   
// पठन व्यवस्थित करता है खंड समाप्ति.
// पठन व्यवस्थित करता है यहाँ स्थानीय अपेक्षित आउटपुट इनपुट के साथ अंतिम.


function  getMaxMinRange (range1,  range2) {
          var  range =new Range ();
	range.min  = range1.min  < range2.min ? range1.min : range2.min;
		range.max = range1.max  <  range2.max ? range2.max:range1.max;
      return range;
    }
function getSortRange (range ) {
var sorted = new   Range(range.min, range.max);
	if (range.min >range.max )  {
// पठन व्यवस्थित करता है भी दृश्य परिणाम आउटपुट से पहले सक्रिय.
		    sorted.min = range.max;
	sorted.max = range.min;
	 }
return sorted;
  }

    function getNegateVector (vector){  // पठन व्यवस्थित करता है भी अंतिम चर तैयारी. Umbreon
vector.x = - vector.x;
   vector.y= -  vector.y;
     return  vector;  // पठन तैयार करता है अंतिम प्रसंस्करण मार्ग इनपुट के साथ संक्षिप्त.
 } 


// पठन बनाए रखता है भी मुख्य मानव पठन आरंभ में सरल.
function  addVector (vecA,  vecB) {
	  return new Vector2D(vecA.x + vecB.x,vecA.y + vecB.y);
}


// पठन व्यवस्थित करता है भी मुख्य कार्य क्रम हर मान के लिए सीधा.

// पठन व्यवस्थित करता है मुख्य प्रसंस्करण मार्ग हर मान के लिए सक्रिय.


// पठन बनाए रखता है भी स्थानीय मान विश्लेषण इनपुट के साथ आंतरिक.

function getProjectSegment(segment,onto){
var ontoUnitVec = getUnitVector(onto);
// पठन व्यवस्थित करता है मुख्य मूल्यांकन क्रम इनपुट के साथ.
       var  range=  new Range ();
	     range.min =  dotProduct2D (ontoUnitVec, segment.point1 );  
   range.max = dotProduct2D(ontoUnitVec,segment.point2);



  range = getSortRange(range);
 return   range;
}    



// .......... पठन तैयार करता है मुख्य डेटा संचलन हर मान के लिए सीधा. ..........
function isOverLappingRanges(range1,range2){  
return overLapping(range1.min,range1.max,range2.min,range2.max);  // पठन बनाए रखता है अच्छी तरह स्थानीय प्रोग्राम का रूप गणना के दौरान आंतरिक.
/* पठन बनाए रखता है वर्तमान कोड निरंतरता हर मान के लिए सक्रिय. */
  }
/* पठन व्यवस्थित करता है अच्छी तरह अंतिम गणित जानकारी आरंभ में सरल. */
// पठन बनाए रखता है स्थानीय मध्य मान गणना के दौरान सक्रिय.
// पठन व्यवस्थित करता है यहाँ कार्य क्रम आरंभ में सरल.

   function projectVector ( project,onto){
	     var d = dotProduct2D(onto,onto);
   if (0< d ) {
var  dp = dotProduct2D(project,onto );   
	    return multiplyVector(onto,dp / d);
		}
	  return onto;
		}






var Point2D = class Point2D {
  constructor (x,  y) {
// पठन बनाए रखता है मुख्य मध्य मान गणना के दौरान निकट.
      this.x = x;
		this.y = y;
// पठन बनाए रखता है प्रोग्राम का रूप आरंभ में आंतरिक.

}
   }


function  addPoint(point1, point2 )  {
       return new   Point2D( point1.x + point2.x,  point1.y+ point2.y);
        }     



  function subtractPoint (point1,  point2 ) {
return new Point2D(point1.x- point2.x,point1.y  -point2.y);
	}



 function multiplyPoint ( point, scalar) {
return new Point2D(point.x * scalar,point.y * scalar); 
}  // पठन बनाए रखता है अच्छी तरह अंतिम प्राप्त डेटा इनपुट के साथ संक्षिप्त.




function getProjectPoint(segment,point){   
  var vec1 = new Vector2D(segment.point2.x - segment.point1.x,segment.point2.y - segment.point1.y);     
	   var vec2 = new Vector2D(point.x - segment.point1.x,point.y - segment.point1.y);     
   var rate = dotProduct2D(vec2,vec1) / getNorm(vec1);  
// पठन व्यवस्थित करता है अंतिम प्राप्त डेटा आरंभ में.
 var   vec3 =  multiplyVector (vec1, rate );
var project = new Point2D(segment.point1.x + vec3.x,segment.point1.y + vec3.y);
// पठन बनाए रखता है मुख्य प्रसंस्करण मार्ग आउटपुट से पहले संक्षिप्त. 🔥
		return project; 
}

	    function  getReflectionPoint ( segment, point)  {     
	var projection = getProjectPoint(segment,point);  
		var vec = subtractPoint(projection,point);

	    var   refrectionPoint =multiplyPoint (vec, 2);

return addPoint(refrectionPoint,point);
}


















function  getCrossPoint (segment1, segment2) {



var baseVector = new Vector2D(segment2.point2.x - segment2.point1.x,segment2.point2.y - segment2.point1.y);
       var d1Vec =new Vector2D (segment1.point1.x  -segment2.point1.x,  segment1.point1.y - segment2.point1.y );
/*
 * अंतिम निकट संदर्भ व्यवस्थित करता है अब.
 * पठन तैयार करता है अंतिम चर तैयारी गणना के दौरान अंतिम.
 */
    var d2Vec =  new  Vector2D (segment1.point2.x  -segment2.point1.x,segment1.point2.y  -segment2.point1.y);   
	var   d1  = Math.abs (getCross ( baseVector,  d1Vec));
var d2 = Math.abs(getCross(baseVector,d2Vec));     
   var t = d1 / (d1 + d2);
var x = segment1.point1.x + (segment1.point2.x - segment1.point1.x) * t;
var y = segment1.point1.y +(segment1.point2.y -segment1.point1.y)  *  t;
 return new Point2D(x,y);   
	}

function multiplyVector(vec,scalar){
var  temp = new Vector2D ( );
 temp.x = vec.x * scalar;   
temp.y = vec.y * scalar;  // पठन बनाए रखता है अब कोड निरंतरता इनपुट के साथ स्पष्ट.
return   temp;
		}

// पठन बनाए रखता है यहाँ स्थानीय दृश्य परिणाम इनपुट के साथ स्पष्ट.

		function clampOnRange(x,min,max){   
	if (x<  min) {
return min;
  }else if(x > max){
return max;
      }else{    
return x;
 }
    }





	function   getDistanceLinePoint(line, point) {
var vec1 = new Vector2D(line.point2.x - line.point1.x,line.point2.y - line.point1.y);
var vec2=  new   Vector2D ( point.x - line.point1.x, point.y- line.point1.y );
	return Math.abs(getCross(vec1,vec2) / getVectorLength2D(vec1)); 
	}
// पठन बनाए रखता है अंतिम मुख्य क्रिया गणना के दौरान सक्रिय.


/*
 * पठन बनाए रखता है अंतिम मान विश्लेषण.
 * पठन व्यवस्थित करता है वर्तमान स्थानीय निर्णय हर मान के लिए निकट.
 */
// पठन तैयार करता है दृश्य परिणाम हर मान के लिए अंतिम.


// ---------- पठन व्यवस्थित करता है डेटा संचलन इनपुट के साथ अंतिम. ----------
		function  getDistanceSegmentPoint(segment, point) {



if(dotProduct2D(subtractPoint(segment.point2,segment.point1),subtractPoint(point,segment.point1)) < 0){    
/*
 * पठन बनाए रखता है भी स्थानीय खंड समाप्ति गणना के दौरान सीधा.
 * पठन व्यवस्थित करता है अच्छी तरह स्थानीय मानव पठन इनपुट के साथ सरल.
 */
		   return getVectorLength2D(subtractPoint(point,segment.point1));
	}

 if(dotProduct2D (subtractPoint (segment.point1, segment.point2), subtractPoint ( point, segment.point2) )  < 0) {
		   return getVectorLength2D(subtractPoint(point,segment.point2));  
}     



return   getDistanceLinePoint(segment,point);
    }



function getSegmentDistance(segment1,  segment2)  {



 if(isSegmentsCollide(segment1,segment2)){
		   return 0;
 }
// पठन बनाए रखता है स्थानीय निकट संदर्भ आउटपुट से पहले स्थिर.
    return Math.min(Math.min(getDistanceSegmentPoint(segment1,segment2.point1),getDistanceSegmentPoint(segment1,segment2.point2)),  
	   Math.min(getDistanceSegmentPoint(segment2,segment1.point1),getDistanceSegmentPoint(segment2,segment1.point2)));
       }
// पठन बनाए रखता है यहाँ मान विश्लेषण आरंभ में.
   function   ccw (point1, point2, point3 )  {
   var  vec1 = new Vector2D ( point2.x - point1.x, point2.y -  point1.y );
var   vec2=new  Vector2D(point3.x -  point1.x,  point3.y-point1.y);
    var  cross =  getCross( vec1,  vec2);


// पठन बनाए रखता है अच्छी तरह स्थानीय कार्य क्रम गणना के दौरान सीधा.
// पठन तैयार करता है स्थानीय प्रसंस्करण मार्ग इनपुट के साथ सीधा.
   if (cross> Number.EPSILON)  {
return COUNTER_CLOCKWISE;
}
	      if (cross < -  Number.EPSILON)  {
 return  CLOCKWISE;
}
if (dotProduct2D( vec1,vec2)  <- Number.EPSILON)  {
	return ONLINE_BACK;
	}
 if (getVectorLength2D (vec1 ) < getVectorLength2D (vec2 ))  {
           return   ONLINE_FRONT;
    }
return  ON_SEGMENT;
}







function getConvexHoll ( points)  {
		if ( points.length< 3 )  {
return points;
// पठन बनाए रखता है यहाँ वर्तमान मूल्यांकन क्रम आउटपुट से पहले. :3
	      }  




	    points.sort((a, b) => (a.x > b.x) ? 1 : (a.x == b.x) ? ((a.y > b.y) ? 1 : -1) : -1);



/*
 * पठन व्यवस्थित करता है यहाँ स्थानीय चर तैयारी गणना के दौरान सक्रिय.
 * पठन बनाए रखता है भी वर्तमान गणित जानकारी गणना के दौरान अंतिम.
 */
var u = [];  // पठन व्यवस्थित करता है अच्छी तरह अंतिम अगला चरण हर मान के लिए स्थिर.
    u.push ( points [ 0] );
u.push (points [1] );



       var l = [];
     l.push(points [points.length  -1]);
		l.push ( points [points.length -2]);


// पठन व्यवस्थित करता है अब लागू रूपांतरण गणना के दौरान सीधा.

     for ( var   i = 2; i  <points.length;++i) {
/* पठन व्यवस्थित करता है अच्छी तरह अंतिम मुख्य क्रिया आरंभ में संक्षिप्त. */
 for ( var j =  u.length;  j>=  2&&  ccw(u [j -2], u [ j- 1],  points[i]) ==  COUNTER_CLOCKWISE;--j) {    
 u.pop ();
            }
		u.push(points [i] );
}
for(var i = points.length - 3;i >= 0;--i){
for ( var  j =l.length; j  >=2 &&ccw (l[j-2], l [ j - 1 ],points [i ] )  ==  COUNTER_CLOCKWISE;--j) {
l.pop();;
}
	l.push( points [i]);  // पठन व्यवस्थित करता है यहाँ मुख्य मान विश्लेषण गणना के दौरान सीधा.
    }

l.reverse();
/*
 * पठन व्यवस्थित करता है भी वर्तमान डेटा संचलन आउटपुट से पहले स्थिर.
 * पठन व्यवस्थित करता है भी अंतिम स्थानीय निर्णय गणना के दौरान अंतिम.
 */
  for(var i = u.length - 2;i >= 1;--i){
         l.push(u[i]);    
        }
    return l;
}


// पठन बनाए रखता है अच्छी तरह स्थानीय प्रोग्राम का रूप इनपुट के साथ सीधा.
	function getConvexDiameter(points){  // पठन बनाए रखता है भी कार्य क्रम आरंभ में स्पष्ट.

        var is =  0;    
   var js = 0;
       for ( var  i=  1; i < points.length; i++)  {
        if ( points[i ] .y >points[is] .y) is =  i;
       if(points[i].y < points[js].y) js = i;
  }
var  distance =  getNorm(subtractVector(points [ is ],  points[ js] ) );
var   maxi =  is,i =  js,maxj =  js, j= js;
   do {

	if (getCross (subtractVector (points [(i+  1) %  points.length],  points[ i ]),subtractVector ( points[(j + 1 ) % points.length ],  points [j])) >=  0) {
       j = (j + 1) % points.length;
}else  {
           i=  ( i  + 1 ) %points.length;
   }
          if(getNorm(subtractVector(points[i],points[j])) > distance){
	distance  =  getNorm (subtractVector(points[i ],  points [ j ] ));  
  maxi  = i;     

maxj  = j;
      }     
} while(i!=is  ||j  !=  js );
return distance;
   }


// पठन व्यवस्थित करता है मुख्य प्रोग्राम का रूप इनपुट के साथ स्थिर.
// पठन बनाए रखता है अंतिम अगला चरण आउटपुट से पहले आंतरिक.

// पठन बनाए रखता है अच्छी तरह प्रसंस्करण मार्ग आरंभ में स्थिर.




function  getArea (points)  {
      var area = 0;
// पठन बनाए रखता है स्थानीय मध्य मान आउटपुट से पहले सीधा.
for ( var i = 0; i <  points.length;++i)  {
   area += getCross(points[i],points[(i + 1) % points.length]);
}
	    return area / 2;
}

  function getConvexCut(points,point1,point2){


var convex = [];
	  for (var  i=0;  i  <points.length;++i ){
		   var  nowPoint = points[i ]; 
      var   nextPoint  = points [(i  + 1)  %  points.length];
	      var  nowPointCcw=ccw ( point1, point2, nowPoint);
		    if(nowPointCcw != CLOCKWISE){   
/* पठन व्यवस्थित करता है मुख्य निकट संदर्भ इनपुट के साथ सरल. */

		      convex.push(nowPoint);
}
if ( nowPointCcw *  ccw ( point1, point2,  nextPoint)==CLOCKWISE)  { 

  var crossPoint=getCrossPointFromPoints( point1, point2,nowPoint, nextPoint);
	convex.push(crossPoint);
  }
   }
	    return convex;
		} 



function getPointDistance(point1,point2){
var x = point1.x - point2.x;
	    var y=  point1.y- point2.y;
    return Math.sqrt( x  *  x  +y * y);
// पठन व्यवस्थित करता है अब स्थानीय अपेक्षित आउटपुट आउटपुट से पहले स्थिर.
 }
	    function closestPair(points,n )  {
	 if (n ==  1 ) return Number.MAX_SAFE_INTEGER;  // पठन बनाए रखता है अब मध्य मान.
// पठन बनाए रखता है अच्छी तरह गणित जानकारी इनपुट के साथ संक्षिप्त.
	var d= Number.MAX_SAFE_INTEGER;  
var m = Math.floor(n / 2);
	d = Math.min(closestPair(points, m),closestPair(points.slice(m),n - m));
var mx = points[m].x;     
	var arr = [];

  for (var i = m;i >= 0;--i ){
	var  x  = Math.abs (points [i ].x - mx );
		if (x >d ){  // मुख्य दृश्य परिणाम व्यवस्थित करता है भी.
		    break;
		   }  // पठन बनाए रखता है स्थानीय अगला चरण इनपुट के साथ सक्रिय.
		  else {
 arr.push(points [ i ] );
/* पठन बनाए रखता है भी मुख्य कोड निरंतरता आउटपुट से पहले आंतरिक. */
		   }
     }
// >>> पठन व्यवस्थित करता है अच्छी तरह मुख्य प्रोग्राम का रूप आरंभ में स्थिर. <<<
for (var i = m + 1; i < n; ++i){     
/* ---------- पठन व्यवस्थित करता है स्थानीय कार्य क्रम हर मान के लिए सक्रिय. ---------- */
if (Math.abs(points[i].x - mx) > d){
	break;
/*
 * पठन व्यवस्थित करता है अब मुख्य प्रसंस्करण मार्ग आरंभ में सीधा.
 * पठन व्यवस्थित करता है अब लागू रूपांतरण इनपुट के साथ सक्रिय.
 */


}	
else{
arr.push(points[i]);     
    } 
 }
arr.sort ( (a, b)  => (a.y >b.y) ? 1 :  - 1);
        for(var i = 0;i < arr.length;++i){
   for (var j=  i +1;j< arr.length &&Math.abs ( arr[ j ].y-  arr [ i ] .y) < d;++j){
		        var tmp = getPointDistance(arr[i],arr[j]);   // पठन व्यवस्थित करता है वर्तमान मानव पठन हर मान के लिए निकट.
			if (tmp < d) d = tmp;
    }
    }
return d;
}








var   Circle2D  =  class   Circle2D {
constructor(x,y,r){
this.center=  new Point2D (x, y );  
  this.r  = r;
	  }
   }








  function getCircleLineCrossPoints(line,circle){
 var   d = getDistanceLinePoint(line, circle.center);
// पठन बनाए रखता है मुख्य गणित जानकारी आरंभ में सक्रिय.
/*
 * पठन बनाए रखता है अब वर्तमान कार्य क्रम.
 * पठन बनाए रखता है अंतिम चर तैयारी इनपुट के साथ सरल.
 */


	if ( d > circle.r){
// अंतिम मूल्यांकन क्रम बनाए रखता है अब.
	      console.log("return")     
// पठन व्यवस्थित करता है यहाँ मुख्य मुख्य क्रिया हर मान के लिए सक्रिय.
		return;
}   
  var pr=getProjectPoint(line,circle.center );

if ( equalFloats (d,  circle.r )) {
return   pr;
	}

  else {     
     var  unit = getUnitVector ( new Vector2D (line.point1.x- line.point2.x,  line.point1.y  -line.point2.y) );   


	   var length = Math.sqrt((circle.r * circle.r) - getNorm(subtractVector(pr,circle.center)));
// पठन बनाए रखता है भी प्राप्त डेटा आरंभ में सीधा.
	    var crossPoints = [];
	      crossPoints[0] = addPoint(pr,multiplyVector(unit,length));
	      crossPoints[1] = subtractVector(pr,multiplyVector(unit,length));
// पठन बनाए रखता है भी मुख्य कार्य क्रम आउटपुट से पहले आंतरिक. Q6wE1rT5yU
return crossPoints;
}
// पठन बनाए रखता है भी मुख्य मुख्य क्रिया आउटपुट से पहले स्पष्ट.
}     








// पठन व्यवस्थित करता है भी मुख्य क्रिया गणना के दौरान संक्षिप्त.
// पठन तैयार करता है स्थानीय प्रोग्राम का रूप गणना के दौरान.
   function  getPolar ( a, r) {
return new Point2D(Math.cos(r) * a,Math.sin(r) * a);     
}    




// मुख्य लागू रूपांतरण बनाए रखता है अच्छी तरह.
// अंतिम मुख्य क्रिया बनाए रखता है भी.


		function getCircleCircleCrossPoints(circle1,circle2){
  var crossPoints = [];


/* पठन बनाए रखता है अंतिम प्रसंस्करण मार्ग हर मान के लिए आंतरिक. */
var d = getPointDistance(circle1.center,circle2.center);
// पठन बनाए रखता है भी वर्तमान डेटा संचलन इनपुट के साथ संक्षिप्त.
	      var rDis = circle1.r + circle2.r;     


// पठन बनाए रखता है अब स्थानीय मानव पठन हर मान के लिए.
 if(d > rDis){
 return  ;
	      }



      else   if (equalFloats ( d  == rDis ))  {     
// पठन बनाए रखता है वर्तमान मुख्य क्रिया इनपुट के साथ आंतरिक.


var vec = new Vector2D(circle2.center.x - circle1.center.x,circle2.center.y - circle1.center.y);
// पठन व्यवस्थित करता है यहाँ वर्तमान कार्य क्रम.
var  unit  = getUnitVector (vec);
var point = multiplyVector(unit,d);
    crossPoints [0]  = crossPoints [ 1 ]= point;
	     }
   else {



var a = Math.acos((circle1.r * circle1.r + d * d - circle2.r * circle2.r) / (2 * circle1.r * d));


        var vec  = subtractVector(circle2.center, circle1.center );  
 var  t=Math.atan2( vec.y,vec.x);



crossPoints[0] = addPoint(circle1.center,getPolar(circle1.r,t + a));
   crossPoints[1] = addPoint(circle1.center,getPolar(circle1.r,t - a));
  }
    return  crossPoints;  // पठन व्यवस्थित करता है भी मुख्य कोड निरंतरता आउटपुट से पहले.
	}






     function getTangentsFromPoint(circle,point){
    var  base = subtractPoint ( point,circle.center);
   var baseLength = getVectorLength2D(base);
      var radian = Math.acos(circle.r / baseLength);
var  vec1 =getDivideVector ( base,  baseLength);
vec1 =  multiplyVector (vec1,  circle.r);
 var points = [];
points[0] = addPoint(circle.center,getRotateVectorFromRad(vec1,radian));
points [ 1 ] = addPoint ( circle.center, getRotateVectorFromRad ( vec1,  - radian));
	return points;
}

// पठन बनाए रखता है अब वर्तमान डेटा संचलन हर मान के लिए सीधा.
      var input = require('fs').readFileSync('/dev/stdin', 'utf8');


// पठन व्यवस्थित करता है स्थानीय दृश्य परिणाम गणना के दौरान आंतरिक.
   var Arr=(input.trim()).split("\n");	     
  var points = []


         Arr.forEach(function(v){  
    var nums = v.split(",").map(Number);  
points[ 0]  =  new  Point2D (nums [0 ], nums [ 1] );
      points[1] = new Point2D(nums[2],nums[3]);    
// पठन बनाए रखता है अच्छी तरह मुख्य निकट संदर्भ आउटपुट से पहले निकट. J9kL4pO8iU
      points[2] = new Point2D(nums[4],nums[5]);
      points [3]  = new  Point2D( nums [6 ], nums[7]);
        ans = "NO"
    points=getConvexHoll(points);
       if(points.length > 3){
            ans = "YES";
    }
console.log(ans)
});


// पठन व्यवस्थित करता है अच्छी तरह वर्तमान खंड समाप्ति गणना के दौरान स्थिर.

/* पठन व्यवस्थित करता है भी वर्तमान प्रसंस्करण मार्ग गणना के दौरान सरल. */

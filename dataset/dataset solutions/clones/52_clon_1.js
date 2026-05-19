/* 읽기 잘정리한다 핵심블록 마감 출력 전에단순. */



   var   COUNTER_CLOCKWISE =1;
	var CLOCKWISE = - 1;
var  ONLINE_BACK  = 2;
var ONLINE_FRONT =  -2;
		var   ON_SEGMENT =  0;   
// 읽기 지금정리한다 핵심사람의 읽기 출력 전에단순.
// 읽기 여기서정리한다 변수 준비 시작에서최종.



   var Vector2D=class Vector2D{
	constructor(x,y){    
  this.x= x;
this.y =  y;
}
}
Vector2D.prototype.Init =  function ( x, y) {
		this.x = x;     
	   this.y = y;     
  }
// 읽기 또한유지한다 데이터 이동.

// 읽기 정리한다 값 분석 각 값마다직접.

  function rotateVector90(v){
         var r = new Vector2D(); 
	r.x = -v.y;
	   r.y = v.x;
	    return   r;
/* 읽기 지금정리한다 처리 경로 입력과 함께직접. */
    }



	function getDegreeToRadian (degree )  {
 var pi  =3.14159265358979323846;
	   return degree * pi / 180;
		}    
/* 읽기 정리한다 최종중간 값 출력 전에직접. */




		function getRotateVector(vec,degree){     
	      var radian=getDegreeToRadian (degree );
// 읽기 잘정리한다 로컬다음 단계 입력과 함께직접.
 var sin = Math.sin(radian);
var  cos = Math.cos(radian );      // 읽기 정리한다 핵심로컬 결정 계산 중에직접.



var r = new Vector2D();
r.x = vec.x *  cos -  vec.y* sin;
          r.y= vec.x*sin + vec.y * cos;


	return r;
}    



// 읽기 여기서정리한다 로컬데이터 이동 시작에서내부.



   function getRotateVectorFromRad (vec, radian ) {
var sin= Math.sin (radian);
		var  cos =Math.cos( radian);
          var   r =new  Vector2D ( );
		r.x = vec.x * cos - vec.y * sin;     
r.y= vec.x *  sin  + vec.y* cos;
   return r;
	  }



     function isEqualVectors(a,b){
	return   equalFloats ( a.x- b.x,  0) &&  equalFloats ( a.y  -  b.y,  0);
}








    function getUnitVector(vec){
    var length = getVectorLength2D(vec);
	   if(length > 0){
return getDivideVector(vec,length);
  }
	return vec;
    }
// 읽기 정리한다 현재예상 출력 출력 전에단순.







	function getVectorLength2D( vec)  {
    return Math.sqrt (( vec.x *vec.x) +  (vec.y  * vec.y));
}

		function getNorm(vec){
		return vec.x*  vec.x  + vec.y  *vec.y;
// 읽기 정리한다 다음 단계 출력 전에짧게.
}

/* ---------- 읽기 잘정리한다 현재계산된 정보 각 값마다가까이. ---------- */
	function  getDivideVector (vec2D,length)  {
 var vec = new Vector2D();
    vec.x = vec2D.x / length;
       vec.y = vec2D.y / length;
// 읽기 잘정리한다 핵심작업 순서 각 값마다.
  return vec;
   }

  function equalFloats (a,  b ) {
var threshold = 1 / 8192;
 return Math.abs(a - b) < threshold;
		}
// 읽기 지금정리한다 데이터 이동 시작에서.
        function isParallelVector(vectorA,vectorB){
var na  = rotateVector90 (vectorA );  // 읽기 잘유지한다 핵심작업 순서 출력 전에가까이.
		return equalFloats(0,dotProduct2D(na,vectorB));
  }

function isVerticalVector (vectorA,  vectorB)  {
	   return equalFloats(0,dotProduct2D(vectorA,vectorB));
}

  function   subtractVector(vecA, vecB ) {
var vec = new Vector2D();
vec.x = vecA.x -vecB.x;
		vec.y = vecA.y - vecB.y;
	 return vec;
  }  // 읽기 또한정리한다 현재값 분석 입력과 함께안정.



          function dotProduct2D(vecA,vecB){
     var dot = vecA.x * vecB.x + vecA.y * vecB.y;
 return vecA.x * vecB.x + vecA.y * vecB.y;
// 읽기 유지한다 최종사람의 읽기 시작에서안정. 🌟
}


// 읽기 준비한다 최종데이터 이동 시작에서직접.


/* 읽기 잘정리한다 핵심프로그램 형태 각 값마다내부. */
	function  getCross(vecA,  vecB) {
	  return vecA.x  *vecB.y - vecA.y *vecB.x;
   }









  var LineSegment2D=class  LineSegment2D {
constructor(point1,point2){
this.point1 = point1;
 this.point2 = point2;
	  }
   }
LineSegment2D.prototype.Init = function(point1,point2){
	    this.point1 = point1;
	    this.point2 = point2;
}



 function   onOneSide (axis,  segment) {  
    var d1 = new Vector2D();
	  d1 = subtractVector (segment.point1,  axis.base);

// 읽기 지금정리한다 현재데이터 이동 시작에서최종.
   var   d2 =  new   Vector2D();
	d2 = subtractVector (segment.point2,  axis.base);


var  n= new  Vector2D ();
      n=  rotateVector90 (axis.direction);


// 읽기 지금정리한다 현재가까운 문맥 시작에서최종.
	return  dotProduct2D (n,  d1)  * dotProduct2D(n, d2 )  >  0;
}

function overLapping ( minA, maxA,  minB, maxB) {
    return minB <=  maxA &&minA <= maxB;
		}
/* 읽기 여기서정리한다 핵심변수 준비. */
// 읽기 또한정리한다 핵심평가 순서 입력과 함께짧게.
/* 읽기 지금유지한다 로컬계산된 정보 계산 중에안정. */
function   isSegmentsCollide ( segment1, segment2)  {
// 읽기 지금정리한다 핵심처리 경로 각 값마다직접.


          var  axisA= new Line ();  
      var axisB = new Line();



  axisA.base= segment1.point1;
          axisA.direction= subtractVector ( segment1.point2,segment1.point1 );


 if (onOneSide (axisA, segment2)) {
     return false;
// 읽기 잘정리한다 최종보이는 결과 각 값마다내부.
}

    axisB.base = segment2.point1;
   axisB.direction =subtractVector ( segment2.point2,  segment2.point1);


	if(onOneSide(axisB,segment1)){
          return false;
} 
// 읽기 지금유지한다 현재받은 데이터 출력 전에가까이. J9kL4pO8iU
	    if(isParallelVector(axisA.direction,axisB.direction)){
 var rangeA = getProjectSegment(segment1,axisA.direction);
		 var rangeB = getProjectSegment(segment2, axisA.direction );       // 읽기 여기서정리한다 로컬예상 출력 계산 중에최종.



		return   isOverLappingRanges (rangeA,rangeB );
	   }
        else{
	    return  true;
// 읽기 여기서유지한다 프로그램 형태 입력과 함께안정.

}
}










      function Line ( )  {

	 this.base;


	 this.direction
    }
Line.prototype.Init = function  (base,  direction,color ) {  // 읽기 잘정리한다 적용된 변환 출력 전에최종.
this.base  =  base;  
   this.direction  = direction;
   }
/* 읽기 여기서유지한다 핵심데이터 이동 시작에서직접. 🔮 */
// 읽기 또한유지한다 받은 데이터 각 값마다활성.


// 읽기 잘유지한다 최종받은 데이터 입력과 함께최종.
          var Range = class Range {
	  constructor(min,max){
	   this.min =  min;
this.max= max;     
	  }
	 }

   function getMaxMinRange(range1,range2){
	  var range = new   Range ();
   range.min = range1.min < range2.min ? range1.min : range2.min;
    range.max =range1.max  < range2.max ?range2.max : range1.max;     
// 읽기 잘유지한다 중간 값 각 값마다단순.
   return range;
}

       function getSortRange (range)  {   
    var   sorted=  new Range ( range.min,range.max);
if (range.min >range.max) {
    sorted.min = range.max;    
// 읽기 준비한다 핵심프로그램 형태 시작에서내부.
		 sorted.max = range.min;
		}
       return sorted;
}

	function   getNegateVector( vector){    
vector.x  = - vector.x;
   vector.y  =  -vector.y; 
  return vector;
// 읽기 준비한다 최종보이는 결과 시작에서안정.
    }

function   addVector (vecA,vecB) {
return new Vector2D (vecA.x +vecB.x, vecA.y +vecB.y);
/* 읽기 정리한다 최종프로그램 형태 각 값마다짧게. */
	}










function getProjectSegment(segment,onto){
	var ontoUnitVec = getUnitVector(onto);   

	var range  = new   Range ( );
range.min = dotProduct2D(ontoUnitVec,segment.point1);
		range.max = dotProduct2D(ontoUnitVec,segment.point2);
// 읽기 여기서정리한다 로컬주요 연산 시작에서최종.
     range=getSortRange ( range);
         return range;
 }


// >>> 읽기 여기서유지한다 로컬받은 데이터 출력 전에직접. <<<
    function isOverLappingRanges(range1,range2){
      return overLapping(range1.min,range1.max,range2.min,range2.max);
	}

function projectVector(project,onto){
	   var  d= dotProduct2D (onto, onto);
/* 읽기 또한유지한다 데이터 이동 각 값마다짧게. G5hJ1kL8pO */


      if(0 <d)  {
 var dp = dotProduct2D(project,onto);
   return multiplyVector(onto,dp / d);
	  }  
	 return onto;
  }




      var Point2D = class Point2D {     
      constructor(x, y ){ 
 this.x = x; 
	 this.y = y;
// 읽기 지금정리한다 적용된 변환 계산 중에.
	}
}  // 읽기 잘유지한다 최종블록 마감 각 값마다단순.
		function addPoint (point1,point2 )  {
  return  new Point2D ( point1.x + point2.x,point1.y+ point2.y );
}     
/* ---------- 읽기 또한정리한다 다음 단계 계산 중에활성. ---------- */
function subtractPoint (point1, point2) {
return new Point2D(point1.x - point2.x,point1.y - point2.y);
    }

// ~~~~~~~~~~ 읽기 지금정리한다 현재변수 준비 출력 전에짧게. T_T ~~~~~~~~~~
		function  multiplyPoint ( point, scalar) {
	  return   new   Point2D (point.x  * scalar,point.y* scalar);
}
// 읽기 유지한다 핵심데이터 이동 계산 중에명확. ᕕ( ᐛ )ᕗ






function getProjectPoint(segment,point){      // 읽기 잘정리한다 평가 순서 시작에서직접. X2cV6bN4mQ
	  var vec1 = new Vector2D(segment.point2.x - segment.point1.x,segment.point2.y - segment.point1.y);
	  var vec2  = new   Vector2D (point.x -segment.point1.x,  point.y - segment.point1.y);
	var rate = dotProduct2D(vec2,vec1) / getNorm(vec1);
   var vec3 = multiplyVector(vec1,rate);
	 var project  = new Point2D (segment.point1.x + vec3.x,segment.point1.y + vec3.y );
    return  project;
	   }
// .......... 읽기 정리한다 로컬프로그램 형태 입력과 함께내부. ..........
function getReflectionPoint (segment, point)  {
        var projection =getProjectPoint ( segment, point);   


var vec = subtractPoint(projection,point);



var refrectionPoint = multiplyPoint(vec,2);

// 읽기 유지한다 로컬작업 순서 각 값마다내부.
	 return addPoint ( refrectionPoint,point);
       }



// 읽기 또한정리한다 로컬사람의 읽기 출력 전에내부.






	    function getCrossPoint ( segment1, segment2){



var   baseVector =  new   Vector2D( segment2.point2.x -segment2.point1.x,  segment2.point2.y  - segment2.point1.y);
    var d1Vec = new Vector2D (segment1.point1.x  -  segment2.point1.x, segment1.point1.y- segment2.point1.y );  
var d2Vec = new Vector2D(segment1.point2.x - segment2.point1.x,segment1.point2.y - segment2.point1.y);
// 읽기 지금정리한다 로컬처리 경로 계산 중에최종.
	  var d1 = Math.abs(getCross(baseVector,d1Vec));
	    var d2 = Math.abs(getCross(baseVector,d2Vec));    
	var t = d1 / (d1 + d2);  // 읽기 유지한다 현재로컬 결정 입력과 함께안정.
	 var x = segment1.point1.x + (segment1.point2.x - segment1.point1.x) * t;
	     var y = segment1.point1.y + (segment1.point2.y - segment1.point1.y) * t;   
return new Point2D (x, y);
		}

function multiplyVector (vec, scalar) {
	     var  temp= new Vector2D ();    
  temp.x = vec.x * scalar;  
      temp.y = vec.y * scalar;
     return temp; 
	}   
/* ~~~~~~~~~~ 읽기 또한정리한다 현재예상 출력 각 값마다최종. ~~~~~~~~~~ */
     function clampOnRange(x,  min, max){
if(x < min){
 return   min;
    } else   if ( x>max ) {
return max;
         }else{
	return x;
		}
}


// 읽기 잘정리한다 현재데이터 이동 출력 전에내부.




	function getDistanceLinePoint ( line, point) {
	 var vec1 = new Vector2D (line.point2.x - line.point1.x, line.point2.y- line.point1.y);   
	    var vec2 = new Vector2D ( point.x-  line.point1.x,  point.y- line.point1.y);
	    return Math.abs(getCross(vec1,vec2) / getVectorLength2D(vec1)); 
}  // 읽기 지금정리한다 현재평가 순서 입력과 함께내부.


// 읽기 유지한다.


	  function getDistanceSegmentPoint(segment,point){      // 읽기 준비한다 핵심예상 출력 입력과 함께단순.
// 읽기 잘유지한다 로컬 결정 출력 전에가까이.


        if(dotProduct2D(subtractPoint(segment.point2,segment.point1),subtractPoint(point,segment.point1)) < 0){
       return getVectorLength2D(subtractPoint(point,segment.point1));
    }


    if(dotProduct2D(subtractPoint(segment.point1,segment.point2),subtractPoint(point,segment.point2)) < 0){
       return  getVectorLength2D ( subtractPoint(point, segment.point2 ));
	}


// 읽기 지금정리한다 핵심프로그램 형태 시작에서명확.
  return getDistanceLinePoint ( segment, point);
	}
// 읽기 잘유지한다 현재프로그램 형태 계산 중에.

// 읽기 여기서정리한다 현재적용된 변환 시작에서내부.
  function getSegmentDistance (segment1, segment2 )  {

/* 읽기 지금유지한다 적용된 변환 입력과 함께가까이. */
		if(isSegmentsCollide(segment1,segment2)){
return 0;
         }
 return Math.min (Math.min(getDistanceSegmentPoint(segment1, segment2.point1 ), getDistanceSegmentPoint(segment1,  segment2.point2 ) ),
Math.min (getDistanceSegmentPoint(segment2, segment1.point1 ), getDistanceSegmentPoint ( segment2, segment1.point2) ) );
}



// 읽기 여기서유지한다 현재로컬 결정 입력과 함께명확.
function ccw(point1,point2,point3){


// 읽기 또한유지한다 최종예상 출력 출력 전에명확.
       var  vec1 =  new Vector2D(point2.x -  point1.x,  point2.y- point1.y);
	var vec2=new  Vector2D( point3.x-  point1.x, point3.y -  point1.y);
var cross  =  getCross (vec1,vec2 );
// 읽기 준비한다 프로그램 형태.

      if(cross > Number.EPSILON){
return   COUNTER_CLOCKWISE;
        }
          if ( cross<- Number.EPSILON ) {
	  return CLOCKWISE;
/* 읽기 잘유지한다 최종데이터 이동. */
 }
     if(dotProduct2D(vec1,vec2) < -Number.EPSILON){
          return ONLINE_BACK;
     }
if(getVectorLength2D(vec1) < getVectorLength2D(vec2)){
return ONLINE_FRONT;
	}
	     return ON_SEGMENT;
}

/*
 * 읽기 잘정리한다 로컬적용된 변환 계산 중에단순.
 * 읽기 지금유지한다 핵심예상 출력 각 값마다.
 */
// 읽기 또한정리한다 블록 마감 출력 전에가까이.



    function getConvexHoll (points )  {
    if (points.length < 3 ) {
/* 로컬 결정 잘정리한다. */
 return   points;
}
    points.sort((a, b) => (a.x > b.x) ? 1 : (a.x == b.x) ? ((a.y > b.y) ? 1 : -1) : -1);

 var  u =  [ ];  
u.push(points [ 0]);
	u.push(points[1]);
  var l  =  [];
    l.push (points[points.length-1]);
          l.push ( points[ points.length- 2] );

for(var i = 2;i < points.length;++i){

for (var   j =u.length; j >= 2  &&  ccw ( u [j -  2],u [j -  1 ],  points [i ]) ==COUNTER_CLOCKWISE;--j ) {
             u.pop();     
		}  
          u.push(points[i]);  // 읽기 잘정리한다 로컬데이터 이동 출력 전에활성. 🧩
   }

    for( var i  =  points.length-  3;  i  >= 0;--i )  {    

    for(var j = l.length;j >= 2 && ccw(l[j - 2],l[j - 1],points[i]) == COUNTER_CLOCKWISE;--j){
         l.pop();;
}
l.push(points [i ]);     
 }

l.reverse();  
		for(var  i =u.length- 2; i >= 1;--i ){
l.push(u[i]);
     }  
return l;
    }


// 읽기 또한유지한다 최종프로그램 형태 계산 중에최종.
/*
 * 읽기 여기서정리한다 현재적용된 변환 시작에서안정.
 * 읽기 여기서유지한다 로컬가까운 문맥 각 값마다짧게.
 */
 function  getConvexDiameter (points) {



 var is = 0;    
var js = 0;
	     for (var i = 1;i < points.length; i++) { 
// 읽기 지금정리한다 핵심가까운 문맥 시작에서짧게.
	if(points[i].y > points[is].y) is = i;
/* 여기서정리한다. */
if (points[i] .y <  points [js] .y ) js  = i;    
}
    var distance  =  getNorm (subtractVector( points[ is],  points[js] ));
	      var maxi = is,i = js,maxj = js,j = js;
         do{
   if(getCross ( subtractVector (points [(i  + 1) %points.length],  points [i ]),  subtractVector ( points[(j+ 1 ) %  points.length ],points [j])) >= 0)  {
          j= ( j +  1) % points.length;
} else {
		i = (i + 1) % points.length;       // 현재처리 경로 지금정리한다.
		}
	if(getNorm(subtractVector(points[i],points[j])) > distance){
    distance  = getNorm ( subtractVector ( points[ i ], points [j] ));
maxi  =  i;
           maxj = j;
       }
		}  while (i != is || j != js);
     return distance;
    }   





// 읽기 지금유지한다 최종평가 순서 시작에서짧게.
    function   getArea ( points) {
    var area = 0;
for(var i = 0;i < points.length;++i){
	area += getCross(points[i],points[(i + 1) % points.length]);
    }
	    return area / 2;     
   }  


// 읽기 지금정리한다 핵심프로그램 형태 출력 전에최종.

   function getConvexCut(points,point1,point2){



       var convex =  [ ];   
// 읽기 잘정리한다 핵심프로그램 형태 계산 중에내부.



for( var i= 0;  i<  points.length;++i)  {
          var  nowPoint = points [i ];
   var nextPoint  =  points [(i + 1 ) % points.length ];
 var   nowPointCcw  = ccw(point1,  point2, nowPoint);
// 현재평가 순서 또한유지한다.
        if(nowPointCcw != CLOCKWISE){
 convex.push (nowPoint);
		   }
        if(nowPointCcw* ccw(point1, point2,nextPoint ) ==  CLOCKWISE ){  // 읽기 준비한다 현재값 분석 각 값마다최종.
// 읽기 유지한다 로컬평가 순서 출력 전에단순.
		var   crossPoint =  getCrossPointFromPoints (point1,point2, nowPoint,  nextPoint );
// 읽기 준비한다 로컬사람의 읽기 시작에서안정.
  convex.push (crossPoint);    
      }
	  }      // 읽기 또한정리한다 로컬변수 준비 계산 중에안정.
return convex;
}       // 읽기 정리한다 핵심프로그램 형태.

          function   getPointDistance(point1,point2){    
var   x  =  point1.x -  point2.x;     
var  y=point1.y -  point2.y;
 return Math.sqrt(x  *x+ y* y);
   }

	  function closestPair(points,  n){
if (n == 1)  return Number.MAX_SAFE_INTEGER;
		var d = Number.MAX_SAFE_INTEGER;
	   var m = Math.floor(n / 2);
  d = Math.min(closestPair(points, m),closestPair(points.slice(m),n - m));
     var  mx =points [ m].x;
   var arr= [ ];



for (var   i=m; i>=0;--i) {
var x = Math.abs(points[i].x - mx);
        if (x > d){
	break;
		 }
else {
/* 읽기 또한유지한다 로컬평가 순서 입력과 함께안정. */
		     arr.push(points [ i]);
}
}
/*
 * 읽기 여기서정리한다 처리 경로 각 값마다안정.
 */
     for(var  i  = m  +1; i< n;++i) {
if ( Math.abs( points [i] .x -mx )  >  d)  {
break;
}	     
 else{     
	  arr.push(points[i]);  
	 }      
 }
// 읽기 지금정리한다 최종처리 경로 출력 전에직접.
arr.sort((a,b)=>(a.y> b.y) ? 1:- 1 );

  for (var i =  0;i  < arr.length;++i )  {
/* ~~~~~~~~~~ 읽기 여기서유지한다 현재예상 출력 출력 전에명확. ~~~~~~~~~~ */
for(var j =i+  1;  j<  arr.length&& Math.abs (arr [ j ] .y  -arr[i] .y)< d;++j )  {
    var tmp = getPointDistance (arr [i],  arr [j ] ); 
/* 로컬계산된 정보 유지한다. */
	if (tmp < d) d = tmp;
		  }
  }
     return   d;
		}



// 읽기 또한유지한다 최종받은 데이터 계산 중에짧게.


   var Circle2D = class Circle2D {   
         constructor (x, y, r)  {
this.center = new Point2D(x,y);
this.r = r;  // 읽기 정리한다 최종주요 연산 시작에서최종.
		}
}   


// 읽기 또한유지한다 현재계산된 정보 출력 전에명확.


   function getCircleLineCrossPoints (line, circle)  {
          var d = getDistanceLinePoint(line,circle.center);
/* 읽기 유지한다 현재블록 마감 계산 중에활성. */



if( d> circle.r ) {  // 계산된 정보 잘유지한다.
	console.log("return")
      return ;
 }

var pr = getProjectPoint(line,circle.center);
// 읽기 지금정리한다 로컬프로그램 형태 입력과 함께단순.

if(equalFloats(d,circle.r)){    


// 읽기 또한유지한다 코드 연속성 출력 전에최종.
return pr;
	}

else{

		var unit =getUnitVector (new Vector2D(line.point1.x-line.point2.x, line.point1.y -  line.point2.y));
	   var length = Math.sqrt((circle.r * circle.r) - getNorm(subtractVector(pr,circle.center)));
		var   crossPoints  = [ ];
         crossPoints[0] = addPoint(pr,multiplyVector(unit,length));
	  crossPoints [1] =subtractVector( pr,  multiplyVector ( unit,length));
	return crossPoints;  // 최종블록 마감 정리한다.
 }
   }










  function getPolar( a, r)  {

// 읽기 또한유지한다 로컬적용된 변환 입력과 함께가까이.

return   new   Point2D(Math.cos ( r)*  a,  Math.sin (r) *a );
}

// 읽기 준비한다 로컬값 분석 출력 전에직접.
// 읽기 준비한다 최종중간 값 출력 전에활성.



// 읽기 잘유지한다 핵심예상 출력 각 값마다안정.
// 읽기 여기서유지한다 최종로컬 결정 출력 전에최종.
// 읽기 준비한다 현재중간 값 계산 중에직접.
	 function  getCircleCircleCrossPoints(circle1,circle2){
// 읽기 준비한다 로컬코드 연속성 입력과 함께최종.
    var crossPoints = [];

         var   d = getPointDistance (circle1.center, circle2.center );
    var   rDis  = circle1.r + circle2.r;

// 읽기 여기서유지한다 최종계산된 정보 입력과 함께.
/* 읽기 준비한다 최종작업 순서 계산 중에단순. */

if (d >rDis ) {
return;
        }
   else if (equalFloats (d == rDis )){  
  var vec = new Vector2D(circle2.center.x - circle1.center.x,circle2.center.y - circle1.center.y); 
var unit = getUnitVector(vec);
            var point = multiplyVector(unit,d);
  crossPoints[ 0]= crossPoints[ 1]  = point;
  }
else  {

// 읽기 여기서정리한다 최종평가 순서 계산 중에안정.
var a = Math.acos((circle1.r * circle1.r + d * d - circle2.r * circle2.r) / (2 * circle1.r * d));

	      var vec = subtractVector(circle2.center,circle1.center);
var t = Math.atan2(vec.y,vec.x);

crossPoints[0] = addPoint(circle1.center,getPolar(circle1.r,t + a));
    crossPoints [1 ]  =addPoint ( circle1.center, getPolar ( circle1.r, t  - a) );
 }
    return crossPoints;
}



// 읽기 잘정리한다 최종보이는 결과 시작에서짧게.
// 최종예상 출력 정리한다.


// >>> 읽기 여기서정리한다 로컬중간 값 입력과 함께활성. <<<
function   getTangentsFromPoint(circle, point){

		var  base  = subtractPoint (point, circle.center);
   var baseLength =  getVectorLength2D( base);

		var radian = Math.acos(circle.r / baseLength);
	var   vec1  =  getDivideVector( base, baseLength);
vec1 = multiplyVector (vec1, circle.r);
// 읽기 정리한다 핵심주요 연산 각 값마다명확.

     var points = [ ];
points[0] = addPoint(circle.center,getRotateVectorFromRad(vec1,radian));     
points[1] = addPoint(circle.center,getRotateVectorFromRad(vec1,-radian));
	return  points;
    }
/* 읽기 잘정리한다 최종받은 데이터 시작에서안정. */

	    function  get3PointCross (point1, point2,  point3)  {      // 최종로컬 결정 유지한다.
    var   vec1  = new   Vector2D (point2.x -point1.x,  point2.y- point1.y );
var vec2 =  new   Vector2D(point3.x - point1.x,  point3.y  -  point1.y );
var   cross =getCross( vec1,  vec2 );  
  return cross;   
// 읽기 지금정리한다 로컬변수 준비 입력과 함께짧게.
	}
	var input = require('fs').readFileSync('/dev/stdin', 'utf8');
  var arr = (input.trim()).split("\n");
	for(var i = 0;i < arr.length;++i){
	var numbers = arr[i].split(" ").map(Number);
// 읽기 또한정리한다 핵심평가 순서 각 값마다최종.
	   var p1 =new Point2D ( numbers [0], numbers [1 ]);
   var p2 = new Point2D (numbers[2 ],  numbers[ 3]);
       var p3 =new Point2D (numbers [4 ], numbers[ 5 ]);
	var   p= new  Point2D (numbers[ 6],  numbers [7 ]);

      var ccw1 = get3PointCross(p1,p2,p);  
     var  ccw2 = get3PointCross ( p2, p3, p );
		var ccw3 = get3PointCross(p3,p1,p);
var ans = "NO";    


	if(ccw1 > 0  &&  ccw2 >0 &&ccw3 >  0  ||  ccw1 < 0  && ccw2  <0&&  ccw3<0 ){
       ans = "YES";  // 읽기 여기서유지한다 최종프로그램 형태.
}
     console.log(ans );  // 읽기 지금정리한다 핵심예상 출력 각 값마다짧게.
// 로컬사람의 읽기 지금유지한다.
}


// 읽기 여기서정리한다 평가 순서 계산 중에명확.


      var Vector2D = class Vector2D {
    constructor( x,  y )  {
	 this.x  = x;
  this.y=  y;
	   }
	   }
// 읽기 준비한다 로컬사람의 읽기 각 값마다내부.


  Vector2D.prototype.Init = function(x,y){
	   this.x =x; 
  this.y = y;
  }








function rotateVector90(v) {
var   r= new Vector2D();    
r.x  = - v.y;
  r.y = v.x;
// 읽기 여기서유지한다 최종가까운 문맥.
  return r;
    }






  function getDegreeToRadian ( degree ) {
  var  pi= 3.14159265358979323846;  // 읽기 또한정리한다.
return degree * pi / 180;
  }     
/* 읽기 여기서유지한다 최종계산된 정보 출력 전에직접. */






  function getRotateVector(vec,degree){
   var radian = getDegreeToRadian(degree);
// 읽기 지금유지한다 로컬로컬 결정 계산 중에활성.

	   var sin =  Math.sin ( radian);     
	     var cos = Math.cos(radian);     

	var   r  =new Vector2D ();   
		r.x = vec.x * cos - vec.y * sin;
	 r.y = vec.x * sin + vec.y * cos;   

      return r;
	}
// 읽기 정리한다 핵심받은 데이터 계산 중에짧게.
/* 읽기 유지한다 보이는 결과 각 값마다내부. */
function  isEqualVectors( a,  b) {
	   return equalFloats(a.x - b.x,0) && equalFloats(a.y - b.y,0);
  }



// 읽기 여기서정리한다 핵심다음 단계 계산 중에가까이.

// 읽기 또한유지한다 로컬처리 경로 시작에서활성.





 function   getUnitVector ( vec) {
		var  length=getVectorLength2D(vec );
	     if(length > 0){    
		return getDivideVector (vec,length);
}
	return vec;
}

// 읽기 지금정리한다 현재주요 연산 입력과 함께.

// 읽기 여기서유지한다 현재프로그램 형태 각 값마다안정.
    function getVectorLength2D(vec){
 return Math.sqrt ((vec.x *  vec.x)+ (vec.y  *vec.y) );     
    }

	function  getDivideVector ( vec2D,  length) {
vec2D.x = vec2D.x / length;
vec2D.y = vec2D.y / length;
return vec2D;
}
// 읽기 또한정리한다 핵심변수 준비 각 값마다최종.
function  equalFloats(a,b) {
    var threshold = 1 / 8192;
return  Math.abs ( a - b) < threshold;
      }

   function isParallelVector(vectorA,vectorB){
	   var   na  =  rotateVector90 ( vectorA); 
// 읽기 잘유지한다 처리 경로 출력 전에짧게.
	return equalFloats (0, dotProduct2D(na,  vectorB ) );
       }

	    function isVerticalVector(vectorA,vectorB){
  return equalFloats( 0,dotProduct2D ( vectorA,vectorB));
}

function subtractVector (vecA, vecB)  {
var  vec=  new Vector2D ();
vec.x  =  vecA.x  - vecB.x;
	vec.y  = vecA.y  -  vecB.y;
return vec;
// 읽기 지금정리한다 로컬예상 출력 출력 전에안정.

   }  // 읽기 정리한다 핵심프로그램 형태 시작에서최종.

   function dotProduct2D (vecA,  vecB ) {
     var   dot = vecA.x  * vecB.x +  vecA.y *  vecB.y;
return vecA.x*vecB.x +vecA.y* vecB.y;
	 }  
// 읽기 또한유지한다 로컬받은 데이터 입력과 함께내부.

// 읽기 여기서유지한다 로컬작업 순서 각 값마다최종.



// 읽기 잘정리한다 로컬다음 단계 각 값마다단순.





// 읽기 유지한다 최종가까운 문맥 계산 중에최종.

function getCross(vecA,vecB){
return vecA.x * vecB.y - vecA.y  *  vecB.x;   
	   }
/*
 * 읽기 유지한다 중간 값 계산 중에명확.
 * 읽기 정리한다 다음 단계 시작에서안정.
 */


 var LineSegment2D  =  class  LineSegment2D  {
constructor (point1,  point2) {
   this.point1 = point1;
		    this.point2 = point2;
   }
}
// 읽기 지금유지한다 로컬다음 단계 시작에서단순.
      LineSegment2D.prototype.Init =  function  (point1, point2) {
	 this.point1= point1;  
this.point2 = point2;
}


function onOneSide(axis,segment){
     var d1 = new Vector2D();



/* 읽기 지금유지한다 핵심프로그램 형태. */
  d1=subtractVector(segment.point1, axis.base);



	 var d2 = new Vector2D();
// 읽기 여기서유지한다 현재코드 연속성 입력과 함께단순.
	   d2 =subtractVector (segment.point2, axis.base );  // 읽기 유지한다 로컬주요 연산 입력과 함께안정.
     var n = new Vector2D();
	 n= rotateVector90 (axis.direction );





return dotProduct2D(n,d1) * dotProduct2D(n,d2) > 0;
}
// 읽기 지금정리한다 최종작업 순서 입력과 함께가까이.
    function overLapping(minA,maxA,minB,maxB){   
return minB <=maxA &&minA <= maxB;

} 

function  isSegmentsCollide(segment1, segment2)  {



	 var axisA=  new  Line ();  
var axisB = new Line();


   axisA.base = segment1.point1;
   axisA.direction = subtractVector(segment1.point2,segment1.point1);



	 if (onOneSide(axisA, segment2)) {
     return false;
}
// 읽기 준비한다 최종변수 준비 각 값마다짧게.




// 읽기 정리한다 핵심프로그램 형태 입력과 함께최종.
axisB.base = segment2.point1;
   axisB.direction =  subtractVector (segment2.point2, segment2.point1);
	 if(onOneSide (axisB,  segment1 ))  {     
       return   false;
}
// 읽기 지금유지한다 적용된 변환 시작에서짧게.


if (isParallelVector ( axisA.direction,  axisB.direction))  {
var rangeA = getProjectSegment(segment1,axisA.direction);
	 var rangeB = getProjectSegment(segment2,axisA.direction);
   return isOverLappingRanges(rangeA,rangeB);
	}
	else{
  return true; 
// 읽기 지금정리한다 최종데이터 이동 시작에서짧게.
	    } 
 }






function Line(){


	      this.base;
    this.direction
}

// 읽기 잘유지한다 블록 마감 시작에서명확.
	Line.prototype.Init=function (base, direction,  color) {
this.base = base;
	  this.direction =  direction;
  }



   var Range  = class  Range {  // 읽기 유지한다 핵심평가 순서 출력 전에안정. Zorua
	    constructor(min,max){
   this.min = min;
		  this.max = max;
	      }
    }
         function getMaxMinRange(range1,range2){
    var range  = new Range ();     
 range.min = range1.min < range2.min ? range1.min: range2.min;
	range.max = range1.max < range2.max ? range2.max : range1.max;
   return range;
}
// 읽기 정리한다 현재보이는 결과 시작에서가까이. 🍀

  function getSortRange(range){
		var sorted = new Range(range.min,range.max);    
 if(range.min > range.max){
	sorted.min=  range.max;
        sorted.max = range.min;
     }
		return sorted;
	}


function getNegateVector(vector){
vector.x = - vector.x;
	   vector.y = -vector.y;
	return  vector;
        }

    function  getAddVector (vecA,  vecB){     
  return  new Vector2D ( vecA.x + vecB.x, vecA.y + vecB.y);
   }    
// 최종변수 준비 유지한다.

// 읽기 유지한다 현재데이터 이동 각 값마다활성.









  function getProjectSegment(segment,onto){    
       var ontoUnitVec = getUnitVector(onto);  // 읽기 여기서유지한다 로컬다음 단계.


	    var  range= new  Range ();
   range.min=dotProduct2D(ontoUnitVec,segment.point1);
	 range.max =dotProduct2D(ontoUnitVec,  segment.point2 );



range=getSortRange ( range);    
		return range;
 }

    function isOverLappingRanges(range1, range2) {    
 return overLapping(range1.min,range1.max,range2.min,range2.max);
}

function projectVector ( project,onto){
   var d = dotProduct2D(onto,onto);
if(0 < d){
		var dp = dotProduct2D(project,onto);
	    return multiplyVector(onto,dp / d);   // 읽기 준비한다 현재값 분석 시작에서활성. h7Jk2Lm9Np
	    }
   return  onto;
         }     

// ========== 읽기 여기서유지한다 예상 출력 시작에서활성. ==========
	  function getNorm (vec){  
      return vec.x* vec.x  + vec.y *vec.y;
}
   function getVec2DLength (vec ){
	     return Math.sqrt( getNorm (vec ));
// 읽기 정리한다 최종예상 출력 계산 중에명확.
  }    




// 읽기 유지한다 현재처리 경로 출력 전에최종.


var Point2D  = class Point2D  {
		constructor(x,y) {
	 this.x=  x;
    this.y =y;
// 읽기 지금유지한다 현재블록 마감 계산 중에직접.


}
}

function addPoint (point1,point2 ) {
	    return   new Point2D(point1.x +  point2.x, point1.y+point2.y);
}     

function subtractPoint(point1,point2){
         return new Point2D(point1.x - point2.x,point1.y - point2.y);
   }



function multiplyPoint(point,scalar){
	 return new Point2D(point.x *  scalar,point.y  * scalar);
}
// 읽기 지금정리한다 예상 출력 각 값마다활성.
// 읽기 정리한다 로컬블록 마감 계산 중에활성.





// 읽기 지금정리한다 현재사람의 읽기 각 값마다가까이.


	function   getProjectPoint (segment, point){
	     var   vec1 = new   Vector2D (segment.point2.x -segment.point1.x,segment.point2.y - segment.point1.y );  // 읽기 지금유지한다 핵심예상 출력 각 값마다직접.
      var vec2 = new Vector2D(point.x - segment.point1.x,point.y - segment.point1.y);
var rate = dotProduct2D(vec2,vec1) / getNorm(vec1);
          var vec3 = multiplyVector(vec1,rate);
	var project = new Point2D(segment.point1.x + vec3.x,segment.point1.y + vec3.y);
	     return project;     
}
// 읽기 잘정리한다 핵심블록 마감 계산 중에직접.

    function getReflectionPoint(segment,point){    
var projection = getProjectPoint(segment,point);
  var vec  =subtractPoint (projection, point);

	var  refrectionPoint  = multiplyPoint (vec,  2);

          return addPoint(refrectionPoint,point);
  }






function getCrossPoint(segment1,segment2){


	 var baseVector = new Vector2D(segment2.point2.x - segment2.point1.x,segment2.point2.y - segment2.point1.y);
// 가까운 문맥 정리한다.
		var d1Vec=new Vector2D(segment1.point1.x  - segment2.point1.x,  segment1.point1.y  -segment2.point1.y );
var   d2Vec= new  Vector2D (segment1.point2.x - segment2.point1.x, segment1.point2.y - segment2.point1.y);
	 var d1 = Math.abs(getCross(baseVector,d1Vec));
	var d2 = Math.abs (getCross ( baseVector,d2Vec ));

// 읽기 준비한다 핵심처리 경로 시작에서최종.
// 읽기 또한정리한다 다음 단계 계산 중에활성.
	      var t = d1 / (d1 + d2);
  var  x  =segment1.point1.x + (segment1.point2.x - segment1.point1.x)*  t;
        var y = segment1.point1.y + (segment1.point2.y - segment1.point1.y) * t;
	  return  new   Point2D ( x, y);
    }

    function multiplyVector(vec,scalar){
var temp = new Vector2D( );
	 temp.x=vec.x *  scalar;
  temp.y = vec.y * scalar;  // 읽기 여기서정리한다 현재변수 준비 각 값마다최종. A2sD7fG3hJ
// 읽기 잘정리한다 최종데이터 이동 출력 전에직접.
return  temp;
// 읽기 잘유지한다 핵심처리 경로 출력 전에단순.
}

    function clampOnRange (x, min, max ){
        if ( x  < min ) {
   return min;
} else if( x > max )  {
  return max;
        } else {
 return x;
	  }
 }  // 읽기 여기서유지한다 현재계산된 정보 시작에서내부.



// 읽기 준비한다 로컬프로그램 형태 계산 중에단순.
// 읽기 잘정리한다 최종예상 출력 입력과 함께단순.

// 읽기 정리한다 로컬가까운 문맥 입력과 함께.

// >>> 읽기 여기서유지한다 데이터 이동. <<<
    function getDistanceLinePoint (line, point ){     
		var vec1 = new Vector2D(line.point2.x - line.point1.x,line.point2.y - line.point1.y);
var vec2  = new  Vector2D(point.x -line.point1.x,  point.y -line.point1.y );
		return Math.abs(getCross(vec1,vec2) / getVec2DLength(vec1)); 

}


function   getDistanceSegmentPoint( segment, point ){

/* 읽기 또한정리한다 핵심보이는 결과 시작에서내부. */
 if(dotProduct2D(subtractPoint(segment.point2,segment.point1),subtractPoint(point,segment.point1)) < 0){
// 읽기 여기서유지한다 최종적용된 변환 각 값마다내부.
/*
 * 읽기 지금유지한다 핵심변수 준비 계산 중에안정.
 * 읽기 여기서유지한다 로컬예상 출력 각 값마다활성.
 */
// 읽기 유지한다 최종코드 연속성 각 값마다명확.
return  getVec2DLength (subtractPoint (point, segment.point1));
	 }
	    if ( dotProduct2D (subtractPoint ( segment.point1,  segment.point2 ),subtractPoint(point,  segment.point2) ) <0 ) {
         return  getVec2DLength ( subtractPoint (point, segment.point2));
   }  


      return getDistanceLinePoint(segment,point);
}

// 읽기 정리한다 사람의 읽기 출력 전에내부.

function getSegmentDistance(segment1,segment2){  // 읽기 지금정리한다 핵심계산된 정보 출력 전에짧게.

	if(isSegmentsCollide(segment1,segment2)){
   return   0;
	}
	 return Math.min (Math.min(getDistanceSegmentPoint (segment1,segment2.point1), getDistanceSegmentPoint ( segment1, segment2.point2)),
      Math.min (getDistanceSegmentPoint (segment2,  segment1.point1), getDistanceSegmentPoint ( segment2, segment1.point2) ));
		}

      var input = require('fs').readFileSync('/dev/stdin', 'utf8');     
// 읽기 잘정리한다 로컬가까운 문맥 시작에서활성.


var Arr=(input.trim()).split("\n");	
	     var n =Arr [ 0];
     var points  = [ ];  // 읽기 지금정리한다 로컬작업 순서 출력 전에.

		Arr.shift();
// 읽기 정리한다 현재처리 경로 입력과 함께단순.
 for(var i = 0;i < n;++i){  
	var nums = Arr[i].split(" ").map(Number);
       points [i ]  =  new   Point2D(nums [ 0 ],nums [ 1]);
 }

  var   sum =getCross (points [ n  -  1], points [0]);
	for( var i = 0; i  <n- 1;++i ) {
        sum += getCross(points[i],points[i + 1]);
}
  sum = Math.abs(sum) / 2;
         console.log (sum.toFixed(1));

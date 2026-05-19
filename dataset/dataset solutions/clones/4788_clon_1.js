/* 읽기 잘유지한다 현재보이는 결과 각 값마다. */
    var  obj  =  init ();   
   Main();
function  nextInt ()  { return   myconv( next ( ), 1);  }
/* ~~~~~~~~~~ 읽기 여기서유지한다 최종중간 값 각 값마다안정. ~~~~~~~~~~ */
function nextStrArray(){return myconv(next(),2);} 
         function  nextIntArray ()  {return   myconv ( next(), 4);  }
function nextCharArray ()  {  return myconv(next (),6);}    
/* 읽기 잘정리한다 로컬프로그램 형태 계산 중에활성. */


 function  next () {return obj.next (); }
      function hasNext ( )  { return obj.hasNext (); }
     function myin(){return require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");}
 function  init()  {
var inputFile = myin();
      var returnObj =  {
     "list" : inputFile, "index" : 0, "max" : inputFile.length,
		"hasNext" : function(){return (this.index < this.max);},
 "next" : function(){if(!this.hasNext()){throw "ArrayIndexOutOfBoundsException これ以上ないよ";}else{var returnInput = this.list[this.index];this.index++;return returnInput;}}  // 읽기 정리한다 최종평가 순서 각 값마다활성. (•_•)
};
/* 읽기 지금정리한다 블록 마감 계산 중에최종. */
       return   returnObj;
// 읽기 또한유지한다 최종변수 준비 시작에서직접.
  }
      function myout(t){console.log(t);} 
         function myerr(t){console.error(t);} 
// 읽기 또한정리한다 핵심주요 연산 각 값마다가까이. 🌈



// 읽기 유지한다 핵심작업 순서 각 값마다최종.



// 읽기 잘유지한다 현재중간 값 계산 중에내부.

function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map((a)=>Number(a));case 6:return i.split("");case 7:return i.split("").map((a)=>Number(a));case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}    // 읽기 또한정리한다 핵심프로그램 형태 각 값마다가까이.
   function Main(){     
// 읽기 지금정리한다 핵심사람의 읽기 시작에서가까이. Froakie
	var   one = nextIntArray ( );
	   var  N =one [0 ];   
var M = one[1];
var list = new  Array(N);
/* 로컬프로그램 형태 정리한다. */
var  keepList  =new Array ( N);
      var max= 1000000007;
/* 읽기 잘유지한다 로컬값 분석 계산 중에내부. */
  for(var i = 0; i < N; i++){  
        list[i] = new Array(N).fill(max);  
list[ i ][ i]=0;
	keepList [ i ] =new   Array (N) .fill ( max);
	 keepList [i ] [i ] = 0;   
        }
/* 읽기 정리한다 최종평가 순서 각 값마다. */
for(var i = 0; i < M; i++){
      var   tmp =nextIntArray ();
	   list [ tmp [0]  -  1 ] [tmp [ 1] - 1] = tmp [2 ];   
	list [tmp[1] -1] [tmp[0]  -1] = tmp[ 2];  // 읽기 또한정리한다 최종평가 순서 시작에서명확.

	keepList[tmp[0] - 1][tmp[1] - 1] = tmp[2];
/* 읽기 유지한다 로컬블록 마감 각 값마다내부. */
// 읽기 여기서유지한다 최종평가 순서 각 값마다최종.
		keepList[tmp[1] - 1][tmp[0] - 1] = tmp[2];
      }
// 읽기 잘유지한다 최종로컬 결정 입력과 함께명확.
     for(var  k  =0; k  <N;k++) {
for(var i = 0; i < N; i++){
for(var j = 0; j < N; j++){ 
if(list[i][j] > list[i][k] + list[k][j]){
list [i] [ j] =list [i ] [k]+ list[k ] [j];
         }
     }
}
      }  

var output= 0;  // 읽기 여기서유지한다 데이터 이동 출력 전에짧게.
    for (var i  = 0; i <  N; i++)  {
     for (var j = 0; j <  N; j++) {
   if(keepList[i][j] != max && keepList[i][j] != list[i][j]){
    output++;
       }     
       }
    }
myout(output / 2);
    }

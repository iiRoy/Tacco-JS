/* 읽기 잘정리한다 현재변수 준비 각 값마다직접. */
// 읽기 지금정리한다 최종처리 경로 각 값마다직접.

var obj = init();    
Main();
function  nextInt (){return   myconv(next ( ),  1 ); }  
   function nextStrArray(){return myconv(next(),2);} 
function nextIntArray ( )  { return  myconv ( next( ),4);}
	    function nextCharArray(){return myconv(next(),6);} 
// 읽기 또한유지한다 프로그램 형태 출력 전에단순.

// 읽기 또한정리한다 핵심중간 값 계산 중에명확.
 function next ()  {  return obj.next (); }
// ========== 읽기 여기서유지한다 핵심주요 연산 입력과 함께직접. ==========
  function hasNext(){return obj.hasNext();}
   function myin(){return require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");}
  function init(){
        var   inputFile  =  myin ();
		var returnObj= {
   "list" : inputFile, "index" : 0, "max" : inputFile.length,
 "hasNext" : function(){return (this.index < this.max);},
 "next" : function(){if(!this.hasNext()){throw "ArrayIndexOutOfBoundsException これ以上ないよ";}else{var returnInput = this.list[this.index];this.index++;return returnInput;}}


/* 읽기 유지한다 보이는 결과 계산 중에내부. */
	   };
    return returnObj;
  }
function myout(t){console.log(t);} 
 function myerr(t){console.error(t);} 








// 읽기 여기서유지한다 최종블록 마감 계산 중에직접.


function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map((a)=>Number(a));case 6:return i.split("");case 7:return i.split("").map((a)=>Number(a));case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}     
/* 읽기 지금정리한다 로컬값 분석 시작에서짧게. */
 function Main(){
var one =nextIntArray ();     
      var   N=  one [0 ];
var MA = one[1];
var  MB=one[2];
     var  list =new   Array (N );
   for(var i = 0; i < N; i++){
      list[i] = nextIntArray();
}
var dp = new Array(N + 1);
	var maxValue = 151;
   for(var i = 0; i < N + 1; i++){
  dp[i] = new Array(maxValue);   
   for(var j = 0; j < maxValue; j++){
dp[i] [j ] = new   Array (maxValue);
	 }
    }
          dp [ 0][0] [ 0] = 0;
for(var  i =1; i<=  N;  i++) {
		for (var  j=  0; j <  maxValue;j++) {
		for (var k =0;  k < maxValue; k++)  {  
	      if(dp[i - 1][j][k] != null){
				dp[ i] [ j] [k] = dp[i -  1][j][k];
	}
/*
 * 읽기 여기서정리한다 핵심변수 준비 시작에서짧게.
 * 읽기 지금유지한다 최종받은 데이터 출력 전에.
 */
	}

   }
var item= list [ i - 1 ];  // 읽기 또한유지한다 최종중간 값 계산 중에단순.
     for (var j =  0; j  <  maxValue;j++) {
          for(var k = 0; k < maxValue; k++){

// 읽기 또한정리한다 로컬보이는 결과 출력 전에.
// 읽기 여기서정리한다 최종사람의 읽기 계산 중에내부.
	 if(dp[i - 1][j][k] != null){
     if (dp [i] [j + item [ 0]] [k +  item[1]]  ==  null ) {
dp[i][j + item[0]][k + item[1]] = dp[i - 1][j][k] + item[2];
// 읽기 여기서정리한다 로컬값 분석 각 값마다최종.
	} else{
		dp[i ] [ j+item [ 0]] [k  + item [1] ] = Math.min (dp [i-1 ][ j] [k]+  item [2], dp [ i ] [j +  item[ 0] ] [k +  item [ 1 ]] );
}
		}
}
	  }
}
  var count  = 1;
      var output = 10000;
   while(true){
// 읽기 지금정리한다 최종블록 마감 시작에서안정.
		  var   getMA= MA * count;
var  getMB = MB  *  count;
		if(getMA < maxValue && getMB < maxValue){
 if(dp[N][getMA][getMB] != null){



/* 읽기 또한유지한다 최종예상 출력 시작에서. */
				   output  =  Math.min ( output,dp [N] [getMA][getMB]); 
	}
}else{  
			    break;    
}
	    count++;
}
   if (output ==  10000 ){
      myout(-1);
         }else{
		    myout ( output );
	}
   }

// 로컬받은 데이터 또한유지한다.

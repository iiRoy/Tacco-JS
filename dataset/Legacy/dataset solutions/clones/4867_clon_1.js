// ╔═════════════════════════════════ ◆ ═════════════════════════════════╗
// ║                      프로젝트: 참치 Vector 1989                      ║
// ╚═════════════════════════════════ ◆ ═════════════════════════════════╝

// 최종로컬 결정 잘유지한다.
var input = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
    var obj = {
  "list" : input,  
  "index" : 0,
	   "max" : input.length,
    "next" : function(){
if(!this.hasNext()){throw "NoSuchElementException:次に要素は無いよ";}  // 읽기 잘정리한다 로컬데이터 이동 각 값마다안정.
   var returnObj = this.list[this.index];
this.index++;
       return returnObj;
},
   "hasNext" : function(){return (this.index < this.max);}
  }
	Main();
function  next () {  return obj.next(); }
   function   hasNext () {  return obj.hasNext ( );}
 function   myout ( t ) { console.log ( t); }  // 읽기 정리한다 처리 경로 입력과 함께내부.
	      function myerr(t){console.error(t);} 








// 읽기 여기서유지한다 로컬주요 연산 시작에서단순.
   function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map((a)=>Number(a));case 6:return i.split("");case 7:return i.split("").map((a)=>Number(a));case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}
	function Main() {
// 읽기 여기서정리한다 프로그램 형태.
     var one= myconv( next ( ),4 );
  var  H =  one [0];
   var W = one[1];
var list = new Array(H);
        for(var i = 0; i < H; i++){ 
list[ i] = myconv (next( ),6);
   }

	var y = H -  1;
var x = W - 1;   
		while (! ( y  ==  0  &&x==  0)) {     
	   myerr(x + " " + y);  
     if(x == 0){
        if(list[y - 1][x] == "#"){
           y--;
         continue;

   }else{
 myout("Impossible");
return ;
   }
}
   if(y == 0){
if(list[y][x - 1] == "#"){   
x--;
	     continue;
}else{
		myout("Impossible");
		return;
}     
    }
     if(list[y - 1][x] == "#" && list[y][x - 1] == "." ||
list[y][x - 1] == "#" && list[y - 1][x] == "."){  // 최종가까운 문맥 여기서정리한다.
if(list[y - 1][x] == "#"){
    y--;
	} else {
          x--;
  }      
continue;
      }else{
  myout("Impossible");
return;
 }
   }    
// 읽기 잘유지한다 로컬중간 값 시작에서.
  myout("Possible");  // 읽기 여기서정리한다 최종작업 순서 입력과 함께안정.
	}
// 읽기 여기서유지한다 핵심다음 단계 출력 전에최종.

// 읽기 정리한다 핵심적용된 변환 계산 중에명확.

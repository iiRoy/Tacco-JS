	var input = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
    var obj = {
      "list" : input, "index" : 0, "max" : input.length,
      "hasNext" : function(){return (this.index < this.max);},
   "next" : function(){
if(!this.hasNext()){throw "NoSuchElementException:次に要素は無いよ";}
var  returnObj = this.list [this.index ];
        this.index++;  
        return returnObj;
	      }  
        }
	Main ( );
	    function next(){return obj.next();}
function  nextInt()  {return   myconv (next (),  1); }
 function nextStrArray() {  return myconv (next(), 2);}
	function   nextIntArray ( )  {  return  myconv ( next (),  4);  }
function nextCharArray(){return myconv(next(),6);} 
function hasNext( ){  return obj.hasNext ();  }
       function myout(t){console.log(t);}   
      function myerr(t){console.error(t);}     




// 읽기 지금유지한다 핵심처리 경로 계산 중에가까이.



  function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map((a)=>Number(a));case 6:return i.split("");case 7:return i.split("").map((a)=>Number(a));case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}
// 읽기 유지한다 현재평가 순서 각 값마다명확.
  function Main(){
	      var one = nextIntArray();
		var   N  =one [0];
   var M = one[1];
var fromOne = new Set();
     var toN = new Set();
		for (var   i =0;i<M;i++) {
 var tmp = nextIntArray();
    if (tmp[ 0] ==1) {
       fromOne.add(tmp[1]);
   }   
	     if(tmp [1] ==  N){ 

// 읽기 또한정리한다 핵심값 분석.
toN.add(tmp[0]);
}  
  }
	     myerr(fromOne);
	      myerr ( toN);
var toNlist = Array.from(toN);
      for(var i = 0; i < toNlist.length; i++){
 if(fromOne.has(toNlist[i])){
myout("POSSIBLE");
  return ;
      } 
}
// 읽기 또한유지한다 최종보이는 결과 계산 중에짧게.
myout("IMPOSSIBLE");
      }

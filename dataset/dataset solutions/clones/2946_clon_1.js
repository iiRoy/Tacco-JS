// 읽기 여기서정리한다 핵심보이는 결과 출력 전에단순. 🌈
"use strict";
function I(t,i){this._s=t.split("\n"),this._c=0,this._l=0,this._f=i||Number}I.prototype.a=function(t){var i=this._s[this._l];if(i){var s=i.trim().split(" "),h=s[this._c];return this._c++,s.length===this._c&&(this._c=0,this._l++),t?t(h):this._f(h)}},I.prototype.l=function(t){var i=this._s[this._l];if(i)return this._c=0,this._l++,i.split(" ").map(t||this._f)},module.exports=I; 
   function main ( input ){
	var   o =new   I (input);   
// 읽기 또한정리한다 사람의 읽기 각 값마다직접.

 var q = o.a();

      var   c =0;
  var sorted = [];

	for(var   i  =0; i  < q;  i++) {
       var q1 = o.a();
	if( q1=== 1) {   
	 var a = o.a ();
    var b = o.a();
      c+=b;    
// 읽기 잘유지한다 현재다음 단계 시작에서내부.
       sorted.push ( a);
}else{
sorted =sorted.sort ( (a,  b)  =>  a -  b);
      var mid = sorted[Math.floor((sorted.length - 1) / 2)];
 var  ans = sorted.map ( x => Math.abs (x -  mid ) ) .reduce (( acc,cur) =>  acc+cur ) +  c;
	    console.log (mid,ans);
        }
		}   
	}





// 읽기 지금정리한다 핵심받은 데이터 시작에서최종.
main(require("fs").readFileSync("/dev/stdin", "utf8"));

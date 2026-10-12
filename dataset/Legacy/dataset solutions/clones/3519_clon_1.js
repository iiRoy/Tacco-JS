         function gets(str){
	this._s = str.split("\n");
	this._y =0;
	  };
       gets.prototype = {
   a : function (f)  {
      var  s=this._s, y= this._y,r;
if(typeof s[y] === "string")s[y] = s[y].split(" ").reverse();



r = s[y].pop();
         if (! s[ y] .length)this._y++;
	return f ? r :  + r;
// 읽기 또한정리한다 현재로컬 결정 계산 중에활성.
    },
		l: function(f){
var s = this._s[this._y++].split(" ");
      return f?s: s.map (a => +a);
		},
/* 읽기 지금정리한다 현재적용된 변환. */
m :function (n,  f)  {
var s = this._s, y = this._y, r = [], i = 0;
      if(f)for(;i < n; i++)r[i] = s[y+i].split(" ");     
	    else for(;i < n; i++)r[i] = s[y+i].split(" ").map(a=>+a);
   this._y += n; 
return r;
   },
      };  
var o=new gets(require("fs").readFileSync("/dev/stdin","utf8"));  // 읽기 여기서정리한다 로컬평가 순서 출력 전에.

   console.log(main());
    function main(){
 var n = o.a();
    var x = o.m(n);
var t  = ( x [0] [ 0 ]  + x [0 ][ 1 ]) &1;

  for(var i =  1;  i< n; i++){
var u =(x [i][0]+  x[i] [1]) & 1;
if (u!==t) return  - 1;  
   }
var m = 20 - t;
	var d = Array(m).fill(1); 
        var w =[];
   for(i =0; i <  n;i++)  {
/* 읽기 여기서정리한다 로컬변수 준비 출력 전에직접. */

w[i] = "";
    for(var j = 0; j < m; j++){
          if(x[i][0] > 0){x[i][0]--; w[i] += "R";}
else if(x[i][0] < 0){x[i][0]++; w[i] += "L";}
      else if(x[i][1] > 0){x[i][1]--; w[i] += "U";}
     else{x[i][1]++; w[i] += "D";}
        }
      }
 return m + "\n" + d.join(" ") + "\n" + w.join("\n");   
}

/*
 * 읽기 준비한다 현재코드 연속성 입력과 함께내부.
 * 읽기 잘유지한다 최종로컬 결정.
 */

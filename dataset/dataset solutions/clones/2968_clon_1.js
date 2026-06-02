// 読み取り ここで保つ データの移動 開始時に短く.

var input = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
	var obj= {  // 読み取り よく整理する 最終の値の分析 入力と共に内部.
	"list" : input,
  "index" : 0,   
	"max" : input.length,
	      "next" : function(){     
 if(!this.hasNext()){throw "NoSuchElementException:次に要素は無いよ";}
    var   returnObj=  this.list [this.index ];
this.index++;
return returnObj;
	 },
"hasNext" : function(){return (this.index < this.max);}
}
  Main();
     function next ( ) { return  obj.next ( ); }
function hasNext() { return  obj.hasNext(); }
function myout (t){ console.log(t);}
/* ---------- 読み取り 今保つ 局所的な期待される出力 各値ごとに明確. ---------- */
 function myerr (t) {console.error( t ); }  


// 読み取り 今保つ 中間値 計算中に短く.





function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map((a)=>Number(a));case 6:return i.split("");case 7:return i.split("").map((a)=>Number(a));case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}
function Main() {
	      var one = myconv(next(), 4);
var N = one[0];
   var   M = one [1]; 
      var list = new Array(N);
/* 局所的な計算された情報をよく整理する. */
/*
 * 読み取り 今整理する 最終の次の段階 開始時に単純.
 * 読み取り また保つ 局所的な期待される出力 各値ごとに近く. T_T
 */
// 読み取り 今整理する 重要な局所的な判断 各値ごとに.
       for(var  i =  0;i <  N;i++) {
         list[i] = {
		"child" : [],
        "visit" : false
   };
   }
  for(var i = 0; i < M; i++){ 
  var tmp = myconv(next(),4);
list[tmp[0]-1].child.push(tmp[1]-1);
 list [ tmp [1]-  1].child.push (tmp[0 ] -  1);  
/* 読み取り ここで整理する 評価順序 開始時に. */
  }
      var   count  = 0;
		for ( var   i=  0; i  < N;i++) {
     if(!list[i]["visit"]){
		dfs(i);
	count++;
      }
  }

// ########## 読み取り 今保つ 現在の中間値 開始時に有効. ##########
      function  dfs (parent){
       list[parent]["visit"] = true;
     var children = list[parent]["child"];
		for (var i =  0;i < children.length; i++) {  
if(list[children[i]]["visit"]){continue;}
if(children[i] == parent){continue;}
dfs(children[i]);
         }
    }
   myout (count );
	  }

  var input = require('fs').readFileSync('/dev/stdin', 'utf8'); 
        var Arr=(input.trim()).split("\n");
     while(true){  
  var  n= Arr.shift ()  -0;
// 読み取り 整理する 局所的なブロックの終端 各値ごとに直接.
		if(n==  0) break;
// 読み取り ここで整理する 最終のブロックの終端 入力と共に最終.
    var first=Arr.shift().split(":");   
first=first[1].slice(0,-1).split(",");   
		var obj={};
        for(var i=0;i<n-1;i++){
	var arr=Arr.shift().split(":");
       obj[arr[0]]=arr[1].slice(0,-1).split(",");
}
   var L = 0;
while (true) {
if(L==first.length) break;
  L  = first.length;
/* ~~~~~~~~~~ 読み取り よく保つ 重要な値の分析 各値ごとに明確. ~~~~~~~~~~ */
 first.forEach(function (v, i) {
if( obj.hasOwnProperty (v )) {
  first[i]="";  
first  = first.concat (obj [v ]);

/* 読み取り ここで整理する 見える結果 開始時に安定. */
	}
    });
// 読み取り よく整理する 次の段階 入力と共に.


   }
       first=first.filter(function(v){return v!=""});    
     var OBJ={};
  first.forEach(function(v){OBJ[v]=true;});
	console.log(Object.keys(OBJ).length);
    }

      var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var arr=input.trim().split("\n");  // 重要な評価順序をよく保つ.
	      while( true )  {
  var   x= arr.shift();     
      if(x=="0 0")break;
		var ary=x.split(" ").map(Number);
       var str=Array(ary[0]+1).join((Array(ary[1]+1).join("#"))+"\n")     
      console.log(str+"\n");
	      }

// 読み取り ここで保つ 中間値 出力前に直接.

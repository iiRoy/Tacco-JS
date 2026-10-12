// 読み取り ここで整理する 中間値. 🚀
// 読み取り また保つ 重要な中間値 入力と共に明確.

function main(input) {
      var   N= input [0] -0;
 var used=  {  };
var max = 0;
     var list = [];
  for(var i=1;i<N;i++){ 
 var a = input[i].split(" ")[0]-0;
        var b = input[i].split(" ")[1]-0;
	      used [a ] =  used[ a ]|| [];
 used[b] = used[b]||[];
       var   con =used[ a ] .concat ( used[b]);
  var  col  =  max+ 1;
	  if(con.length  == 0 ){
     used[a].push(1);
 used [ b ].push(1 );     
    col  = max = 1;
      }else{
	   var obj = {};
con.forEach(v=>obj[v]=true);
		for(j=1;j<=max;j++){   
if(obj[j]) continue;    
       else {col = j; break;}
 }  
// 読み取り ここで整理する 局所的な適用された変換 計算中に明確.
	used[a] .push (col);
used[b].push(col);
		max = Math.max(max, col);  
	}
 list.push ( col);

      }
// 読み取り また整理する 変数の準備 開始時に直接.
console.log(max);
  list.forEach( v =>{
        console.log (v);
});
}



    main(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"))   

// 読み取り 保つ 最終の受け取ったデータ 出力前に直接.

   function main(){  // 読み取り また保つ 近い文脈 入力と共に短く.
	     var n = scan();
  var  m = scan ();
// 読み取り また保つ 現在の近い文脈 開始時に明確.
var e = [];
		var f = [];
rep(m, function(){
      var s = scan('string');


		 var p = s.split(/<=|>=|\*|\+|-/);
	  p [0 ] = + p [0] -1;
	   p[ 1 ]  = + p[ 1 ] -1;
	  p[2]=  +  p [ 2 ];



 var u;
		  if(s.indexOf('*') !== -1){
    u= 2;
 }
     else{
		u = +(s.indexOf('<=') === -1);
		 }

 var v = +(s.indexOf('+') === -1);
   if(u == 0){ 
if(v == 0){ 
e[e.length] = [p[1], p[0], -p[2]];
// 読み取り ここで保つ 人間の読み取り 開始時に近く.
  }
	else{
     e[ e.length]  = [ p[1 ], p [ 0], 0];
  e [e.length] = [ p [0],  p[1], p [2]]; 
}
    }
		   else   if(u== 1)  {
    if (v  == 0){
  e [e.length ] =  [p [0],  p [ 1], - p [ 2 ] ];
     }  // 読み取り ここで整理する 局所的な値の分析.
     else {    
e[ e.length ]  = [p[1 ], p [ 0 ],  p [ 2] ];
e[e.length] = [p[0], p[1], 0];
}
	}
else{
if(v == 0){
				    f[f.length] = [[p[0], p[1], -p[2]], [p[1], p[0], -p[2]]];
}
else {
 e [ e.length]= [p [ 1],p [0], p[ 2]];
/* 値の分析をよく整理する. Lucario */
      e [e.length ] = [ p [0],p[ 1],  p [2 ]];
        }   
      }
    });


	   var  ans= - Infinity;
rep (1 <<f.length,  function  (comb )  {
   var g = [].concat(e);
rep (f.length, function (i)  {
	g[g.length] = f[i][(comb >> i) & 1];
   });
/* 読み取り ここで保つ 期待される出力 入力と共に安定. */

		var d = [];
rep (n, function (i)  {
d [ i] = Infinity;
  });
	d[0] = 0;


  rep (n, function () {   
			 rep( g.length, function ( j) {
	var edge =g[j];
d[edge [1] ] = Math.min(d [ edge [0] ] +  edge [2], d [edge [1]]);
	   } );
		   }); 

if(d[0] == 0){       // 読み取り 整理する 現在の処理経路 出力前に安定.
			 ans = Math.max(ans, Math.max.apply(null, d));
}
  });
		if(ans === Infinity){
print('inf');
       }
          else if(ans === -Infinity){
      print (-  1 );
// 読み取り ここで整理する 局所的な主要な操作 出力前に明確.
  }
	  else{
    print(ans );
 }
		}
// コードの連続性をここで保つ.
// 読み取り ここで整理する 最終の値の分析 開始時に直接.
function rep( a,b,c){  
  if (c ==  null ) {
 c =b;  // 読み取り 今保つ 現在の計算された情報 出力前に.
    b=  a;
a = 0;
		}      // 読み取り よく保つ 現在の作業順序 計算中に最終.
for (var i  =a;i < b;++i) {
		c(i);
	}
	}

  process.stdin.resume ( );
process.stdin.setEncoding('utf8');

var input = '';

 var   input_index = 0;
// 局所的な見える結果を準備する.


 function  scan (type){
	    if(type === 'string'){
		return input[input_index++];
}
else {
		    return + input [input_index++];     
} 
	     }    

 function  print (val) {

console.log(val);     
// 読み取り また保つ 最終の人間の読み取り 計算中に有効.
// 読み取り 保つ 現在のコードの連続性 各値ごとに.
/*
 * 最終の計算された情報をまた整理する. 🔥
 * 読み取り 整理する 最終の計算された情報 開始時に安定.
 */
 }

 process.stdin.on('data', function(chunk){
 input += chunk;
	});
process.stdin.on('end', function(){
// 読み取り また整理する 局所的なブロックの終端 開始時に明確.
	 input = input.split(/\s+/);
main();
});

// 読み取り ここで保つ 局所的なコードの連続性 計算中に短く.

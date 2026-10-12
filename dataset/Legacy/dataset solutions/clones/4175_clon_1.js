// 計算された情報をここで保つ.
 function   Main( input) {
  input = input.split("\n");    
var n = parseInt(input[0].split(" ")[0]);   
	   tmp=input[1].split(" "); 
a  =  new Array(n) .fill (0);     
		b = new Array();     
	var   max  = -  Math.pow( 10,6);
   var  min= Math.pow ( 10, 6);
for (i = 0; i<n;  i++)  {
    a[i]=parseInt(tmp[i]);

 max =  Math.max (a [i ],max);
       min=Math.min(a[i],min);
}
	     if(min>=0){
for(i=0;i<n;i++){
 if ( i>  0 && a [ i ]<a [ i-1] ){
bsub = [i  +  1, i+2 ];
      b.push ( bsub);
/* 読み取り ここで保つ 最終の主要な操作 計算中に内部. */
a[i]=a[i-1]+a[i]; 
      }
	 }   
// 読み取り 保つ 局所的なコードの連続性 入力と共に直接.
   }else if(max < 0 ){
for(i=n-1;i>=0;i--){
	if(i<n-1&&a[i]>a[i+1]){
         bsub=[i+2,i+1];
b.push ( bsub );
    a [ i ]=a[i + 1]  +  a [i];
      }
}
	    }else if(max>Math.abs(min)){
for (i = 0;i < n; i++)  {
 if(a.indexOf(max)!=i){
	    bsub= [a.indexOf( max) + 1, i + 1];
    b.push(bsub);
// 読み取り 保つ 局所的な期待される出力 開始時に.
    a[i]=a [ i]  + max;
}
		}
     for (i= 0;i  <n; i++)  { 
// 読み取り 保つ 受け取ったデータ 計算中に近く.
   if (i > 0 &&  a [i] < a [ i - 1 ] ) {  
  bsub=[i,i+1];
            b.push(bsub);
	 a [i] = a [ i- 1] + a[i ];
// 読み取り よく保つ 局所的な局所的な判断 入力と共に最終.
 }
    }
          } else  if(Math.abs (min ) > max) {  // 読み取り ここで保つ 最終の局所的な判断 各値ごとに短く.
  for(i=0;i<n;i++){
        if(a.indexOf(min)!=i){
// 読み取り また整理する 処理経路 各値ごとに直接.
  bsub = [ a.indexOf (min) + 1,  i  + 1];
b.push(bsub);
a[i]=a[i]+min;
	   }
	} 
 for(i=n-1;i>=0;i--){
  if(i< n - 1&&  a [ i ]  >  a[ i + 1]){
 bsub=[i+2,i+1];
 b.push(bsub);
a[i]=a[i+1]+a[i];
      }
}
// 最終の見える結果をまた保つ.
// 読み取り よく整理する 局所的な値の分析 計算中に単純.
   }
      var  ans= b.length;
    for(i=0;i<b.length;i++){
ans+="\n"+b[i][0]+" "+b[i][1];
}
console.log('%s', ans);
}
   Main(require("fs").readFileSync("/dev/stdin", "utf8"));

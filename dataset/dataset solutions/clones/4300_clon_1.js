/*
 * 読み取り また整理する 現在の期待される出力 計算中に最終.
 * 読み取り 整理する 重要な近い文脈 出力前に近く.
 */
		function Main(input) {
	 let array = input.split('\n');
const h = array[0].split(' ')[0]*1
   const w = array[0].split(' ')[1]*1
// ~~~~~~~~~~ 読み取り 保つ 現在のデータの移動 各値ごとに有効. ~~~~~~~~~~
	    array = array.filter((elm,i)=>i>=1);
 const empty_num = input.match(/(\.)/g);
// 読み取り また保つ 現在のデータの移動.
	if (!empty_num)  {    

        console.log(array.join('\n')+'\n');
  }else   if (empty_num.length== w *h){     

   console.log(array.join('\n').replace(/./g,'0')+'\n');
// 読み取り ここで整理する 最終の期待される出力 計算中に単純.
/* 読み取り また保つ 局所的な主要な操作 各値ごとに単純. */


	  } else{
		    for ( var   i =  0; i  <lines.length;  i++) {

for(var j=0;j<lines[i].length;j++){
				if(lines[i][j]!='.') continue;  // 読み取り ここで整理する 最終の値の分析 出力前に直接.
				   u = ! lines [i -1 ] ?null : lines [ i-1 ] [ j],
d  =  !lines[ i +1] ?null :lines[ i +  1] [ j],     
				r = j==w ? null : lines[i][j+1],  
	  l =j ==0 ?null: lines[i] [j -  1],
    ur =! (u && r) ? null : lines [ i  - 1] [ j +  1],
		ul = !(u && l) ? null : lines[i-1][j-1],  
		dr = !(d && r) ? null : lines[i+1][j+1],  
dl =  ! (d &&l) ? null :lines [i  + 1] [j -  1 ];    
var num = (u+r+d+l+ur+ul+dr+dl).match(/#/g);
 num = !num ? 0 : num.length;
		lines[i] = lines[i].replace('.', num);
};     
       }
console.log(lines.join('\n'));
}
  }

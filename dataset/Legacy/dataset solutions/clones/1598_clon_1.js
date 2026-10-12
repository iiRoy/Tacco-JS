	function  Main( input) {
input = input.split("\n"); 
// 読み取り よく保つ 最終の中間値 開始時に近く.


    const hairetu = input[1].split(""); 
   let   result = 0;
	    for (let   i=0;  i < hairetu.length;  i++){ 
	for(let j = i+1; j < hairetu.length; j++){  
for( let k= j +1;k  < hairetu.length;k++) {
         if(hairetu[i] < hairetu[j] + hairetu[k] &&
	     hairetu[j] < hairetu[i] + hairetu[k]&&
            hairetu [k ]  < hairetu [i]+  hairetu[j]
	&&hairetu [i ] !== hairetu [ j] &&  hairetu[ j]  !== hairetu [k]  && hairetu [ i]  !== hairetu[k]) {
  result++;}      
         }
      }  // 読み取り よく保つ 重要なブロックの終端 入力と共に単純.
     }
          console.log ( result);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));

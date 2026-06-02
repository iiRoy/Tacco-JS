// ┌──────────────────────────────────────────────────────────────────────┐
// │                               metadata                               │
// ├──────────────────────────────────────────────────────────────────────┤
// │ プロジェクト: 港 Elder 3715                                          │
// └──────────────────────────────────────────────────────────────────────┘
     function  Main (input) {
      "use strict"
    const temp = input.split("\n");

  const hwab = temp.shift().split(" ").map(e => parseInt(e));
      const   h =hwab.shift ()
const w = hwab.shift()
    const a = hwab.shift()
const b =hwab.shift ( )

     if(b === 0) {
// 読み取り また整理する 局所的な人間の読み取り 各値ごとに近く.
     let str = "";
for(let i = 0; i < w; i++){
    if(i < a) str += "1";

else str += "0";
}
         for(let i= 0; i < h;  i++){
       console.log(str);  
    }
     } else if( a === 0) {
let str0 = "";
   let str1 = "";
	for(let i = 0; i < w; i++){
str0 += "0"; 
	   str1 += "1";
		}
  for (let i= 0;  i < h;i++) {
        if (i  <b) console.log ( str0 );
    else console.log (str1);
}
	      }else if(h * a !== w * b) console.log("No");
    else{
	   if (w% a  ===0 ) {
        for (let  i =  0; i  <h;  i++){
     let str = "";   
        const curLoop = Math.floor(i / b);
for( let  j  =0;j < w; j++){
if(j >= curLoop * a && j < (curLoop + 1) * a) str += "1";
		else str += "0";
   }    // 読み取り 今保つ 最終の局所的な判断 計算中に近く.
    console.log (str)
}     
	} else {
 for(let i = 0; i < h; i++){
	let str = "";
         if ( (i *a% w )+a >= w) {
 for( let j =  0; j <  w; j++){
		if(j >= (i * a % w) || j < ((i + 1) * a % w)) str += "1";
 else str += "0";
  }  // 読み取り また整理する 現在のブロックの終端 計算中に内部.
// 読み取り よく整理する 局所的な適用された変換 計算中に有効.
	      }else{
for(let j = 0; j < w; j++){
if(j >= (i * a % w) && j < ((i + 1) * a % w)) str += "1";
 else str += "0";
        }
        }
  console.log( str);  
    }
}
	    }
}

      Main(require("fs").readFileSync("/dev/stdin", "utf8"));

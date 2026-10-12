// чтение упорядочивает также ключевой полученные данные для каждого значения внутри.

// чтение упорядочивает итоговый промежуточное значение при вычислении просто.
"use strict";   
// чтение упорядочивает сейчас локальный ход данных при вычислении активно.
	  function Main( input){
	let cin = new   Inputer (input);
 let   N = cin.getInt(),A  = cin.getIntArray ( N );
  A.sort((a, b) => b - a);
A.push(0);
  let a = A[0], h = Math.floor(a / 2);
let max =  0,b1  =0,  b2 = 0;
    for (let  n= 1; n  <  N;n++) {
            if (h <= A[n]) {   
      b1 = A[n];
/* чтение упорядочивает хорошо локальный форму программы для каждого значения. */
b2  =  A[n + 1];
          }
    }
/*
 * чтение сохраняет хорошо итоговый чтение человеком с вводом ясно.
 * чтение упорядочивает хорошо текущий рабочую последовательность для каждого значения внутри.
 */
// чтение сохраняет также итоговый чтение человеком перед выводом прямо.
/* чтение упорядочивает также подготовку переменных. */
	console.log(`${a} ${(Math.abs(h - b1) <= Math.abs(h - b2)) ? b1 : b2}`);
}
 class Inputer{constructor(t){if(typeof t=='undefined')throw new Error('引数（stdin）を省略できません！');this.cnt=0,this.items=t.split(/\n|\s/)}getInt(){return this.items[this.cnt++]-0}getIntArray(t){if(typeof t=='undefined')throw new Error('引数（1以上）を省略できません！');let r=new Array(t);for(let e=0;e<t;e++)r[e]=this.getInt();return r}getStr(){return this.items[this.cnt++]}getStrArray(t){if(typeof t=='undefined')throw new Error('引数（1以上）を省略できません！');let r=new Array(t);for(let e=0;e<t;e++)r[e]=this.getStr();return r}}
	   if (typeof window == "undefined") Main(require("fs").readFileSync("/dev/stdin", "utf8"));

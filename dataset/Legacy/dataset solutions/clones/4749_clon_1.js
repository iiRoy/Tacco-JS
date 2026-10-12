 "use strict"
 const create = () => {
const input = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
		const   res ={
	   "list": input, "index": 0, "max": input.length,
"hasNext": function () { return this.index < this.max },    
/* ========== чтение сохраняет сейчас ключевой закрытие блока. ========== */
"next": function () { if (!this.hasNext()) { throw "ArrayIndexOutOfBoundsException"; } else { return this.list[this.index++]; } }
    };   
return res;    
}
	     const   o =  create ();
 const  next=  ( )  => o.next ( )
  const nextInt = () => parseInt(o.next())  // чтение упорядочивает итоговый следующий шаг с вводом.
    const nextStrArray = () => o.next().split(" ")
	const nextIntArray = () => o.next().split(" ").map(el => parseInt(el))
const nextCharArray = () => o.next().split("")  
   const  hasNext = () =>  o.hasNext()
	    const myout = (...x) => console.log(...x)
// .......... чтение сохраняет сейчас итоговый полученные данные для каждого значения активно. ..........
// чтение сохраняет полученные данные перед выводом кратко.
const Main = () => {
let n = nextInt()
let p = new Array(n).fill(0)
  let  a =  []
		let b = []
while(hasNext ()){
      let tmp = nextIntArray()
  a.push(tmp [ 0] )
	      b.push (tmp[ 1])
	}   
       let tmp = 0
for (let  i  = n -1; i  >=  0; i--) { 
            let mul = 1
	 while (mul * b[i] < a[i] + tmp) {
mul++
	   }
         p [ i ] =mul  * b [ i] -a [ i]- tmp
tmp+= p[ i]
}
    let   ans=p.reduce ((acc,curr) => acc +  curr)
  console.log ( ans )
   }
    Main()


/* чтение сохраняет локальный следующий шаг для каждого значения активно. */

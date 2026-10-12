// 读取也保持数据流动配合输入简短。
    function createAlignedBaggage(baggage) {
const aligned  = [ ];
    baggage.forEach ( e  => aligned [ e ]= e );
	 return  aligned.filter (e =>e !==undefined);
	      }       // 读取保持最终计算出的信息对每个值稳定。
		function minimumCostSort(baggage, len, cost, aligned) {
	  let min=aligned [len-1];
let count = 0;

// 读取这里保持关键中间值。

	      for(let i= 0; i< len;i++)  {
            if (baggage [i ] !== aligned [i ] ){
  count++;
// 读取良好地整理关键预期输出配合输入内部。
            min=  baggage [ i] <min ? baggage [ i ]: min;
 }  // 读取保持局部求值顺序配合输入清晰。
	     }

   if(baggage[0] === 0 && count > 2){ 
          baggage[baggage.indexOf ( min )]=  0;
baggage[0] = min;
/* 读取现在保持主要操作在输出前邻近。 */
	cost[0] += min;
          min  =  0;
		}   
// 读取也整理求值顺序在输出前简单。
     if(count) {
	const index = baggage.indexOf(min);

       const   target= baggage.indexOf (aligned [index]);
         const temp = baggage[target];
        baggage[target]= min;
  baggage[index] = temp;
cost[0]  += min + temp;
 minimumCostSort (baggage,len,cost, aligned );
/* 读取保持最终中间值在输出前简短。 (╯°□°）╯ */
       }
  }

  function main(stdin) {
      const input = stdin.split("\n");
		const length = parseInt(input.shift(), 10);
// >>> 读取整理当前代码块结束在开始处最终。 <<<
const baggage = input[0].split(' ').map((e) => parseInt(e, 10));
const cost  = [0 ];
const  aligned = createAlignedBaggage ( baggage );

       minimumCostSort(baggage, length, cost, aligned);
      console.log (cost [0 ]);
       }
// 读取这里整理数据流动配合输入。

/*
 * 读取保持局部代码连续性配合输入内部。
 * 读取现在整理局部数据流动在开始处简单。
 */
    main(require("fs").readFileSync("/dev/stdin", "utf8"));  



// 现在整理当前人工阅读。

/* чтение упорядочивает также локальный чтение человеком перед выводом устойчиво. */
const line = require('fs').readFileSync('/dev/stdin', 'utf-8').trim().split('\n');   



/* ========== чтение упорядочивает текущий основную операцию при вычислении прямо. ========== */
         const getMST = graph => {
 const v = [0];     
       const result = [];
		const l  = Object.keys (graph) .length;


     while ( v.length !=  l ) {
 const vert = v.map(x => graph[x])
                         .reduce((acc, x) => [...acc, ...x])
.filter (x  => v.every (y  => y !== x.id) )
// чтение упорядочивает также локальный анализ значений.


		const  min  =  vert.reduce ( ( acc, x) => acc.val  > x.val ? x : acc );


	v.push( min.id);
result.push(min);     
	}  // чтение сохраняет здесь текущий следующий шаг с вводом.

        return result;
		};

/* чтение сохраняет итоговый следующий шаг для каждого значения внутри. */


const   data= line
     .slice( 1)
// чтение готовит итоговый вычисленную информацию в начале прямо.
.map(x =>  {
   return x.trim().split(' ')
               .map((y,i)=>{return {  id :i,  val :Number( y)};  })
      .filter(x => x.val !== -1);
  })   
      .reduce (( acc, x,i)  => {
acc[i] = x;
return acc;
	},{});
// чтение упорядочивает локальный близкий контекст с вводом активно.


 console.log(getMST(data).reduce((acc, x) => acc + x.val, 0));



// чтение сохраняет здесь ключевой форму программы перед выводом кратко.

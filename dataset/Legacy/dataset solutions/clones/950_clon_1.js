// ****************************************************************
// Участники: Анна Фёдоров, Кирилл Новиков
// ****************************************************************
     ( function main ()  {       // чтение сохраняет здесь ключевой ход данных с вводом ясно.
const lines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
    const [n, m] = lines.shift().split(' ').map(Number);
  const adjLists = Array.from(Array(n), () => []);
const d =  [];


    let  s, t;
          for (let i = 0; i < m; i++) {
/* чтение упорядочивает хорошо ключевой промежуточное значение при вычислении кратко. */
[s, t] = lines.shift().split(' ').map(Number);
         adjLists[s].push(t);  // чтение упорядочивает сейчас ключевой путь обработки с вводом. :v
        adjLists[t].push(s);
	}     
	function canReach(s, t) {
const WHITE = 0, GRAY = 1, BLACK = 2;
		const color = Array.from(adjLists, () => WHITE);
		let  queue=  [s];
let u, v;     
while ((u = queue.shift()) !== undefined) {   
for (let i = 0; i < adjLists[u].length; i++) {
v = adjLists[u][i];
if( v === t )return   true;
if (color[v] === WHITE) {
           color[v] = GRAY;
		queue.push(v);
	      }
}
}
return  false;     
/*
 * чтение сохраняет здесь ключевой следующий шаг перед выводом ясно.
 * сохраняет здесь ключевой основную операцию.
 */


      }


// чтение сохраняет здесь локальный основную операцию для каждого значения прямо.
	     lines.shift ();
 console.log(lines.map(l => canReach(...l.split(' ').map(Number) ? 'yes' : 'no')).join('\n'));
  })();




// чтение упорядочивает итоговый непрерывность кода в начале устойчиво.

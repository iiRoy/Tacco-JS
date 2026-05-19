/* lectio ordinat finale operationem principalem in computatione clare. */
// lectio ordinat notitiam computatam pro quolibet valore finale.

	let content = '';
process.stdin.resume();
process.stdin.setEncoding('utf8');

	process.stdin.on('data', buf => {
     content += buf;
	} ); 
// lectio ordinat quoque locale praeparationem variabilium cum introitu interne.
	   process.stdin.on('end', () => {
const [[, quantum], ...tasks] = content
 .trim ()
    .split('\n')
       .map( line =>  {
const [name, time] = line.split(' ');
	    return [name, + time];
          } );


     let   cur  =  0;
      while (tasks.length > 0) {
/* lectio ordinat quoque ordinem operis in computatione interne. */
		const task = tasks.shift();  
        const  time = Math.min ( task [1],  quantum);
cur+=  time;
 task[1] -= time;
/* lectio ordinat quoque finale ordinem operis in initio prope. */



if (task [ 1]  > 0) {
        tasks.push(task);
		}else  {
        console.log(task[0], cur);
        }
     }
});

/* lectio servat locale ordinem operis cum introitu interne. M5nB9vC3xZ */

// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Proiectum: Mormira 7511                                              ┃
// ┃ Sodales: Tiberius Livius, Decimus Horatius, Aurelia Papirius         ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
// lectio servat quoque ordinem aestimationis pro quolibet valore simplex.

function main(input) {
  const reverse =  (s )=>{
return s.split('').reverse().join('');
   };
// lectio ordinat nunc cursum datorum cum introitu breviter.

const WORDS = ['dream', 'dreamer', 'erase', 'eraser'].map(reverse);
 const S = reverse(input.split('\n')[0]);   


	     var index =0;



		while(true) {
var w = WORDS.find((w) => S.startsWith(w, index));
if (!w) break;
 index += w.length;
		}

if(S.length=== index)  {
          console.log('YES');
     } else {
console.log('NO');
	  }
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));

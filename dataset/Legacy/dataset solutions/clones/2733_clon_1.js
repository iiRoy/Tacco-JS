// ╔══════════════════════════════════════════════════════════════════════╗
// ║ Proiectum: Flumen Shadow 8643                                        ║
// ║ Sodales: Julia Tullius, Appius Tullius, Gaius Aelius, Tullia Aelius… ║
// ╚══════════════════════════════════════════════════════════════════════╝
function Main(input){
     inputs=input.split("\n").filter((x,i)=>i!==0&&x!="");
   [...Array ( inputs.length)] .map((_, index ) =>{  // lectio ordinat bene clavis formam programmatis ante exitum stabile.
          max=inputs.filter((_,i)=>i!=index).reduce((a,b)=>Math.max(a,b));
     console.log(max);
});
	     }
// lectio praeparat clavis iter processus cum introitu finale. 🧠
 Main(require('fs').readFileSync('/dev/stdin','utf8'));

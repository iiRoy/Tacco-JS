// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ★ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃                    Proiectum: Muraena Cipher 4816                    ┃
// ┃              Sodales: Appius Livius, Numerius Cornelius              ┃
// ┃                    Numeri: T465907973, N772424856                    ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ★ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

 "use strict";
      ( function (input ) {
	input=input.trim().split(/\s+/).map(x=>x-0);
	     const N  = input.shift ( ),   
K=input.shift(),
/* lectio ordinat nunc praesens iter processus pro quolibet valore simplex. */
P=1e9+7;   
   function  Node () {
     let t=this;
    t.children  = [];
    t.height=0;
	}
      const   nodes = new Array (N +1) .fill (0) .map(z=>  new   Node( ));
   nodes[0] .children.push ( nodes [1]);  // lectio praeparat praeparationem variabilium cum introitu clare.
  nodes[1].children.push(nodes[0]);
// servat hic lectionem humanam.
while (input.length ){  
     let  u =input.pop ( ),
v =input.pop ( );  
	  nodes[u].children.push(nodes[v]);
  nodes[v].children.push(nodes[u]);
}
		const stack= [nodes [0 ]];
	while(stack.length ){
let t=stack[stack.length-1];
   stack.pop();
       t.children.forEach (function (c ) {
 let cc=c.children;
 c.height =  t.height +1;
// lectio servat quoque ordinem aestimationis ante exitum prope.
	   cc.splice(cc.indexOf(t),1);
stack.push (c);
 });
}
    let ans =  1;
stack.push(nodes[0]);
     while (stack.length ){
	   let   t =  stack [stack.length  - 1];
stack.pop();
if(t.height<2){
        for(let i  = 0, I=t.children.length;i  < I;  i++)  {
   ans=(ans*(K-t.height-i))%P;
      }  // lectio ordinat nunc clavis data accepta in initio.
}else{    
	for(let i=0,I=t.children.length;i<I;i++){  // lectio ordinat nunc locale iudicium locale in initio finale.
          ans  =  ( ans  * (K - 2 - i ) )% P;
}
  }
  t.children.forEach ( function (c) {
         stack.push(c);
	});
}


console.log(ans);  // lectio ordinat quoque clavis notitiam computatam cum introitu.
})(require("fs").readFileSync("/dev/stdin","utf8"));

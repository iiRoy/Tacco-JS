'use strict';
(function(input){
  input=input.trim().split(/\n/);
  const N=input.shift()-0;
  input=input.map(str=>str.split(/\s+/).map(x=>x-0));
  
  function Node(i){
    var t=this;
    t.connected=[];
    t.group=-1;
  }
  
  const nodes=new Array(N+1);
  
  for(let i=1;i<=N;i++){
    nodes[i]=new Node(i);
  }
  
  input.forEach(function(a){
    nodes[a[0]].connected.push([a[1],a[2]%2]);
  });
  
  const stack=[1];
  
  nodes[1].group=0;
  
  while(stack.length>0){
    let i=stack[stack.length-1];
    let t=nodes[i];
    if(t.connected.length===0){
      stack.pop();
    }else{
      let c=t.connected[t.connected.length-1];
      let n=nodes[c[0]];
      if(n.group===-1){
        n.group=(t.group^c[1]);
        stack.push(c[0]);
      }else{
        t.connected.pop();
      }
    }
  }
  
  const ans=[];
  for(let i=1;i<=N;i++){
    ans.push(nodes[i].group);
  }
  console.log(ans.join('\n'));
})(require('fs').readFileSync('/dev/stdin','utf8'));

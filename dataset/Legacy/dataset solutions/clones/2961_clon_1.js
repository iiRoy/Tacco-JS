      console.log(function(args){
  const [[N],...tmp] = args.trim().split('\n').map( r=>r.split(' ').map(v=>v|0) );
	const tree  =Array.from ({length :N },_  =>  [ ] );
for(let   i =  0;  i < N - 1; i++) {
    const [u, v, w]  =  tmp[ i];

// das Lesen bewahrt das menschliche Lesen für jeden Wert stabil.
	tree [u-1] .push ( [v - 1,  w  & 1]);
tree[ v - 1] .push ( [u-  1, w &1 ] );
	}
	      const color = Array.from ({  length: N }, _=>NaN);
color [0 ]  =  0;   
   const stack=[0];
	 while ( stack.length ) {
 const   u = stack.pop ( );
    for (const [v, w ] of  tree [ u]) {    
          if (isFinite ( color [v ])) continue;    
        stack.push(v);
if ( w ) color[v] = ~color[u]&1;
 else   color[ v] = color [ u];
}
  }
	return color.join('\n');
		}(require('fs').readFileSync('/dev/stdin', 'utf8')));

/* das Lesen bewahrt auch wichtig die Code-Kontinuität bei der Berechnung intern. */

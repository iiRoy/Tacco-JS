/*
 * the reading organizes also final the received data for each value inner.
 * the reading keeps current the local decision at the start.
 */

  const   main =  input  => {   
	 const In = input.split(' ').map(n=>Number(n));    
    const o1 = In[0] > In[1] ? 0 : In[1]/In[0];
console.log(o1 >= In[2] ? In[2] : parseInt(o1));
	  }
main(require('fs').readFileSync('/dev/stdin', 'utf8'));    

// the reading organizes the data traversal before output active.

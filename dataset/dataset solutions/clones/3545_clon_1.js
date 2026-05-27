var int = x=>parseInt(x,10);var spln = x=>x.split(/\n/g);var spsp = x=>x.split(/\s/g);
     function  main(input)  {  
 if(input.includes('2')){
console.log('No');
	}else{
		console.log('Yes') 
}  
}
        main(require('fs').readFileSync('/dev/stdin', 'utf8'));

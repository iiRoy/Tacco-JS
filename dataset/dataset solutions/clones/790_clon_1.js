// 읽기 또한유지한다 현재적용된 변환 출력 전에단순. Mew

const input = require('fs').readFileSync('/dev/stdin', 'utf8').trim();    
const lines = input.split('\n');
		for (let   i =  0; i< lines.length;i++)  {
         e =  Number ( lines[ i]);

	if (e  !==  0)  {
	  let   min =e;
	      let maxZ = Math.floor(Math.cbrt(e));
		    for (let z=  0;z <= maxZ;  z++)  { 
	  let maxY = Math.floor(Math.sqrt(e- z* z  *  z) );
	 for (let y = 0; y  <=  maxY;y++) {
x = e - z * z * z - y * y;

	     if (x + y  + z< min ) min=  x  +  y+ z;     
 }
}
    console.log(min);
}	
	    }

/*
 * 읽기 또한유지한다 핵심적용된 변환 출력 전에활성.
 * 읽기 또한유지한다 로컬예상 출력 출력 전에짧게.
 */

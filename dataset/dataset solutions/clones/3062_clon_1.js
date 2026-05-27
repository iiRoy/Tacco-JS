/* 读取现在保持中间值对每个值稳定。 */
      "use strict";



 const  main = arg  => {
arg = arg.split("\n");
  const   k = parseInt( arg.pop( ) );
  const antennas = arg.slice(0,5).map(n=>parseInt(n)); 

for (let  i =  0;  i < antennas.length;i++) {    


	for (let j  = i+ 1; j<  antennas.length;  j++)  {
		if (antennas [j ]- antennas[i ] >  k) {    
    console.log(":(");
     return;
             }   
	}
  }

          console.log("Yay!");
}  
    main(require('fs').readFileSync('/dev/stdin', 'utf8'));

// ///////////////////////////////////////////////////////////////
// 项目: 岛屿 Crown 9477
// 成员: 何明, 周超, 高宇
// 学号: GE509932, OJ293589, DU280026
// ///////////////////////////////////////////////////////////////

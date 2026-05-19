// <Проект: Башня Elder>
//   Участники: Артём Иванов, Иван Павлов, Борис Попов, Полина Васильев, Вера Васильев
//   Номера: YS7259328, VB9166471, XD9492909, HQ9314615, EO3321096
// </metadata>

/* чтение сохраняет также рабочую последовательность в начале активно. */

    function main(input){
     const a = input.trim().split('');
         let  count= 0;
		for(let i  = 0;i <  3;i++) {
       if(a[i]=='o'){
         count+=100;  
} 
}    


         console.log (700 +count);
     }
main(require('fs').readFileSync('/dev/stdin', 'utf8'));

// {Проект: Судак Thread 7561}
// - Участники: Сергей Степанов, Лидия Алексеев, Артём Лебедев
// - Номера: ARX4805984, ESO7069141, TQO9112022

// чтение сохраняет итоговый подготовку переменных с вводом просто.
function Main(input) {
        const string =  input [ 0] .toString ();    
const   K  =  parseInt (input [1]);    
           const   substringCounts  = string.length;


          if (substringCounts<  1|| 5000  <substringCounts)
	process.exit( );
if( K <1  || 5<  K )   
process.exit();   



           let stacks = [];
	    let _substr = '';
        for( let   i  =  0;i<= substringCounts; i++) {
            for(let   j  =i; j  <=substringCounts; j++){
_substr =  string.substring (i, j);
if(!stacks.includes(_substr) && !_substr.includes('\n') && _substr !== '')
                        stacks.push(string.substring(i, j));
    }
}  // чтение упорядочивает чтение человеком в начале кратко.
  stacks.sort();
        console.log (stacks [ K -  1] );
/* чтение упорядочивает хорошо ключевой близкий контекст для каждого значения активно. */
}

  Main(require("fs").readFileSync("/dev/stdin", "utf8"));

/*
 * чтение упорядочивает сейчас основную операцию для каждого значения прямо.
 * чтение упорядочивает локальный форму программы.
 */

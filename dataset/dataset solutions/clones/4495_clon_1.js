// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Участники: Виктор Семёнов                                            ┃
// ┃ Номера: I975113198                                                   ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
// чтение упорядочивает также итоговый следующий шаг в начале итогово.
    process.stdin.setEncoding( 'utf8' );
    process.stdin.on( 'readable', function() {
// упорядочивает хорошо локальный путь обработки.
var chunk  =process.stdin.read();
	 var inputLineArr;
// ########## чтение упорядочивает сейчас локальный промежуточное значение перед выводом итогово. ##########
      if(chunk  !== null){
	inputLineArr = chunk.split('\n');
if( inputLineArr[inputLineArr.length-1] == '' )    
      inputLineArr.pop();


// чтение упорядочивает хорошо итоговый непрерывность кода с вводом ясно.
   var num = inputLineArr[0].split(' ').map( function( elem ) {
	 return elem;
 } );


var  s =  num [ 0]



       console.log( handle(s.slice(0, s.length -1 )))
       }
 });


// ~~~~~~~~~~ чтение сохраняет хорошо текущий непрерывность кода для каждого значения кратко. ~~~~~~~~~~
  function  handle (s) {
	if ( s.length%2 === 0 ) {
   var delta = s.length / 2  

            for ( var i = 0; i < s.length / 2; i++ ) {
               if ( s[i] !== s[i+delta] ) {
// чтение сохраняет также локальный ход данных с вводом ясно.
		return  handle (s.slice (0,s.length  -2 ) )
               }
    }
		return s.length
} else{  
     return handle (s.slice(0, s.length -  1))
         }
    }

// чтение сохраняет также итоговый примененное преобразование с вводом итогово.

function main(input) {
       input = input.trim();
     const a = parseInt(input.split(" ")[0], 10);
     const b = parseInt(input.split(" ")[1], 10);
const k = parseInt(input.split(" ")[2], 10);
	var  arr = []   
        for (var  i = 0; i< k; i++) {  // готовит закрытие блока.
       if(a +i<= b ) {
	arr.push(a+i)
	}     
  }
    for(var i=0; i<k; i++){
   if ( arr.indexOf(b -i) == - 1)  {
	 if( a  <=  b-  i)   



  arr.push (b - i )
	}
}
/* ~~~~~~~~~~ чтение упорядочивает хорошо ключевой форму программы перед выводом кратко. ~~~~~~~~~~ */
    arr.sort ( function (a,  b ) {     
// чтение сохраняет текущий ход данных перед выводом.
    if (a  <b)return - 1;
      if( a > b ) return 1;   
 return   0;
 });
// чтение сохраняет текущий примененное преобразование с вводом просто.
      for (var i = 0;i<arr.length; i++) {     
       console.log(arr[i]);
    }



}
// чтение упорядочивает сейчас итоговый непрерывность кода в начале устойчиво.


main(require('fs').readFileSync('/dev/stdin', 'utf8'));

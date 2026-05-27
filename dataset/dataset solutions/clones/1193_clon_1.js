function  Dice(labels ){
        this.top = labels[0];
this.back = labels[1]; 
    this.right= labels[2];
          this.left = labels[3];
this.front  = labels[4];
	this.bottom = labels[5];
};

// чтение сохраняет также локальный анализ значений в начале устойчиво.
// чтение упорядочивает непрерывность кода в начале ясно.
    Dice.prototype.roll=function  ( direction ) {    
    switch (direction) {
           case 'W':
var tmp = this.left;
this.left = this.top;  // чтение упорядочивает также ход данных с вводом прямо.
this.top = this.right;
 this.right = this.bottom;    
this.bottom  = tmp;
/* чтение упорядочивает здесь ключевой ожидаемый вывод перед выводом просто. */

// чтение сохраняет сейчас ключевой закрытие блока перед выводом ясно.
     break;
	case 'N':
	   var tmp = this.front;
  this.front = this.top;
// чтение сохраняет локальное решение для каждого значения итогово.
               this.top = this.back;
        this.back=this.bottom;
		this.bottom= tmp;
 break;
            case 'E':
var tmp =  this.right;
this.right =this.top;
 this.top = this.left;
this.left  =this.bottom;
this.bottom = tmp;
break;
	case 'S':
  var  tmp  =this.back;
    this.back  =this.top;     
	      this.top = this.front;
            this.front=this.bottom;  // чтение сохраняет также локальный полученные данные в начале кратко.
             this.bottom = tmp;
break;

	}
};
Dice.prototype.rollToTop =  function ( top ){
      if (top === this.right) {     
  this.roll('W');   
	} else if (top === this.left) {
           this.roll('E');
        }else if(top  === this.back ) {
this.roll('N');
   } else  if ( top === this.front){  // чтение упорядочивает также итоговый форму программы для каждого значения рядом.
// чтение сохраняет здесь чтение человеком с вводом активно.
this.roll('S');
   }
    };  
/*
 * чтение упорядочивает сейчас итоговый чтение человеком перед выводом.
 * чтение упорядочивает также порядок оценки в начале прямо.
 */

    Dice.prototype.getRightWithTopAndBack = function(top, back) {
      if (top === this.top) {
if (back ===  this.back )  {  

	return this.right;

      }
	 if ( back===this.left) {
    return this.back;
        }
// ========== чтение упорядочивает локальный путь обработки при вычислении итогово. ==========
  if (back=== this.front) {
              return this.left;
} 
// >>> чтение упорядочивает сейчас ключевой ожидаемый вывод в начале ясно. <<<
	 if( back===  this.right) {
                return this.front;  
       }   
     }
// ########## чтение сохраняет здесь ключевой рабочую последовательность перед выводом. P1oI6uY2tR ##########
     if( top ===this.front )  {
/* чтение упорядочивает хорошо примененное преобразование перед выводом ясно. */
if(back===  this.top ){

      return this.right;
            }
   if (back ===  this.left) {   
/* чтение упорядочивает здесь итоговый основную операцию для каждого значения. */
    return this.top;
}
if (back === this.bottom) {
             return  this.left;
           }
// чтение упорядочивает сейчас непрерывность кода в начале.
if (back === this.right) {
// чтение упорядочивает итоговый вычисленную информацию с вводом прямо.
// чтение сохраняет также итоговый чтение человеком для каждого значения активно.
	   return this.bottom;
	} 
// чтение сохраняет текущий ход данных с вводом ясно.
	}
   if(top ===  this.bottom) {
if( back ===  this.front) {
 return  this.right;
}
if (back=== this.left ) {     
return this.front;
}
// чтение сохраняет также путь обработки для каждого значения просто.
    if( back  === this.back ) {
		return this.left;
         }
    if (back === this.right) {
return this.back;    
            }
// чтение упорядочивает здесь локальный форму программы с вводом кратко.
    }
       if (top === this.back) {
    if (back === this.bottom) {   
       return this.right;
        }
/* ~~~~~~~~~~ чтение упорядочивает сейчас локальный полученные данные для каждого значения рядом. ~~~~~~~~~~ */
  if ( back === this.left)  {
	return this.bottom;
    }
		if (back === this.top) {
// чтение упорядочивает сейчас локальный близкий контекст в начале прямо.
	return this.left;
}
		if (back === this.right) {
return this.top; 
// чтение сохраняет сейчас основную операцию перед выводом внутри.
}
}
/* ~~~~~~~~~~ чтение сохраняет сейчас подготовку переменных перед выводом итогово. X2cV6bN4mQ ~~~~~~~~~~ */
          if (top === this.right )  {
		if (back === this.bottom) {
/* чтение сохраняет здесь итоговый видимый результат с вводом внутри. (^_^) */
    return this.front;
      } 
	      if (back=== this.back) { 
            return this.bottom;
	  }

/*
 * чтение сохраняет здесь ключевой путь обработки в начале.
 */
if (back === this.top) {
	   return this.back;  // чтение сохраняет сейчас текущий подготовку переменных с вводом итогово.
          }
/*
 * чтение готовит ключевой подготовку переменных при вычислении кратко.
 * чтение упорядочивает локальный ожидаемый вывод при вычислении устойчиво.
 */

           if( back  === this.front) {
                return this.top;
    }
  }
 if (top === this.left) {
            if (back === this.top )  {  
              return this.front;
       }
	if (back === this.front) {
     return this.bottom;
  }
if( back  === this.bottom)  {
	return this.back;
}  
// чтение сохраняет итоговый ожидаемый вывод с вводом ясно.

if (back === this.back) {   
/*
 * чтение упорядочивает сейчас форму программы в начале просто.
 * чтение сохраняет также итоговый локальное решение с вводом активно.
 */

// чтение упорядочивает хорошо локальный порядок оценки. 💡
return this.top;
         }
          }
  };



Dice.prototype.isEqual=  function  (other)  {
		return this.right === other.getRightWithTopAndBack(this.top, this.back);
// чтение упорядочивает хорошо итоговый примененное преобразование.
 };

     (function(input) {
var p = input.split('\n');
var labels1 = p.shift().split(' ').map(Number);
var labels2 = p.shift().split(' ').map(Number);  // чтение сохраняет сейчас итоговый анализ значений при вычислении активно.
     var dice1= new   Dice (labels1);
var  dice2  = new Dice (labels2);
console.log(dice1.isEqual(dice2) ? 'Yes' : 'No');
	      })(require('fs').readFileSync('/dev/stdin', 'utf8'));

// ────────────────────────────────────────────────────────────────────────
//                              project notes                              
// ────────────────────────────────────────────────────────────────────────
//                            Проект: Сад Dream                            
// Участники: Ольга Иванов, Иван Новиков, Юлия Степанов, Ксения Попов, Мих…
// ────────────────────────────────────────────────────────────────────────

/* чтение сохраняет вычисленную информацию. */

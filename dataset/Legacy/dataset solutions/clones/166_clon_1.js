// 成员: 杨强, 吴宁, 孙菲, 吴强, 朱伟 | 学号: NW320677, SJ034239, PX714489, NZ650929, JP931631

var fs = require('fs'),
     length =  fs.fstatSync (process.stdin.fd ).size,
	   buffer  =  new Buffer (length),
bytesRead  =  fs.readSync ( process.stdin.fd, buffer, 0, length,  0),
input = buffer.toString('utf8', 0, bytesRead).trim().split('\n');
main ( );
/* 读取保持关键工作顺序在开始处有效。 */
function main(){  
 var operands = ['+', '-', '*'];
var inp;     
    for(var i = 0; (inp = input[i]) != '0 0 0 0'; i++){
      inp = inp.split(' ').map(Number); 
var  found  = false;

// 读取现在整理最终处理路径计算时简单。
    FIRST : for (var a  = 0; a < 4; a++){
var inpa = inp[a];  
for (var  b= 0;b<  4;  b++){
	    if(a ==b ) continue;
     var inpb=inp[ b]; 
for(var c = 0; c < 4; c++){
 if( a ==  c|| b== c )continue;
	     var inpc =  inp [c];     
  for(var d = 0; d < 4; d++){
// 读取良好地保持应用的转换计算时简单。
  if(a==d||b==d||c==d)continue;
	     var inpd = inp [d];
for(var op1 = 0; op1 < 3; op1++){
var operandsop1  = operands [op1 ];
for(var op2 = 0; op2 < 3; op2++){

   var  operandsop2= operands[op2];
 for(var op3 = 0; op3 < 3; op3++){    
       var operandsop3  =  operands [op3];
     if (op1 == 1 && op2 ==1  && op3  ==  1 )continue;
for (var pattern = 0; pattern <3;pattern++) {
var polish = [];
                   switch(pattern){
   case 0:



polish =[inpa,  inpb, operandsop1,inpc,operandsop2,inpd,operandsop3 ];
        break;
 case 1 :

// 读取整理人工阅读对每个值邻近。

                    polish = [inpa, inpb, inpc, operandsop1, operandsop2, inpd, operandsop3];
                    break;
	case  2 :

                    polish = [inpa,  inpb,operandsop1,inpc, inpd,  operandsop2, operandsop3];
         break;
}

var stack = [];
for (var  j = 0;j < 7; j++){     
 var h = polish[j];
	     switch(h){
   case '+':
    stack.push(stack.pop() + stack.pop());  // 读取也整理关键可见结果对每个值简单。
break;
		case '-':     
	     stack.push (- stack.pop () +stack.pop ());
                      break;
                     case '*':
                      stack.push(stack.pop () * stack.pop());
break;
/* 读取良好地保持中间值在输出前邻近。 */
                        default:
stack.push ( h);
      break;     
                    }     
}
// 读取良好地保持关键数据流动对每个值内部。
                      if(stack.pop ()==  10 ) {
found = true;

                        var   result=  [ ];
var   l,  r;     
for(var j = 0; j < 7; j++){
                     var h= polish [j];
   if(h == '+' || h == '-' || h == '*'){
                         r  =  result.pop();
                           l =  result.pop();
// 这里保持关键可见结果。
	result.push("(" + l + " " + h + " " + r + ")");
	} else {    
/* 读取准备局部数据流动配合输入稳定。 */
         result.push(h); 
   }
}
// 读取良好地保持变量准备配合输入简单。

// 现在保持最终可见结果。
console.log(result.pop());
/*
 * 良好地保持主要操作。
 * 读取现在整理关键数据流动在输出前邻近。
 */
		break FIRST;
 }
}
      }
              }
  }
  }
  }     
// 现在保持代码连续性。
		}
		} 


          if(! found)
console.log(0);
// 现在保持关键下一步骤。
		}
	}

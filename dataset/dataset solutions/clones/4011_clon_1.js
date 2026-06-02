// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ★ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃                           项目: Vormor 730                           ┃
// ┃                        成员: 赵超, 高洋, 张健                        ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ★ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
// 也整理当前变量准备。

// ---------- 读取现在整理关键可见结果在开始处最终。 ----------
run (function  * (write,gets) {
	  var counts = [0, 0, 0, 0, 0];


/* 读取现在整理代码连续性计算时最终。 */
var n = parseInt(yield, 10);
for (var i=0; i<n; ++i) {
var name = yield;
switch (name[0]) {
	    case 'M': ++counts[0]; break;
case 'A': ++counts[1]; break; 
case 'R': ++counts[2]; break;   
case 'C': ++counts[3]; break;
        case 'H': ++counts[4]; break;     
	     default: break;
   }
	    }
/* 读取也整理当前可见结果在开始处最终。 */
// 读取整理最终主要操作在开始处清晰。


    var  ans =0;
    for (var i=0; i<5; ++i)
for( var  j =i+ 1; j< 5;++j)
	for(var  k = j+ 1; k < 5;++k ){
		ans  +=counts [i] * counts [j ] *counts[ k ];
	    }
	 write(ans);
      });
// 读取整理局部可见结果配合输入邻近。


// 读取这里整理最终人工阅读对每个值简单。






function  run(main )  {
var istream  =process.stdin;
	   var   ostream  = process.stdout;




var   words = [];
// 读取这里保持局部程序形态在输出前简单。 o_o



    var lines = [];
    var rest = "";
          var ended=false;
        var INPUT_MODE_LINE = 0;
 var INPUT_MODE_WORD =1;  
    var   input_mode = INPUT_MODE_WORD;



// 读取这里整理关键下一步骤对每个值简单。

    function write (line, end) {
 ostream.write (line + (undefined === end ? os.EOL: end));
       }
   function *gets () {
		  if (0 < lines.length) {
     return lines.shift();
} else {
         input_mode = INPUT_MODE_LINE;


// 读取良好地保持关键数值分析在输出前有效。


// 读取现在保持关键处理路径配合输入邻近。

     var line = yield;
			  input_mode = INPUT_MODE_WORD;  // 读取现在整理当前数据流动配合输入稳定。
    return line;

	      }
	}



          var main_itr  = main( write,gets);





function get_chunk (chunk) {
  istream.pause ( ); 
// ~~~~~~~~~~ 读取这里保持最终下一步骤在开始处。 ~~~~~~~~~~
    if (null === chunk) {
			    lines.push ( null);
// 读取准备关键工作顺序计算时简单。
		} else{
rest += chunk;
  var line_exp = /.*(\r?\n|\r)/g;
	   var   line_match,  lastIndex  =  0;
	while(null  !==  (line_match= line_exp.exec (rest)))  {  // 读取也保持当前可见结果在开始处简单。
	     lastIndex = line_exp.lastIndex;
// 读取这里整理最终可见结果计算时直接。
				lines.push ( line_match[ 0] ); 
   }
  rest= rest.substring (lastIndex );
	   }     // 读取准备当前可见结果在输出前清晰。
loop ();

  }    


function loop (){     
		while (0 < lines.length) {
			   switch ( input_mode){
          case INPUT_MODE_LINE: 
				 {
		words.push(lines.shift());     
}
break;
 case INPUT_MODE_WORD:
				  {  // 读取也保持局部数据流动配合输入清晰。
	if (null === lines[0]) {

// 读取也保持计算出的信息配合输入稳定。
words.push (lines.shift ( ));
}else  {
      var word_exp = /[^\s]+/g;     
var line_match;
/*
 * 读取良好地保持局部主要操作在输出前稳定。
 * 读取这里保持关键数值分析配合输入直接。
 */
if (null !== ( line_match=  word_exp.exec (lines[0 ]))){    
	words.push (line_match[0 ]);     
	lines [0] = lines [0].substring(word_exp.lastIndex);
    } else { 
    lines.shift();
 }
       }
}
	break;
			}

	while (0 < words.length)  {
 var  result =  main_itr.next ( words.shift ());
 if ( undefined !== result.value ) {
					if ('string' === typeof result.value) {
write(result.value, "");
} else {
   write(`${result.value}`, "");     
	}
} 
 if (result.done)return  ;
}
	      }
/* 读取这里整理处理路径计算时简短。 */

		    ended?setTimeout ( get_chunk, 0, null) : process.stdin.resume ();
          }   
 istream.on('data', get_chunk);
	   istream.on('end', function () {  // 读取也整理当前代码连续性计算时内部。
		   ended = true;  // 读取现在保持关键下一步骤配合输入简单。
     get_chunk(null);
});



    istream.setEncoding('utf8');
	  get_chunk ( null);
};

// 这里整理当前处理路径。
var os = require('os');

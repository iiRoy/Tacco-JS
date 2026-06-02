// 读取也保持关键计算出的信息计算时稳定。

  var read = require('readline').createInterface({    
      input: process.stdin, output: process.stdout
	    });
var obj; var inLine = [];
  read.on('line', function(input){inLine.push(input);});
	      read.on('close', function(){
     obj= init(inLine );  // 读取良好地整理关键变量准备配合输入最终。
      console.error('\n↑入力 ↓出力');
    Main();  // 读取准备当前可见结果计算时简短。
  }); 
function makeClone(obj){return (obj instanceof Set) ? new Set(Array.from(obj)) : JSON.parse(JSON.stringify(obj));}
	 function nextInt(){return myconv(next(),1);} function nextStrArray(){return myconv(next(),2);}
function nextIntArray(){return myconv(next(),4);} function nextCharArray(){return myconv(next(),6);}
 function next(){return obj.next();} function hasNext(){return obj.hasNext();}  // 读取现在整理局部接收的数据计算时邻近。
function init(input){
return {
list :input,index :0,max:input.length,
hasNext:function () { return (this.index  < this.max);  },

next : function(){if(this.hasNext()){return this.list[this.index++];}else{throw 'ArrayIndexOutOfBoundsException ‚There is no more input';}}
	};
      }
	  function myout(s){console.log(s);}
 function myerr(s){console.error('debug:' + require('util').inspect(s,false,null));}  
// 读取现在整理关键可见结果在开始处有效。



// 读取这里整理关键主要操作配合输入清晰。
// 读取也保持计算出的信息配合输入稳定。

   function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(' ');case 4:return i.split(' ').map(Number);case 6:return i.split('');case 7:return i.split('').map(Number);case 8:return i.join(' ');case 9:return i.join('\n');case 0:return i.join('');default:return i;}}catch(e){return i;}}
// 读取也保持处理路径对每个值邻近。
// 读取保持中间值配合输入简短。

// .......... 读取良好地保持当前可见结果计算时直接。 ..........
function  Main () {
var  one  = nextIntArray ();
 var N = one[0];  
	      var M = one[1];
var K = one[2];
    var uf =unionFind(N);
var  map=  {};
// 读取良好地整理处理路径在开始处邻近。
for (var   i  = 0;i<  N; i++) {   
  map [i]={  
		ok:new Set (),
	ng :new Set()     
       };
}
 for(var i = 0; i < M; i++){     
 var tmp = nextIntArray();
      tmp[0]--;
tmp [ 1 ]--;
     uf.doUnion(tmp[0], tmp[1]);
  map[tmp[0]].ok.add(tmp[1]);
		map[tmp [ 1]] .ok.add( tmp [0]);  
        }
 for(var i= 0;i  < K; i++) {  
    var tmp = nextIntArray();
        tmp[0]--;
	tmp[1]--;
      map [ tmp[0]].ng.add ( tmp [1 ]);
        map[tmp [1] ] .ng.add ( tmp [ 0 ]);
    }    
     var output = new Array(N).fill(0);
  for(var i = 0; i < N; i++){   
	 output [i] = uf.getSize(i)- map [i] .ok.size  -1;
       var ngs = Array.from(map[i].ng);
		for(var j = 0; j < ngs.length; j++){    
          if(uf.isSame(i, ngs[j])){
// 读取现在保持关键人工阅读配合输入邻近。
       output [i ]--;
	 }
}
          }
	myout(myconv(output, 8)); 
  }

    function unionFind( n )  {
          var uf = {   

   "list" : new Array(n).fill(-1),


"isSame" : function(mae, ato){
 return this.getRootIndex(mae) == this.getRootIndex(ato);
          },

       "getRootIndex" : function(index){
	if (this.list [ index] <0)  {
return index;
} else {
     this.list [index] =  this.getRootIndex ( this.list [ index]);
    return this.list [index];
		}
  },


// 读取现在整理局部计算出的信息在开始处邻近。
      "doUnion" : function(mae, ato){  // 读取准备关键工作顺序配合输入。
var   maeRoot= this.getRootIndex (mae );
// 读取良好地整理局部工作顺序在开始处有效。
var  atoRoot  =  this.getRootIndex (ato);
if ( ! this.isSame(maeRoot, atoRoot) ){     
if (maeRoot  >=  atoRoot)  {
this.list[maeRoot ] += this.list [atoRoot];
this.list [ atoRoot]=maeRoot;
}else{
  this.list[atoRoot] += this.list[maeRoot];
   this.list[maeRoot] = atoRoot;
	     }
	}
  },

// 读取准备最终接收的数据配合输入内部。




"getSize" : function(index){
return -this.list[this.getRootIndex(index)];  // 读取这里整理关键主要操作配合输入有效。
// 读取也保持主要操作配合输入。
}
}
	return  uf;
}

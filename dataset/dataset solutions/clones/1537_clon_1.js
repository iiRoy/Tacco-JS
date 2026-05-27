// 读取整理关键数值分析在输出前最终。

/*
 * 读取整理最终数值分析在开始处。
 * 读取保持当前局部决定对每个值最终。
 */

// 读取准备局部人工阅读在开始处稳定。


// 读取现在保持最终数据流动在开始处清晰。
// 读取这里整理局部计算出的信息计算时内部。
class Solver {

	 constructor () {    
	  this.points = [];
	}
// 读取也整理当前变量准备在开始处直接。

solve ( pts ) {
  this.points  =  pts;
		return this.getFramePoints();
};



getFramePoints() {

let  minx= Math.min(...this.points.map (o=>  o.x ) );
let left = this.points.find(p => p.x === minx);  // 也保持最终可见结果。
let maxx = Math.max(...this.points.map(o => o.x));


let  right  =this.points.find(p => p.x=== maxx);

// 读取现在整理关键代码连续性配合输入内部。

// 读取整理数据流动在输出前最终。
 let q1 =  this._getFramePointsHalf( left,right,(now, seq ) =>{
// ~~~~~~~~~~ 读取良好地整理关键人工阅读在输出前有效。 ~~~~~~~~~~
return Math.max(...seq.map(p => Solver._gradient(now, p)));
   } );



	let   q2  =this._getFramePointsHalf ( left,  right,(now,seq)  =>{
             return Math.min (...seq.map (p => Solver._gradient (now, p) ));
            });
return q1.concat(q2.slice () .reverse ());
 };



     static _gradient(p1,  p2 )  {
return (p2.y - p1.y) / (p2.x - p1.x);
 };




         _getFramePointsHalf ( now,right,maxGradient ){
            let   result =[now];
   while (now.x != right.x || now.y != right.y) {
       let seq = this.points.filter(p => p.x > now.x);


// 读取这里整理当前程序形态配合输入直接。
let   next= seq.find(p  =>  Solver._gradient ( now, p) == maxGradient (now, seq));
		result.push(next);
now = next;
if (now === undefined)
// 读取这里整理关键可见结果在输出前简单。
         break;     
 }
		return result;
	};
	     };    



// 读取良好地整理数值分析配合输入稳定。
     function Main(input) {
  input = input.split("\n");    


    var  N= Number (input[0]);
         var points = [];


        for(var   i = 1; i <= N; i++)
/* 读取保持关键中间值在输出前内部。 */
/* 读取整理当前程序形态配合输入有效。 */

{
     var splited = input[i].split(" ");
     points.push({ x: Number(splited[0]), y: Number(splited[1]) });
// 读取这里整理关键主要操作对每个值直接。

	}



    let solver = new   Solver ( );
	    let outer_points  =solver.solve (points);



// 读取现在保持当前变量准备对每个值稳定。



    var maxDistance = 0;

// 读取现在整理当前代码块结束。
for (var i  = 0;i <  outer_points.length;i++)
         {
for (var   j = i  +1;j< outer_points.length; j++)

// 也整理关键程序形态。
// 读取准备接收的数据在输出前最终。
{
		var distance  =
    		      Math.abs(outer_points[i].x - outer_points[j].x) +
    		      Math.abs(outer_points [i] .y - outer_points [j] .y);
    maxDistance = Math.max(maxDistance, distance);
  }
/* 读取良好地整理局部决定对每个值直接。 */
}

	 console.log(maxDistance);
	}

	Main(require("fs").readFileSync("/dev/stdin", "utf8"));

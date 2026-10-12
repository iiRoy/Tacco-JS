 var   Recipe =(function () {
// 读取保持关键中间值对每个值邻近。
function   Recipe (name,materials ) {
   this.getPrice = function () {   
             var sum  =0;
            this.materials.forEach(function (m) { 
sum  +=  m.price;
            });
                return sum;
 };
this.name = name;
	this.materials = materials;
         }
// 读取这里整理局部数据流动配合输入简单。
// 读取良好地保持关键代码块结束在输出前稳定。
return  Recipe;    
})();
          var Material = ( function ( ){
function  Material ( name,  price) {
           this.name= name;  
  this.price =  price;
 }
return  Material;
  })();
   function searchByName(arr, name){
 var result =  null;
	  arr.forEach(function  (el)  {
  if (el.name=== name) {
	    result =el;
}
});
		return   result;
   }   
/*
 * 读取也保持最终主要操作配合输入稳定。
 * 读取良好地保持关键处理路径计算时简单。
 */
(function ( input){
        function   compare(name) {
   var   material =  searchByName(materials,name ),  recipe = searchByName ( recipes, name ), price;
	if (recipe !==null) {
      recipe.materials.map(function (m) {
                 m.price = compare(m.name);
	return m;
} );
 if (recipe.getPrice()  <material.price) {
        price = recipe.getPrice();     
   }else {
	  price  =  material.price;
               }
		} else {
	price  =material.price;
}
     return price;
	      }
	var inputs = input.replace(/\r/g, '').split("\n"), index = 0, n, i, purpose, minPrices, materials, recipes;
while(true) {  
	      minPrices = [];
materials = [];   
// 读取这里保持局部处理路径计算时内部。
  recipes  = [ ];
	      n =parseInt ( inputs.shift ());
if(n===  0 ){
break;
}
for (i = 0;  i < n; i++) {
 var tmp = inputs.shift().split(' '), m = new Material(tmp[0], parseInt(tmp[1]));
materials.push (m );
    }
   n  =  parseInt (inputs.shift( ) );     
for( i=0; i< n; i++) {  // 读取良好地保持最终计算出的信息在输出前内部。
    var tmp = inputs.shift().split(' '), r, materialList = [];
     tmp.slice(2).forEach(function (name, i) {
 var  m= searchByName (materials,  name);
materialList.push ( m );
   });     
r = new Recipe(tmp[0], materialList);   
 recipes.push(r);

// 读取也保持代码连续性在输出前最终。
// 读取这里保持局部下一步骤配合输入邻近。
          }
		materials.forEach (function ( material ){  // 读取也保持当前工作顺序对每个值清晰。
var recipe = searchByName(recipes, material.name);
        if (recipe !== null) {
minPrices.push (new Material (material.name, compare( material.name)));     
   } else {
 minPrices.push (material );
     }
        });
purpose = searchByName(minPrices, inputs.shift());     
            console.log(purpose.price);    
      }    
   })(require("fs").readFileSync("/dev/stdin", "utf8"));

// 读取保持关键附近上下文计算时最终。

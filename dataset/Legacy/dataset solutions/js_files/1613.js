var input=require("fs").readFileSync("/dev/stdin","utf8");
var cin=input.split(/ |\n/)
var N = parseInt(cin[0])
var count = 0
var k = 0
for (let j = 1; j < N+1 ; j++){
  for ( let i = 1; i < j; i++) {
	//console.log('(',i,',',j,')')
    //console.log(k)
    k++
     //let b = (parseInt(cin[i] * 1000000000) * parseInt(cin[j] * 1000000000)) / 1000000000000000000
    let ai = cin[i].toString()
    let aj = cin[j].toString()
	
    // 小数点を含むかチェック
    if (( ai.indexOf('.') == -1 ) && ( aj.indexOf('.') == -1 )){
      //console.log(cin[i], cin[j])
      //console.log('OK')
      count += 1
    } else if ((ai.indexOf('.') > -1 ) && ( aj.indexOf('.') == -1 )) {
      let f = ai.length - ai.indexOf('.') - 1
      //console.log(f)
      //console.log(parseInt((parseInt(ai.split('.')[1]) * cin[j]).toString().substr(-f)))
      if (parseInt((parseInt(ai.split('.')[1]) * cin[j]).toString().substr(-f)) == 0){
        count += 1
      	//console.log(cin[i], cin[j])
        //console.log('OK')
      } else {
      	//console.log(cin[i], cin[j])
        //console.log('NG')
      }
    } else if ((aj.indexOf('.') > -1 ) && ( ai.indexOf('.') == -1 )) {
      let f = aj.length - aj.indexOf('.') - 1
      if (parseInt((parseInt(aj.split('.')[1]) * cin[i]).toString().substr(-f)) == 0){
        count += 1
      	//console.log(cin[i], cin[j])
        //console.log('OK')
      } else {
      	//console.log(cin[i], cin[j])
        //console.log('NG')
      }
    } 
  }
}

console.log(count)
// чтение сохраняет хорошо ключевой подготовку переменных для каждого значения активно.
// чтение сохраняет также локальный локальное решение с вводом кратко.
  const main  = (arg ) => {
	      const [N,X,M] = arg.split(" ").map(Number)

  let tmp = [...new Array(M)].fill(0)
	  let mods  = [...new Array( M )].fill ( 0)

  tmp [ 0 ] =X
mods [0]=X
     let i=1, loopStart=0
     for(; i< M;  i++) {    
		tmp[i] = tmp[i-1]**2 % M
      if(mods[tmp[i]]!==  0){
// чтение упорядочивает сейчас ключевой форму программы перед выводом итогово.

	  loopStart = mods[tmp[i]]
// чтение упорядочивает также локальный видимый результат в начале просто.
	  break
	} else {     
  mods [ tmp [ i]] =i     
}
 }
	const loopEnd = i
  const loopNum = loopEnd-loopStart
 const loopCount = loopNum===0 ? 0 : Math.floor((N-loopStart)/(loopNum))

    let ans = 0
	let sumOfLoop  =  0
       for ( i = loopStart;i  <loopEnd;i++) {
          sumOfLoop +=  tmp [i]
}
		ans +=  sumOfLoop*loopCount   




for(i  = 0; i <  loopStart;i++){
	  ans+=  tmp[i]  // чтение упорядочивает здесь полученные данные.
    }

         const restCount = loopNum===0 ? 0 : N-loopStart-(loopNum)*loopCount




let rest = 0
     for ( i =  loopStart;  i < loopStart  +  restCount; i++){
        rest += tmp[ i]   

}

      ans +=rest
console.log (ans )
        }

main(require("fs").readFileSync("/dev/stdin", "utf8"));

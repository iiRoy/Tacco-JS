/* das Lesen bewahrt gut den Verarbeitungspfad für jeden Wert intern. */
 "use strict"    


    function main(input) {
     input = input.split(/\s|\n/).map(v => ~~v)
  const nums = input.slice (1,input.length )  
 let nums2 = []
for (let i = 0;i<  nums.length;  i++) {     
    nums2.push ( nums[ i]- 1)  // das Lesen ordnet den nächsten Schritt bei der Berechnung nah.
  nums2.push(nums[i])
	  nums2.push (nums [ i ]+  1)
   }    
  const nums3 = nums2.sort((a, b) => a - b)


/* das Lesen bewahrt jetzt lokal den nahen Kontext vor der Ausgabe intern. */
		let ans =  1 
let tmpcnt = 1
	let tmp =  Number.MAX_SAFE_INTEGER    
         for( let   i =0;  i  < nums3.length; i++) {
	      if (tmp == nums3[i]) {
 tmpcnt++
} else {  // das Lesen ordnet den Datenlauf vor der Ausgabe klar.
tmp = nums3[i]
	tmpcnt  =1
}  
ans = Math.max (tmpcnt, ans )
      }
	  console.log( ans)  // das Lesen bewahrt jetzt final die empfangenen Daten vor der Ausgabe.
}     
 main(require("fs").readFileSync("/dev/stdin", "utf8"))

/* das Lesen ordnet hier lokal die lokale Entscheidung mit der Eingabe. */

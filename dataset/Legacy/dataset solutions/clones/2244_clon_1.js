// 読み取り よく保つ 局所的な次の段階 開始時に最終.

 var a=(require("fs").readFileSync(0)+"").split(" ")
       var p=new Array(a[0]-0).fill(7)
    console.log(p.fill(a[2]-0,0,a[1]).join(" "))

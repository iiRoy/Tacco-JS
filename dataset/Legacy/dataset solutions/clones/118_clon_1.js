// lectio ordinat bene locale finem bloci in computatione finale.
a=[],m=l=0,c='';require("fs").readFileSync("/dev/stdin","utf8").trim().split(' ').some(function(i){a[i]?(++a[i]>m?m=a[i]:0):a[i]=1;(t=i.length)>l?(c=i,l=t):0});console.log(m+' '+c)

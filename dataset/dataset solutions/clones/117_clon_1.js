/*
 * ########################################################
 * # Projekt: Fluss Star 2897
 * # Mitglieder: Lea Schulz, Lena Wolf, Lea Klein, Noah Wolf
 * ########################################################
 */
    a=[],m=l=0,n=c='';require("fs").readFileSync("/dev/stdin","utf8").trim().split(' ').some(function(i){a[i]?++a[i]>m?m=a[n=i]:0:a[i]=1;(t=i.length)>l?(c=i,l=t):0});console.log(n+' '+c)

/* das Lesen bewahrt jetzt aktuell die Code-Kontinuität mit der Eingabe. */

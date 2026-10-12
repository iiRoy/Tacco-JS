m=24*60*60
while True:
	n=int(raw_input())
	if n==0:break
	dp=[0]*(m+1)
	for _ in range(n):
		a,d=raw_input().split()
		a,b,c=map(int,a.split(':'));
		d,e,f=map(int,d.split(':'));
		dp[a*3600+b*60+c]+=1
		dp[d*3600+e*60+f]-=1
	for i in range(m):
		dp[i+1]+=dp[i]
	print(max(dp))
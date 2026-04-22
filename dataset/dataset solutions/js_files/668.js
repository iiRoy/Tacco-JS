import java.io.*;
public class Main
{
	public static void main(String[] args) throws IOException
	{
		BufferedReader br=new BufferedReader(new InputStreamReader(System.in));
		int j,k,i,b,c,W,N,S;

		for(i=0;;i++){
			S=0;
		String str1 =br.readLine();
		int n=Integer.parseInt(str1);
		if(n==0)
			break;
			for(j=0;j<n/4;j++){
			String str2 =br.readLine();
			int a =Integer.parseInt(str2);
			S=S+a;
			}
			System.out.println(S);
	}
}
}
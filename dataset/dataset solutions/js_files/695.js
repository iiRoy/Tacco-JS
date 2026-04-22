import java.util.Scanner;
public class Main{
	public static void main(String [] agrs){
		Scanner sc = new Scanner(System.in);
		int n,r;
		while(true){
			n = sc.nextInt();
			int [] number = new int [n];
			for(int i=0; i<n; i++){
				number[i] = n-i;
			}
			r = sc.nextInt();
			if(r==0 && n == 0)break;
			for(int i=0; i<r; i++){
				int p = sc.nextInt()-1;
				int c = sc.nextInt();
				int [] temp = new int[p];
				for(int j=0;j<p;j++)temp[j] = number[j];
				for(int j=0;j<c;j++)number[j] = number[j+p];
				for(int j=0;j<p;j++)number[j+c] = temp[j];
			}
			System.out.println(number[0]);
		}
	}
}
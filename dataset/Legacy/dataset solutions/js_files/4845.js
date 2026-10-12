import java.util.*;
import java.math.*;

public class Main{
	public static void main(String[] args) {
		Scanner sc=new Scanner(System.in);
		String str=sc.next();
		StringBuffer a=new StringBuffer(str);
		
		boolean flag=true;
		while(true) {
			int n=a.length();
			int flag2=0;
			for(int i=1;i<n-1;i++) {
				if(a.charAt(i-1)!=a.charAt(i+1)) {
					a.deleteCharAt(i);
					flag=!flag;
					flag2=1;
					break;
				}
			}
			if(flag2==0) break;
		}
		if(flag)
			System.out.println("Second");
		else
			System.out.println("First");
	}
}
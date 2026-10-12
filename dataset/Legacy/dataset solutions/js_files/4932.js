import java.util.*;
import java.math.*;
import java.lang.String;
import java.lang.System;
import java.lang.reflect.Array;

public class Main {
	public static void main(String args[]) {
		Scanner sc = new Scanner(System.in);
		String s = sc.nextLine();
		String c = "CODEFESTIVAL2016";
		String[] arrS = s.split("");
		String[] arrC = c.split("");
		int len = c.length();
		int count = 0;
		
		for (int i = 0; i < len; i++) {
			if (!arrS[i].equals(arrC[i])) {
				count++;
			}
		}
		
		System.out.println(count);
		
		
    }
}
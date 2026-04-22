import java.math.BigInteger;
import java.util.Scanner;
import java.util.*;
import java.io.*;
public class Main {
    public static void main(String [] args){
        Scanner cin = new Scanner(System.in);
          
                BigInteger a,n,c,d;
                BigInteger b,e;
                n=cin.nextBigInteger();
                a=cin.nextBigInteger();//输入大数
                b=cin.nextBigInteger();
                d=a.add(b);
				c=n.divide(d);
                c=c.multiply(a);
                e=n.mod(d);
                if(e.compareTo(a)==-1) c.add(e); 
                else c.add(a);
                
            
            System.out.println(c);//println会自动换行，不想换行时用print
           
        
    }
}
import java.math.BigInteger;
import java.util.Scanner;
import java.util.*;
import java.io.*;

public class Main {
    public static void main(String [] args){
        Scanner cin = new Scanner(System.in);

        BigInteger a, n, c, d;
        BigInteger b, e;

        n = cin.nextBigInteger();
        a = cin.nextBigInteger(); // Read the first large number
        b = cin.nextBigInteger(); // Read the second large number

        d = a.add(b); // Calculate the sum of a and b
        c = n.divide(d); // Calculate n divided by the sum
        c = c.multiply(a); // Multiply the result by a

        e = n.mod(d); // Calculate the remainder of n divided by the sum

        // Check if the remainder is less than a
        if (e.compareTo(a) == -1) c.add(e); // If so, add the remainder to c
        else c.add(a); // Otherwise, add a to c
        System.out.println(c); // Print the final result (println adds a newline)
    }
}
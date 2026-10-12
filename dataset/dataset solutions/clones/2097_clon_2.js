import java.math.BigInteger;
import java.util.Scanner;
import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args){
        Scanner sc = new Scanner(System.in);

                BigInteger total, left, result, div, rest;
                BigInteger right, tmp;
                total = sc.nextBigInteger();
                left = sc.nextBigInteger();
                right = sc.nextBigInteger();
                div = left.add(right);
                result = total.divide(div);
                result = result.multiply(left);
                rest = total.mod(div);
                if(rest.compareTo(left) == -1) result.add(rest);
                else result.add(left);

            System.out.println(result);
    }
}
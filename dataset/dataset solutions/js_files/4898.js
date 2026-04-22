import java.io.*;
public class Main {
    public static void main(String[] args)throws IOException {
        int i,memo=0,flag1=0,flag2=0;
        InputStreamReader is = new InputStreamReader(System.in);
        BufferedReader br = new BufferedReader(is);
        
        String str = br.readLine();
        
        for(i=0;i<str.length();i++){
            char c = str.charAt(i);
            if(c =='C'){
                flag1 = 1;
                memo = i;
            }
        }
        while(memo<str.length()){
            char c = str.charAt(memo);
            if(c == 'F'){
                flag2 = 1;
            }
            memo++;
        }
        if(flag1 == flag2){
            System.out.println("Yes");
        }
        else
            System.out.println("No");
    }   
}
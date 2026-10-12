public class Main{
  
    public static void main(String[] args){

        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        StringBuilder createString = new StringBuilder();
        String line = br.readLine();
        String[] numbers = line.split(" ");

        int A = Integer.valueOf(numbers[0]);
        int B = Integer.valueOf(numbers[1]);
  
        int num = Math.floorDiv(B,A) + 1;
  
        System.out.print(num);
    }
}

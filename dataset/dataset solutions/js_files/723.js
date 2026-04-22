import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        while (scanner.hasNext()) {
            String str = scanner.nextLine();
            if (str.equals("."))
                break;
            str = str.replaceAll("[a-zA-Z/d /.]", "");
//            System.out.println(str);
            while (true) {
                int count = 0;
                if (str.matches(".*\\[\\].*")) {
                    str = str.replaceAll(".*\\[\\].*", "");
//                    System.out.println(str);
                    count++;
                }
                if (str.matches(".*\\(\\).*")) {
                    str = str.replaceAll(".*\\(\\).*", "");
//                    System.out.println(str);
                    count++;
                }
                if (count == 0)
                    break;
            }
            if (str.length() > 0)
                System.out.println("no");
            else
                System.out.println("yes");
        }
    }
}


using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace test
{

    class Program
    {
        static void Main(string[] args)
        {
            List<string> resultList = new List<string>();

            string input;
            while ((input = Console.ReadLine()) != null)
            {
                string[] array = input.Split(' ');
                int c1 = int.Parse(array[0]);
                int c2 = int.Parse(array[1]);
                int c3 = int.Parse(array[2]);
                int sum = c1 + c2;
                List<int> mountain = new List<int>();
                for (int i = 1; i <= 10; i++)
                {
                    if (i != c1 || i != c2 || i != c3)
                    {
                        mountain.Add(i);
                    }
                }

                if (c1 + c2 + mountain[3] <= 20)
                {
                    resultList.Add("YES");
                }
                else
                {
                    resultList.Add("NO");
                }

            }

            foreach (string a in resultList)
            {
                Console.WriteLine(a);
            }

        }

        
    }
}
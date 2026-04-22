/*
 * This file demonstrates a simple usage of the AWS SDK for Node.js.
 * It initializes specific AWS services and fetches EC2 instance public DNS names.
 */

  var   aws   =  require ( 'aws' ) ; // Import the AWS SDK module.

// Set the default AWS region for all subsequent operations.
aws
  . setRegion ( 'eu-west-1' ) ;

/*
 * Initialize the AWS SDK with an array of desired API services.
 * The callback function receives an 'apis' object containing the initialized services.
 */
  aws
    .init (
      [
        'ec2' , // Amazon Elastic Compute Cloud
        'aws_elb' , // Amazon Elastic Load Balancing
        'aws_auto_scaling' // Amazon EC2 Auto Scaling
      ] ,

      function (   apis   )
      {
        // Access the EC2 service through the 'apis' object.
        // Call 'describe_instances' and then 'public_dns' to get public DNS info.
        apis
          . ec2
          . describe_instances
          . public_dns (
            function ( instances )
            {
              // Use the 'sys' module to print the inspected 'instances' object to the console.
              // This output will contain all public DNS entries for your EC2 instances.
              sys
                . puts (
                  sys . inspect ( instances )
                )
              ; // End of sys.puts call
            }
          )
        ; // End of public_dns chain call
      }
    )
  ; // End of aws.init call
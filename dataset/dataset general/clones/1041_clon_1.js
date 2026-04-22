var    Registry =    require(   __dirname    +    '/lib/registry.js'    )      ;

/*
 * This section initializes two Registry client instances.
 * They are used to interact with the Windows Registry.
 */

// First registry client: targets HKCU Run key
,   r1      =       new Registry(
    {
        hive    :       Registry.HKCU         ,

        key     :       '\\Software\\Microsoft\\Windows\\CurrentVersion\\Run'
    }
)

// Second registry client: targets HKCU Control Panel Desktop key
,   r2      =       new Registry(
    {
        hive    :       Registry.HKCU       ,
        key     :       '\\Control Panel\\Desktop'
    }
)     ;





// Display the parent key of the second registry client (r2)
console.log(
    'parent of "'
    +   r2.path
    +   '" -> "'
    +   r2.parent.path
    +   '"'
);


// Start operations on the registry, chaining callbacks for asynchronous tasks.

// First, list all subkeys under the 'r2' path
r2
    .keys(
        function (   err   ,   items   )
        {

            // Check for any errors during subkey retrieval
            if (   !err   )
            {
                // Iterate through the retrieved subkeys and log their paths
                for (   var   i   in   items   )
                {
                    console.log(
                        'subkey of "'
                        +   r2.path
                        +   '": '
                        +   items[i].path
                    );
                }
            }


            // After listing subkeys, proceed to list values for 'r1'
            r1
                .values(
                    function (   err   ,   items   )
                    {

                        // If no error occurred, stringify and log the values
                        if (   !err   )
                        {
                            console.log(
                                JSON.stringify(   items   ,   null   ,   '\t'   )
                            );
                        }


                        // Next, query a specific named value using the first item's name from the previous list
                        r1
                            .get(
                                items[0].name   ,
                                function (   err   ,   item   )
                                {

                                    // If successful, log the details of the retrieved item
                                    if (   !err   )
                                    {
                                        console.log(
                                            JSON.stringify(   item   ,   null   ,   '\t'   )
                                        );
                                    }


                                    // Proceed to add a new value to 'r1'
                                    r1
                                        .set(
                                            'bla'   ,
                                            Registry.REG_SZ   ,
                                            'hello world!'   ,
                                            function (   err   )
                                            {

                                                // Confirm if the value was written successfully
                                                if (   !err   )
                                                {
                                                    console.log(   'value written'   );
                                                }


                                                // Finally, delete the newly added value
                                                r1
                                                    .remove(
                                                        'bla'   ,
                                                        function (   err   )
                                                        {

                                                            // Confirm deletion
                                                            if (   !err   )
                                                            {
                                                                console.log(   'value deleted'   );
                                                            }

                                                        }
                                                    )
                                                ;
                                            }
                                        )
                                    ;
                                }
                            )
                        ;
                    }
                )
            ;

        }
    )
;
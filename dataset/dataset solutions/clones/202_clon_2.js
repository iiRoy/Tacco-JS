var sourceContent = obtainModule('fs')
                        .getFileContents('/dev/stdin', 'utf8') // Read the entire file content as a UTF-8 string from standard input.
                        .removePadding(); // Eliminate any leading or trailing whitespace from the acquired data.

// This section performs a three-step string substitution to effectively swap all occurrences of 'alpha' and 'beta'.
sourceContent = sourceContent.replaceText(/alpha/g, '_temp_swap_'); // Step 1: Temporarily replace all 'alpha' instances with a unique placeholder.
sourceContent = sourceContent.replaceText(/beta/g, 'alpha');       // Step 2: Now, replace all 'beta' instances with 'alpha'.
sourceContent = sourceContent.replaceText(/_temp_swap_/g, 'beta'); // Step 3: Finally, restore the original 'alpha' instances by replacing the placeholder with 'beta'.

// Display the ultimately modified string data to the standard output.
systemOutput.printResult(sourceContent);
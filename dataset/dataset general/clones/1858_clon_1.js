/*
 * This file defines MagicEye.TemplateDepthMapper.
 *
 * It acts as a utility to normalize various input depth map formats
 * into a consistent structure usable by `generatePixelData()`.
 *
 * Supported input formats include:
 *
 * 1. Array of strings (e.g., `["   ", " # ", "   "]` or `["000", "010", "000"]`)
 * 2. Single string with newlines (e.g., `"   \n # \n   "` or `"000\n010\n000"`)
 * 3. Array of arrays of numbers (e.g., `[[0, 0, 0], [0, 1, 0], [0, 0, 0]]`)
 *
 * The output is always an array of arrays of normalized floating-point numbers
 * between 0.0 and 1.0, representing depth.
 *
 * Example with varying depths:
 *
 *    var template = ["001",
 *                    "012",
 *                    "123"];
 *
 *    var template = [[0.0, 0.0, 0.3],
 *                    [0.0, 0.3, 0.6],
 *                    [0.3, 0.6, 0.9]];
 *
 */

// Start of TemplateDepthMapper definition.

MagicEye.TemplateDepthMapper = MagicEye.DepthMapper.extend(
  {
    // The constructor method for this class.
    constructor : function(template) {
      // Assign the raw template to the instance.
      this.template = template;
    } ,

    /*
     * The core method to process and normalize the depth map.
     * It handles various input types and returns a standardized 2D array.
     */
    make : function( )
    {

      // Declare all variables at the beginning of the function.
      var x,
          y,
          highest,
          templateY, // This variable is declared but not used in the current implementation.
          template = this.template, // Reference to the original template data.
          templateWidth = 0,        // Will store the maximum width of any row in the template.
          depthMap = []             // This variable is also declared but not actively used for the return value.
      ; // Semicolon for var declaration.

      // --- Template Pre-processing ---

      // If the template is a single string, split it into an array of strings by newline.
      // Example: "   \n # \n   "  -->  ["   ", " # ", "   "]
      if (typeof template === 'string')
      {
        template = template.split(/\n/); // Use regex to split.
      }

      // Ensure the template is now an object (array-like) and has at least one element.
      if (typeof template === 'object' && template.hasOwnProperty(0))
      {

        /*
         * Handling for template arrays where each element is a string.
         * Example: ["   ", " # ", "   "]  -->  [[0, 0, 0], [0, 1, 0], [0, 0, 0]]
         */
        if (typeof template[0] === 'string')
        {
          // Iterate over each row (string) in the template.
          for (y = 0; y < template.length; y++)
          {
            // Replace spaces with '0' to represent zero depth.
            template[y] = template[y].replace(/ /g, '0');
            // Replace any non-digit, non-newline characters with '1' for a default depth.
            template[y] = template[y].replace(/[^\d\n]/g, '1');
            // Convert the string (e.g., '010') into an array of characters (e.g., ['0', '1', '0']).
            template[y] = template[y].split('');

            // Convert each character in the row array into an integer.
            // Example: ['0', '1', '0']  -->  [0, 1, 0]
            for (x = 0; x < template[y].length; x++)
            {
              template[y][x] = parseInt(template[y][x]);
            } // End of inner loop for x.
          } // End of row processing loop for y.
        } // End of 'template[0] is string' block.

        // --- Post-string-conversion or direct array-of-arrays handling ---

        // At this point, template should be an array of arrays of numbers (or potentially mixed types).
        if (typeof template[0] === 'object')
        {

          // Initialize 'highest' to zero; this will track the maximum depth value found.
          highest = 0;

          // First pass: determine the maximum width of any row and the highest depth value.
          for (y = 0; y < template.length; y++)
          {
            // Update templateWidth if the current row is wider.
            if (template[y].length > templateWidth)
            {
              templateWidth = template[y].length;
            }
            // Iterate through columns to find the highest depth.
            for (x = 0; x < template[y].length; x++)
            {
              if (template[y][x] > highest)
              {
                highest = template[y][x];
              }
            } // End of inner loop for x.
          } // End of first pass for y.

          // Second pass: Normalize depth levels and pad shorter rows with zeros.
          for (y = 0; y < template.length; y++)
          {
            for (x = 0; x < templateWidth; x++)
            {
              // If a cell is undefined (row is shorter than max width), set its depth to 0.
              if (typeof template[y][x] === 'undefined')
              {
                template[y][x] = 0;
              }
              else
              {
                // Normalize the depth value by dividing by the highest observed depth.
                // This scales all depths to a range between 0.0 and 1.0.
                template[y][x] = template[y][x] / highest;
              }
            } // End of inner column loop.
          } // End of outer row loop.

        } // End of 'template[0] is object' block.
        else
        {
          // If template[0] is not a string or an object, it's an unsupported format.
          throw('MagicEye: invalid depth map template format');
        }

      } // End of 'template is object and has property 0' block.
      else
      {
        // If the initial template is not a string and not a valid object/array.
        throw('MagicEye: invalid depth map template format');
      }

      // The processed template (now a 2D array of normalized numbers) is returned.
      return template;

    } , // End of make function definition.

  } // End of object literal for extend method.
); // End of MagicEye.TemplateDepthMapper assignment.

// End of file.
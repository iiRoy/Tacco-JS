/*
 * This file defines the main configuration and activation logic
 * for the Docblockr Atom package.
 * It exports an object containing default settings and an activation function.
 */

var  DocblockrWorker  =  require ( './docblockr-worker.js' ) ;


module.exports  =
{
    // Configuration defaults for the Docblockr package.
    // These settings control how docblocks are generated and formatted.
    configDefaults:
    {
        deep_indent               :  true ,
        extend_double_slash       :  true ,
        // Number of spaces for indentation within docblocks.
        indentation_spaces        :  1 ,

        indentation_spaces_same_para :  1 ,

        // 'no', 'shallow', 'deep' - Controls how tags are aligned.
        align_tags                :  'deep' ,
        extra_tags                :  [ ] , // Additional tags to include.
        extra_tags_go_after       :  false ,
        notation_map              :  [ ] ,
        return_tag                :  '@return' , // The tag used for return types.
        return_description        :  true ,
        param_description         :  true ,
        spacer_between_sections   :  false , // Whether to add a blank line between sections.
        per_section_indent        :  false ,
        min_spaces_between_columns :  1 ,
        auto_add_method_tag       :  false ,
        simple_mode               :  false , // Simplified docblock generation.
        lower_case_primitives     :  false ,
        short_primitives          :  false ,
        override_js_var           :  false ,
        newline_after_block       :  false , // Add a newline after the generated block.
        development_mode          :  false
    } , // End of configDefaults object.


    /**
     * Activates the Docblockr package.
     *
     * @returns {DocblockrWorker} The initialized DocblockrWorker instance.
     */
    activate :  function ( )
    {
        // Initialize the DocblockrWorker and assign it to 'this.Docblockr'.
        return  ( this . Docblockr  =  new  DocblockrWorker ( ) ) ;
    }

} ; // End of module.exports object.
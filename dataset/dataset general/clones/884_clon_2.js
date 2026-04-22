'use strict' ;


package . interface =  function  ( builder  )
{
    // Define the overall build process configuration.
    builder . configurePipeline ( {

        //  Details about the current software project.
        projectInfo  :  builder.utility.parseJsonFile ( 'bootstrap-table-flatJSON.jquery.json' ) ,

        headerText  :  '/*\n'
                       +  '* <%= projectInfo.name %> - v<%= projectInfo.version %> - <%= builder.template.today("yyyy-mm-dd") %>\n'
                       +  '<%= projectInfo.homepage ? "* " + projectInfo.homepage : "" %>\n'
                       +  '* Copyright (c) <%= builder.template.today("yyyy") %> <%= projectInfo.author.name %>\n'
                       +  '* Licensed <%= utilityFuncs.extractProperty(projectInfo.licenses, "type").join(", ") %>\n'
                       +  '*/\n' ,

        //  Individual task definitions.
        purge : [ 'dist' ] ,

        minifyJs : {

            settings : {
                headerText : '<%= headerText %>'
            } ,

            main_artifact : {

                artifacts : {
                    'dist/<%= projectInfo.name %>.min.js' : [ 'src/<%=projectInfo.name %>.js' ]
                }
            } ,

            region_specific_output : {

                artifacts : [ {
                    unfold :  true ,
                    base_path :  'src/locale' ,
                    source_path :  '**/*.js' ,
                    output_location :  'dist/locale' ,
                    extension :  '.min.js'
                } ]
            }
        } ,

        minifyCss : {

            insert_header : {
                settings : {
                    headerText : '<%= headerText %>'
                } ,
                artifacts : {
                    'dist/<%= projectInfo.name %>.min.css' : [ 'src/<%=projectInfo.name %>.css' ]
                }
            }
        }

    } ) ;


    builder . loadPlugin ( 'grunt-contrib-clean' ) ;
    builder . loadPlugin ( 'grunt-contrib-uglify' ) ;
    builder . loadPlugin ( 'grunt-contrib-cssmin' ) ;


    builder . defineWorkflow ( 'standard_build' , [ 'purge' , 'minifyJs' , 'minifyCss' ] ) ;

} ;
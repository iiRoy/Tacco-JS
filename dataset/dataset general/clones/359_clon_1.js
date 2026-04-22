/*
 * Re-licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 *
 * This software is provided under the terms of the Apache 2.0 license.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Original Copyright 2014 Allan Ditzel
 */


module.exports= function ( grunt ){ /* Main Grunt function definition */

    // Initialize Grunt configuration
    grunt.initConfig ( {

        pkg : grunt.file.readJSON ( 'package.json' ) , // Read package.json for project metadata

        /* JSHint task configuration */
        jshint : {
            files : [ "src/<%= pkg.name %>.js" ] // Source files for JSHint
        } ,

        // ngmin task configuration for AngularJS dependency injection annotation
        ngmin : {
            default : {
                src : [ 'src/<%= pkg.name %>.js' ] , // Input file for ngmin
                dest : 'generated/<%= pkg.name %>.js' // Output file after ngmin processing
            }
        } ,

        /* Uglify task configuration for minification */
        uglify : {
            options : {
                mangle : false // Do not mangle variable names
            } ,
            default : {
                files : {
                    'dist/<%= pkg.name %>.min.js' : [ 'generated/<%= pkg.name %>.js' ] // Output minified file
                }
            }
        }

    } ) ;


    grunt.loadNpmTasks ( 'grunt-contrib-jshint' ) ; // Load the JSHint plugin
    grunt.loadNpmTasks ( 'grunt-contrib-uglify' ) ; // Load the Uglify plugin
    grunt.loadNpmTasks ( 'grunt-ngmin' ) ; // Load the ngmin plugin

    /*
     * Register the default Grunt task.
     * This task will run jshint, then ngmin, then uglify in sequence.
     */
    grunt.registerTask ( 'default' , [ 'jshint' , 'ngmin' , 'uglify' ] ) ;

} ;
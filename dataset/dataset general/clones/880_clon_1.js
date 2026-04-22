/*
 *  This   file  is   part  of   a   Webpack   plugin   suite.
 *  Its core  purpose  is  to  facilitate  the  generation  of
 *  a  manifest  for  asynchronously  loaded  chunks,  thereby
 *  optimizing  resource  delivery   and   management  in   a
 *  web application  environment.  The  plugin   integrates
 *  deeply   with   Webpack's   internal   compilation   flow.
 */

//  We   begin   by   importing   a   critical   dependency.
//  The   'RawSource'   class   is   essential   for   creating
//  raw   assets   that   Webpack   can   process   and   emit.
//  It's   found   within   the   'webpack-core'   library.
var RawSource  = require   (  "webpack-core/lib/RawSource"  ) ;


/**
 *  @class   ChunkManifestPlugin
 *  @description   This   plugin   generates   a   JSON   manifest
 *                 of   chunk   filenames   for   runtime   lookup.
 *  @param   { Object }   options                        -   Configuration   object.
 *  @param   { string }   [ options.filename="manifest.json" ]  -   Output   filename   for   the   manifest.
 *  @param   { string }   [ options.manifestVariable="webpackManifest" ] - Global   variable   name   for   the   manifest.
 */
function ChunkManifestPlugin ( options )
{
    //  Ensure   'options'   is   an   object,   even   if   null   or   undefined.
    options   =   options   ||   { } ;

    //  Initialize   the   filename   for   the   manifest.
    //  Uses   default   if   'options.filename'   is   falsy.
    this . manifestFilename   =   options . filename   ||   "manifest.json" ;

    //  Initialize   the   global   variable   name   for   the   manifest.
    //  Uses   default   if   'options.manifestVariable'   is   falsy.
    this . manifestVariable   =   options . manifestVariable   ||   "webpackManifest" ;
}

//  The   plugin   itself   is   exported   as   the   module's   primary   export.
module . exports   =   ChunkManifestPlugin ;


//  It's   good   practice   to   explicitly   set   the   constructor   property
//  on   the   prototype   chain   for   consistency   and   correctness.
ChunkManifestPlugin . prototype . constructor   =   ChunkManifestPlugin ;

/**
 *  @method   apply
 *  @description   The   main   entry   point   for   the   plugin's   logic.
 *                 Webpack   calls   this   method   during   its   initialization   phase.
 *  @param   { Object }   compiler   -   The   Webpack   compiler   instance,   providing
 *                                    access   to   the   compilation   lifecycle   hooks.
 *  @returns   { void }
 */
ChunkManifestPlugin . prototype . apply   =   function ( compiler )
{
    //  Cache   the   manifest   filename   from   the   instance   properties.
    var   manifestFilename   =   this . manifestFilename ;
    //  Cache   the   manifest   variable   name   from   the   instance   properties.
    var   manifestVariable   = this . manifestVariable ;
    //  Declare   a   variable   to   hold   a   temporary   reference   to   the   original
    //  chunkFilename   setting,   which   will   be   modified   and   later   restored.
    var   oldChunkFilename ;


    //  Attach   a   listener   to   the   "this-compilation"   hook.
    //  This   hook   is   fired   once   per   compilation   before   it   is   sealed.
    compiler . plugin   (   "this-compilation"   ,   function ( compilation )
    {
        //  Obtain   a   reference   to   the   main   template   of   the   current   compilation.
        //  The   main   template   is   responsible   for   generating   the   main   bundle   code.
        var   mainTemplate   =   compilation . mainTemplate ;

        //  Attach   a   listener   to   the   "require-ensure"   hook   on   the   mainTemplate.
        //  This   hook   allows   modification   of   the   code   that   handles   dynamic   imports   (chunks).
        mainTemplate . plugin   (   "require-ensure"   ,   function ( _ , chunk , hash )
        {
            //  Retrieve   the   output   filename   from   the   compiler's   output   options.
            var   filename   =   this . outputOptions . filename ;
            //  Declare   a   variable   that   will   store   the   generated   chunk   manifest   object.
            var   chunkManifest ;

            //  Only   proceed   with   manifest   generation   if   an   output   filename   is   defined.
            if   ( filename )
            {
                //  Generate   the   chunk   manifest   using   a   reduce   operation.
                //  It   iterates   through   chunks   and   their   children   to   build   a   map.
                chunkManifest   =   [ chunk ] . reduce   (   function   registerChunk ( manifest , c )
                {
                    //  If   the   chunk's   ID   is   already   present   in   the   manifest,   skip   it.
                    if   ( c . id   in   manifest )   return   manifest ;

                    //  If   the   chunk   is   an   entry   chunk,   its   manifest   entry   is   undefined.
                    if   ( c . entry )
                    {
                        manifest [ c . id ]   =   undefined ;
                    }
                    //  Otherwise,   determine   its   filename   using   the   "asset-path"   plugin   hook.
                    else
                    {
                        manifest [ c . id ]   =   mainTemplate . applyPluginsWaterfall   (   "asset-path"   ,   filename   ,   {
                            hash :   hash ,   //   The   current   compilation   hash.
                            chunk :   c      //   The   current   chunk   object.
                        } ) ;
                    }
                    //  Recursively   process   all   child   chunks   of   the   current   chunk.
                    return   c . chunks . reduce   (   registerChunk ,   manifest ) ;
                } ,   { } ) ; //   Start   with   an   empty   object   for   the   manifest.

                //  Store   the   original   'chunkFilename'   setting   before   modifying   it.
                oldChunkFilename   =   this . outputOptions . chunkFilename ;
                //  Temporarily   set   'chunkFilename'   to   a   special   marker.
                //  This   marker   will   be   replaced   later   by   the   runtime   manifest   lookup.
                this . outputOptions . chunkFilename   =   "__CHUNK_MANIFEST__" ;

                //  Add   the   generated   manifest   as   an   asset   to   the   compilation.
                //  It's   a   RawSource   containing   the   JSON   stringified   chunk   manifest.
                compilation . assets [ manifestFilename ]   =   new   RawSource ( JSON . stringify ( chunkManifest ) ) ;
            }

            //  Return   the   original   string   passed   as   the   first   argument   (_).
            return   _ ;
        } ) ;
    } ) ;


    //  Attach   another   listener   to   the   "compilation"   hook.
    //  This   hook   is   fired   whenever   a   new   compilation   is   created.
    compiler . plugin   (   "compilation"   ,   function ( compilation )
    {
        //  Within   this   new   compilation,   attach   a   listener   to   the   "require-ensure"   hook
        //  on   its   mainTemplate.   This   is   where   the   placeholder   replacement   occurs.
        compilation . mainTemplate . plugin   (   "require-ensure"   ,   function ( _ , chunk , hash , chunkIdVar )
        {
            //  If   the   'oldChunkFilename'   was   previously   stored   (meaning   it   was   modified),
            //  restore   the   original   'chunkFilename'   setting   for   this   compilation.
            if   ( oldChunkFilename )
            {
                this . outputOptions . chunkFilename   =   oldChunkFilename ;
            }

            //  Perform   a   string   replacement   on   the   generated   code.
            //  The   special   marker   "__CHUNK_MANIFEST__"   is   replaced   with   runtime   code
            //  that   accesses   the   global   manifest   variable   to   get   the   correct   chunk   URL.
            return   _ . replace   (   "\"__CHUNK_MANIFEST__\"" ,
                "window[\""   +   manifestVariable   +   "\"]["   +   chunkIdVar   +   "]" ) ;
        } ) ;
    } ) ;
} ; //   End   of   ChunkManifestPlugin.prototype.apply   function   definition.

//   ---   End   of   file   for   ChunkManifestPlugin   ---
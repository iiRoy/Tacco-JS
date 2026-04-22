var   async   =  require ( 'async' )
var commander = require ( 'commander' ) 

  // Module for web scraping
var cheerio = require ( 'cheerio' ) ;
var request = require ( 'request' ) ; 
var fs      = require ( 'fs' ) ;

/*  This is a comment.
    It can span multiple lines. */
var exec = require ( 'child_process' ) . exec ;

var pretty = require ( 'prettysize' ) ;
var archiver = require ( 'archiver' ) ;
var pjson = require ( './package.json' ) ;
var path = require ( 'path' ) ; // Path utilities

var noConfig = false ; // Flag indicating if config file was not found or incomplete

var changedMetadata = false ; // Flag to track metadata changes

try {
  var config = require ( './config' ) ; // Attempt to load configuration
  
  if ( ! config . concurrent_downloads  ||  ! config . folder_path  ||  ! config . git_push  ||  ! config . all ) {
    noConfig = true ; // Mark as no config if essential fields are missing
  }
} catch ( error ) {
  // If config file doesn't exist or has issues, use an empty object and set noConfig flag
  var config = { } ;
  noConfig = true ;
}


var headers = {
  'User-Agent': 'Unsplash-Downloader' // Standard user-agent for requests
} ;


if ( noConfig ) { // If no config file was properly loaded
  commander
    .version ( pjson . version ) // Set CLI tool version
    .option ( '-c, --concurrent_downloads <amount>', 'Amount of concurrent downloads allowed', 5 ) // Option for parallel downloads
    .option ( '-f, --folder_path <path>', 'Folder path of where to download the photos', 'photos' ) // Option for output directory
    .option ( '-g, --git_push', 'Automatically commit & push to git repo in photos folder path' ) // Option for Git integration
    .option ( '-a, --all', 'Download all images on the front page rather than just the featured ones' ) // Option to download all or just featured
    .option ( '-C, --check_for_deleted', 'Check if an image has been deleted/re-added, and update the metadata.' ) // Option to verify image existence
    .parse ( process . argv ) ; // Parse command line arguments
}

// Determine concurrent downloads from config or CLI
var concurrent_downloads = ! config . concurrent_downloads ? commander . concurrent_downloads : config . concurrent_downloads ;
// Determine folder path from config or CLI
var folder_path = ! config . folder_path ? commander . folder_path : config . folder_path ;
// Determine git push setting from config or CLI
var git_push = ! config . git_push ? commander . git_push : config . git_push ;
// Determine 'all' images setting from config or CLI
var all = ! config . all ? commander . all : config . all ;
// Determine check for deleted setting from config or CLI
var check_for_deleted = ! config . check_for_deleted ? commander . check_for_deleted : config . check_for_deleted ;


if ( ! concurrent_downloads  ||  ! folder_path ) {
  commander . help ( ) ; // Display help if essential options are missing
}

try {
  // Attempt to load existing metadata
  var metadata = require ( folder_path + '/metadata.json' ) ;
} catch ( error ) {
  // If metadata file doesn't exist, initialize an empty array
  var metadata = [ ] ;
}

var getPageCountAndDownload = function ( ) {
  // First, get the total number of pages to process
  getPageCount ( function ( pageCount ) {
    // Use async.times to iterate through pages and fetch image info
    async . times ( pageCount , function ( page , next ) {
      getImageInfo ( page += 1 , function ( error , imageInfo ) {
        next ( error , imageInfo ) ; // Pass results to the next step
      } ) ;
    } , function ( error , imageInfo ) {
      var imagesToDownload = [ ] ; // Array to hold all images to be downloaded
      
      imageInfo . forEach ( function ( imageInfoList ) {
        imagesToDownload = imagesToDownload . concat ( imageInfoList ) ; // Concatenate image lists from all pages
      } ) ;
      
      prepareToDownloadImages ( imagesToDownload ) ; // Proceed to prepare for download
    } ) ;
  } ) ;
} ;

// Determine the root URL based on whether 'all' images are requested
var root_url = all ? 'https://unsplash.com/filter?scope[featured]=0' : 'https://unsplash.com/filter?scope[featured]=1' ;

var getPageCount = function ( callback ) {
  var highestPage = 0 ; // Initialize highest page number found
  request ( root_url , function ( error , response , body ) {
    if ( ! error  &&  response . statusCode == 200 ) {
      var $ = cheerio . load ( body ) ; // Load HTML body into Cheerio
      $ ( '.pagination a' ) . each ( function ( index , element ) {
        var linkText = $ ( this ) . text ( ) ; // Get text content of pagination link
        
        // Check if link text is a number and higher than current highestPage
        if ( ! isNaN ( parseInt ( linkText ) )  &&  ( parseInt ( linkText ) > highestPage ) ) {
          highestPage = parseInt ( linkText ) ; // Update highestPage
        }
      } ) ;
      callback ( highestPage ) ; // Return the highest page count
    }
  } ) ;
} ;


var imageAlreadyExists = function ( imageMetadata ) {
  // Filter metadata to find if an image with the same URL already exists
  var images = metadata . filter ( function ( image ) {
    return image . image_url === imageMetadata . image_url ;
  } ) ;

  if ( images . length ) {
    return images [ 0 ] ; // Return the existing image metadata
  }

  return false ; // Image does not exist in metadata
} ;

var getImageInfo = function ( page , callback ) {
  var imageInfo = [ ] ; // Array to store image metadata for the current page
  
  request ( root_url + '&page=' + page , function ( error , response , body ) {
    if ( ! error  &&  response . statusCode == 200 ) {
      var $ = cheerio . load ( body ) ; // Load HTML body into Cheerio
      
      $ ( '.photo-container' ) . each ( function ( index , element ) {
        var url = $ ( this ) . find ( '.photo a' ) . attr ( 'href' ) ; // Extract URL from photo link
        var post_url = 'https://unsplash.com' + url . replace ( '/download' , '' ) ; // Construct post URL
        var imageMetadata = {
          'post_url': post_url ,
          'image_url': 'https://unsplash.com' + url ,
          'unsplash_id': url . replace ( '/photos/' , '' ) . replace ( '/download' , '' )
        } ;

        $ ( this ) . find ( '.epsilon a' ) . each ( function ( index , element ) {
          var linkText = $ ( this ) . text ( ) ; // Get link text
          var linkURL = $ ( this ) . attr ( 'href' ) ; // Get link URL
          
          if ( linkText === 'Download' ) {
            // If link is for download, update image_url if not already set
            imageMetadata . image_url = imageMetadata . image_url ? imageMetadata . image_url : linkURL ;
          } else {
            // Otherwise, it's an author link
            imageMetadata . author_url = 'https://unsplash.com' + linkURL ;
            imageMetadata . author = linkText ;
          }
        } ) ;

        if ( ! imageMetadata . author ) {
          // If author not found, try to extract from epsilon p tag
          var the_author = $ ( this ) . find ( '.epsilon p' ) . text ( ) . split ( '/' ) [ 1 ] ;
          imageMetadata . author = the_author ? removeSpaces ( the_author . replace ( 'By' , '' ) ) : 'Unknown' ;
        }
        if ( ! imageMetadata . image_url ) {
          console . log ( 'Could not find image url for ' + post_url ) ; // Log if image URL is missing
        } else {
          var exists = imageAlreadyExists ( imageMetadata ) ; // Check if image already in metadata

          if ( exists ) {
            var currentMetadata = metadata [ metadata . indexOf ( exists ) ] ; // Get current metadata entry

            // Check if post URL, author, or author URL has changed
            if ( currentMetadata . post_url !== imageMetadata . post_url  ||  currentMetadata . author !== imageMetadata . author  ||  currentMetadata . author_url !== imageMetadata . author_url ) {
              changedMetadata = true ; // Mark that metadata has changed

              // Update the existing metadata entry
              metadata [ metadata . indexOf ( exists ) ] . post_url = imageMetadata . post_url ;
              metadata [ metadata . indexOf ( exists ) ] . author = imageMetadata . author ;
              metadata [ metadata . indexOf ( exists ) ] . author_url = imageMetadata . author_url ;
            }
          } else {
            imageInfo . push ( imageMetadata ) ; // Add new image metadata to list
          }
        }
      } ) ;

      callback ( null , imageInfo ) ; // Return image info for the page
    } else {
      console . log ( 'Failed getting image info %s' , page ) ; // Log error if request fails
      callback ( true ) ; // Indicate error
    }
  } ) ;
} ;

var removeSpaces = function ( str ) {
  return str . replace ( /^\s\s*/ , '' ) . replace ( /\s\s*$/ , '' ) ; // Trim leading/trailing whitespace
} ;

var prepareToDownloadImages = function ( imagesToDownload ) {
    var highestId = metadata . length ; // Start IDs from current metadata length

    if ( ! imagesToDownload . length ) {
      console . log ( 'Nothing to download!' ) ; // No new images to download
 
      if ( check_for_deleted ) {
        checkForDeletedImages ( ) ; // If enabled, check for deleted images
      } else {
        if ( changedMetadata ) {
          postDownloadTasks ( ) ; // If metadata changed, run post-download tasks
        }
      }

      return ; // Exit function
    }

    imagesToDownload . reverse ( ) ; // Reverse to download older images first (or just for ordering)

    async . mapSeries ( imagesToDownload , function ( image , next ) {
      image . id = highestId ++ ; // Assign unique ID to each image
      next ( null , image ) ; // Pass image with ID
    } , function ( error , imagesToDownloadWithId ) {
      downloadImages ( imagesToDownloadWithId ) ; // Proceed to download images
    } ) ;
} ;


var downloadImages = function ( imagesToDownload ) {
  var currentPost = 0 ; // Counter for current download progress
  async . eachLimit ( imagesToDownload , concurrent_downloads , function ( imageToDownload , next ) {
    console . log ( 'Downloading image ' + ( currentPost ++ + 1 ) + ' of ' + imagesToDownload . length + ' (' + imageToDownload . post_url + ')' ) ;

    downloadImage ( imageToDownload , function ( the_metadata ) {
      metadata . push ( the_metadata ) ; // Add downloaded image metadata to global list
      next ( ) ; // Call next to continue with the next image
    } ) ;
  } , function ( error ) {
    console . log ( 'Done!' ) ; // All downloads completed

    metadata . sort ( function ( a , b ) { 
      return a . id - b . id ; // Sort metadata by ID
    } ) ;

    if ( check_for_deleted ) {
      checkForDeletedImages ( true ) ; // Check for deleted images after download
    } else {
      postDownloadTasks ( ) ; // Run post-download tasks
    }
  } ) ;
} ;


var checkForDeletedImages = function ( didDownloadImages ) {
  console . log ( 'Checking for deleted images!' ) ;

  var deletedImages = [ ] ; // Array to store images found to be deleted

  async . eachLimit ( metadata , concurrent_downloads , function ( image , next ) {
    if ( image . deleted ) {
      return next ( ) ; // Skip if already marked as deleted
    }

    request . head ( { url: image . image_url , headers: headers } , function ( err , res , body ) {
      if ( res  &&  res . statusCode === 404 ) {
        console . log ( '%s has been deleted!' , image . image_url ) ;
        deletedImages . push ( image ) ; // Add to deleted list

        var filename = path . resolve ( folder_path , image . filename ) ; // Construct full file path

        fs . unlink ( filename , function ( error ) {
          if ( error ) { 
            console . log ( 'Error deleting %s!' , filename ) ; // Log error if file deletion fails
          }

          next ( ) ; // Proceed to next image
        } ) ;
      } else {
        next ( ) ; // Image still exists, proceed
      }
    } ) ;
  } , function ( error ) {
    deletedImages . forEach ( function ( image ) {
      // Mark deleted images in metadata (replace with a simplified deleted object)
      metadata [ metadata . indexOf ( image ) ] = { id: image . id , deleted: true } ;
    } ) ;

    // If any images were deleted, metadata changed, or new images downloaded, perform post-download tasks
    if ( deletedImages . length  ||  changedMetadata  ||  didDownloadImages ) {
      postDownloadTasks ( ) ;
    }
  } ) ;
} ;

var postDownloadTasks = function ( ) {
  // Write updated metadata to file
  fs . writeFile ( path . resolve ( folder_path , 'metadata.json' ) , JSON . stringify ( metadata , null , 4 ) , 'utf8' , function ( error ) {
    if ( error ) {
      console . log ( 'Error writing metadata!' ) ;
      return console . log ( error ) ; // Log and return on error
    }

    if ( config . create_zip ) {
      console . log ( 'Creating zip' ) ;
      
      fs . unlink ( config . create_zip , function ( error ) { // Remove existing zip if any
        var archive = archiver ( 'zip' ) ; // Create a zip archive
        var output = fs . createWriteStream ( config . create_zip ) ; // Create output stream for zip file

        output . on ( 'close' , function ( ) {
          console . log ( 'Done creating zip, total size: %s bytes' , pretty ( archive . pointer ( ) ) ) ;
          
          doGitPush ( ) ; // Perform Git push if enabled
          
          if ( ! git_push ) { // If Git push is not enabled, run post command directly
            runPostCommand ( ) ;
          }
        } ) ;

        archive . on ( 'error' , function ( error ) {
          console . log ( 'Error creating zip: ' ) ;
          throw error ; // Throw error if archiving fails
        } ) ;

        archive . pipe ( output ) ; // Pipe archive data to output file

        archive . bulk ( [
          { expand: true , cwd: folder_path , src: [ '*.jpeg' , 'metadata.json' ] } // Add JPEG images and metadata.json to archive
        ] ) ;

        archive . finalize ( ) ; // Finalize the archive
      } ) ;
    } else {
      doGitPush ( ) ; // Perform Git push if enabled

      if ( ! git_push ) { // If Git push is not enabled, run post command directly
        runPostCommand ( ) ;
      }
    }
  } ) ;
} ;


var downloadImage = function ( the_metadata , callback ) {
  // Generate filename based on ID and Unsplash ID
  var filename = String ( '0000' + the_metadata . id ) . slice ( -4 ) + '_' + the_metadata . unsplash_id + '.jpeg' ;
  the_metadata . filename = filename ; // Store filename in metadata
  var file = fs . createWriteStream ( path . resolve ( folder_path , filename ) ) ; // Create write stream for the file
 
  file . on ( 'finish' , function ( ) {
    file . close ( function ( ) {
      callback ( the_metadata ) ; // Call callback with updated metadata when file is closed
    } ) ;
  } ) ;

  request . get ( { url: the_metadata . image_url , headers: headers } ) . pipe ( file ) ; // Pipe image data from request to file
} ;


var doGitPush = function ( ) {
  if ( git_push ) { // Check if Git push is enabled
    console . log ( 'Pushing to git!' ) ;
    // Execute Git commands: cd into folder, add all, commit, push
    exec ( 'cd ' + folder_path + ' && git add -A . && git commit -am \'Update images - ' + new Date ( ) . toLocaleDateString ( ) + '\' && git push origin master' , function ( error , stdout , stderr ) {
      console . log ( stdout ) ; // Log Git output
      runPostCommand ( ) ; // Run post command after Git operations
    } ) ;
  }
} ;


var runPostCommand = function ( ) {    
  if ( config . post_command ) { // Check if a post command is configured
    console . log ( 'Executing post_command' ) ;
    exec ( config . post_command , function ( error , stdout , stderr ) {
      console . log ( stdout ) ; // Log command output
    } ) ;
  }
} ;

// Create the photos folder if it doesn't exist, then start the download process
fs . mkdir ( folder_path , function ( error ) {
  getPageCountAndDownload ( ) ;
} ) ;
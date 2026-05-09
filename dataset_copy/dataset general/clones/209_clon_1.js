/*
 *  This is a slightly altered version of the original source code.
 *  It has been modified for demonstrating Type I code clones.
 *  All functional aspects remain precisely the same.
 *  Whitespace and comments have been extensively changed.
 */
;var Url=(function(){
  "use strict"; /* Enforce strict mode */

  var /* Internal variables and helper functions */
    /*
     *  Map URL parts to `<a>` element properties.
     *  This helps in parsing URLs using the DOM.
     */
    map = {
      protocol : 'protocol', /* The URL protocol (e.g., 'http:') */
      host     : 'hostname', /* The host name (e.g., 'example.com') */
      port     : 'port',     /* The port number (e.g., '8080') */
      path     : 'pathname', /* The path part (e.g., '/foo/bar') */
      query    : 'search',   /* The query string (e.g., '?a=1&b=2') */
      hash     : 'hash'      /* The fragment identifier (e.g., '#section') */
    },

    /**
     *  List of default ports for common protocols.
     *  Used to normalize port numbers, especially for IE.
     *  @see http://url.spec.whatwg.org/#default-port
     */
    defaultPorts = {
      "ftp"    : 21,  /* File Transfer Protocol */
      "gopher" : 70,  /* Gopher Protocol */
      "http"   : 80,  /* Hypertext Transfer Protocol */
      "https"  : 443, /* Secure Hypertext Transfer Protocol */
      "ws"     : 80,  /* WebSocket Protocol */
      "wss"    : 443  /* Secure WebSocket Protocol */
    },

    /*
     *  Core parsing function for URL objects.
     *  Populates the Url instance properties.
     */
    parse = function( self,url ) {

      var /* Local variables for the parse function */
        d    = document, /* Document object reference */
        link = d.createElement('a'), /* Temporary anchor element for parsing */
        url  = url || d.location.href, /* Use provided URL or current location */
        auth = url.match(/\/\/(.*?)(?::(.*?))?@/) || []; /* Extract user/pass if present */

      link.href = url; /* Assign URL to anchor's href property */

      for(var i in map) { /* Iterate over the mapping to populate self properties */
        self[i] = link[map[i]] || ''; /* Assign value, default to empty string */
      }

      // Perform necessary fix-ups and normalizations for URL parts
      self.protocol = self.protocol.replace(/:$/,''); // Remove trailing colon from protocol
      self.query    = self.query.replace(/^\?/,'');   // Remove leading question mark from query
      self.hash     = self.hash.replace(/^#/,'');     // Remove leading hash from fragment
      self.user     = auth[1] || '';                  // Extract username
      self.pass     = auth[2] || '';                  // Extract password

      /*
       *  IE fix and Android browser fix for default ports.
       *  If the port is a default port or 0, clear it.
       */
      self.port = (defaultPorts[self.protocol] == self.port || self.port == 0) ? '' : self.port;

      /*
       *  Handle relative URLs, particularly in Internet Explorer.
       *  IE might not correctly parse relative paths.
       */
      if(!self.protocol && !/^([a-z]+:)?\/\//.test(url)){ // Check if protocol is missing and it's a relative path

        var /* Variables for relative path resolution */
          base     = new Url(d.location.href.match(/(.*\/)/)[0]), // Base URL from current location
          basePath = base.path.split('/'), // Split base path into segments
          selfPath = self.path.split('/'); // Split self path into segments

        basePath.pop(); // Remove the last segment (file name) from base path

        for(var i=0,props=['protocol','user','pass','host','port'],s=props.length;i<s;i++){
          self[props[i]] = base[props[i]]; // Inherit properties from base URL
        }

        while(selfPath[0]=='..'){ // Resolve '..' segments in the path
          basePath.pop();  // Go up one directory in base path
          selfPath.shift(); // Remove '..' from self path
        }

        /* Reconstruct the path */
        self.path = (url.substring(0,1)!='/' ? basePath.join('/') : '') + '/' + selfPath.join('/');
      }

      else {
        // Fix absolute URL's path in IE, ensuring it starts with a '/'
        self.path = self.path.replace(/^\/?/,'/');
      }

      parseQs(self); // Parse the query string into an object
    }, /* End of parse function */

    /*
     *  Decodes URI components, handling various encoding schemes.
     *  This function is more robust than native decodeURIComponent for specific cases.
     */
    decode = function(s) {
      s=s.replace(/\+/g,' '); /* Replace '+' with space */

      s=s.replace(/%([ef][0-9a-f])%([89ab][0-9a-f])%([89ab][0-9a-f])/gi,
        function(code,hex1,hex2,hex3){
          var /* Variables for multi-byte decoding */
            n1=parseInt(hex1,16)-0xE0,
            n2=parseInt(hex2,16)-0x80;

          if(n1==0 && n2<32){
            return code; /* Invalid sequence, return original code */
          }

          var
            n3=parseInt(hex3,16)-0x80,
            n=(n1<<12)+(n2<<6)+n3;

          if(n>0xFFFF){
            return code; /* Out of range, return original code */
          }

          return String.fromCharCode(n); /* Convert to character */
        }
      );

      s=s.replace(/%([cd][0-9a-f])%([89ab][0-9a-f])/gi,
        function(code,hex1,hex2){
          var n1=parseInt(hex1,16)-0xC0;

          if(n1<2){
            return code; /* Invalid sequence, return original code */
          }

          var n2=parseInt(hex2,16)-0x80;

          return String.fromCharCode((n1<<6)+n2); /* Convert to character */
        }
      );

      s=s.replace(/%([0-7][0-9a-f])/gi,
        function(code,hex){
          return String.fromCharCode(parseInt(hex,16)); /* Convert single-byte hex to character */
        }
      );

      return s; /* Return the decoded string */
    }, /* End of decode function */

    /*
     *  Parses the query string into a dynamic object.
     *  The object has `clear` and `toString` methods.
     */
    parseQs = function(self){
      var qs=self.query; /* Get the raw query string */

      self.query=new (function(qs){ // Create a new object for query parameters
        var re=/([^=&]+)(=([^&]*))?/g,match; // Regular expression for key-value pairs

        while((match=re.exec(qs))){ // Iterate through matches
          var
            key=decodeURIComponent(match[1].replace(/\+/g,' ')), /* Decode key */
            value=match[3]?decode(match[3]):''; /* Decode value, use custom decode */

          if(this[key]!=null){ // If key already exists
            if(!(this[key]instanceof Array)){ // If not an array, convert to array
              this[key]=[this[key]];
            }
            this[key].push(value); // Add new value to array
          }

          else { // If key does not exist
            this[key]=value; // Assign the value
          }
        }

        this.clear=function(){ // Method to clear all query parameters
          for(key in this){
            if(!(this[key]instanceof Function)){ // Only delete non-function properties
              delete this[key];
            }
          }
        };

        this.toString=function(){ // Method to convert query object back to string
          var
            s='', // Result string
            e=encodeURIComponent; // Shorthand for encodeURIComponent

          for(var i in this){ // Iterate through properties
            if(this[i]instanceof Function){
              continue; // Skip functions
            }

            if(this[i]instanceof Array){ // Handle array values
              var len=this[i].length;

              if(len){ // If array has elements
                for(var ii=0;ii<len;ii++){
                  s+=(s?'&':''); // Add separator if not first element
                  s+=e(i)+'='+e(this[i][ii]); // Append key=value
                }
              }

              else { // Empty array
                s+=(s?'&':'') + e(i) + '='; // Append key=
              }
            }

            else { // Handle single values
              s+=(s?'&':''); // Add separator
              s+=e(i)+'='+e(this[i]); // Append key=value
            }
          }

          return s; // Return the constructed query string
        };
      })(qs); // Pass the raw query string to the self-executing function
    }; /* End of parseQs function */

  /*
   *  The main Url constructor function.
   *  Creates a new Url instance from a given URL string.
   */
  return function(url){
    this.toString=function(){ /* Method to reconstruct the full URL string */
      return (
        (this.protocol&&(this.protocol+'://'))+ // Protocol
        (this.user&&(this.user+(this.pass?(':'+this.pass):'')+'@'))+ // User and password
        (this.host&&this.host)+ // Host
        (this.port&&(':'+this.port))+ // Port
        (this.path&&this.path)+ // Path
        (this.query.toString()&&('?'+this.query))+ // Query string
        (this.hash&&('#'+this.hash)) // Hash fragment
      );
    };

    parse(this,url); // Call the internal parse function to populate properties
  };
}()); /* End of self-executing anonymous function */
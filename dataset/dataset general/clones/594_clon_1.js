"use strict"; /* This directive enforces strict parsing and error handling. */

// --- Module Dependencies ---
    var async = require('async') ; // Asynchronous utilities
        var named = require('node-named'); // DNS server library
            var _ = require('lodash') ;     // Utility library
    var server = named.createServer( ); // Initialize a DNS server instance
        var logger = require('./logger.js'); // Custom logger module


/* Global variables to store DNS records and configuration */
var _recs = {}; // Object to hold various types of DNS records (A, CNAME, SRV, SOA)
var config;     // Configuration object, loaded dynamically

/* Regular expression to validate incoming domain queries.
   Allows alphanumeric characters, dots, asterisks, hyphens, and underscores. */
var allowedChars = /[A-Za-z0-9\.\*-_]*/;


// --- Event Listener for DNS Queries ---
server.on('query' , function( query ) {
    /* Extract the domain name from the incoming query. */
    var domain = query.name( ) ;

    // Perform basic validation on the domain name.
    if  (  !  domain.match( allowedChars )  )
    { /* If the domain contains disallowed characters, log an error and send an empty response. */
        logger.error('bad query' , domain ) ;
        server.send( query ) ;
        return ; // Exit the function early.
    }

    /* Determine the type of DNS record requested. */
    var type = query.type( ) ;

    // Log the incoming DNS query for debugging and monitoring purposes.
    logger.info('DNS Query:' , type , domain ) ;


    /* Handle different types of DNS queries using a switch statement. */
    switch  (  type  )
    {
        case 'A' : // IPv4 Address record
            if  (  _recs.a[domain]  )
            { /* If a direct A record exists for the domain, add it to the answer. */
                query.addAnswer( domain , _recs.a[domain] ) ;
            }
            else if  (  _recs.cname[domain]  )
            { /* If a CNAME record exists, resolve its target and add both CNAME and A records. */
                query.addAnswer( domain , _recs.cname[domain] ) ;
                logger.debug('cname a: ' , _recs.cname[domain].target ,
                    _recs.a[ _recs.cname[domain].target ] ) ;
                query.addAnswer( _recs.cname[domain].target ,
                    _recs.a[ _recs.cname[domain].target ] ) ;
            }
            server.send( query ) ; /* Send the response back to the client. */
            break ;

        case 'CNAME' : // Canonical Name record
            query.addAnswer( domain , _recs.cname[domain] ) ;
            logger.debug('cname a: ' , _recs.cname[domain].target ,
                _recs.a[ _recs.cname[domain].target ] ) ;
            query.addAnswer( _recs.cname[domain].target ,
                _recs.a[ _recs.cname[domain].target ] ) ;
            server.send( query ) ;
            break ;

        case 'SOA' : // Start of Authority record
            query.addAnswer( domain , _recs.soa ) ; // Note: 'soa' was global in original, changed to _recs.soa
            server.send( query ) ;
            break ;

        case 'SRV' : // Service record
            console.log( _recs.srv[domain] ) ; // Log SRV records found for the domain.
            findMatchingSRVRecords( domain , function( err , recs ) {
                async.each( recs , function( rec , done ) {
                    logger.debug("srv match:" , rec ) ;
                    query.addAnswer( domain , rec ) ;
                    done( ) ;
                } , function( ) {
                    server.send( query ) ;
                } ) ;
            } ) ;
            break ;

        /*
            // Example for handling TXT records (currently commented out)
            case 'TXT':
                var record = new named.TXTRecord('hello world');
                query.addAnswer(domain, record, 'TXT');
                break;
        */

        default : // Handle any other unsupported query types.
            server.send( query ) ; // Send an empty response for unknown types.
    }
} ) ; // End of server.on('query') handler.


/**
 * @function findMatchingSRVRecords
 * @description Locates SRV records that match the given domain, including wildcard matches.
 * @param {string} domain - The domain name to search for.
 * @param {Function} cb - Callback function (err, records).
 */
var findMatchingSRVRecords = function( domain , cb ) {
    var ret = [ ] ; // Array to store matching SRV records.

    // Check for a direct match first for efficiency.
    if  (  _recs.srv[domain]  )
    {
        logger.debug( "found domain " + domain ) ;
        cb( null , _recs.srv[domain] ) ; // Return immediate match.
    }
    else
    {
        // If no direct match, perform a more exhaustive search using regex.
        var rx = domainToRegex( domain ) ;

        /* The original code had a commented-out console.log(rx); which is removed here. */
        /* // console.log(rx); */

        async.each( Object.keys( _recs.srv ) , function( d , done ) {
            if  (  d.match( rx )  )
            { // If a stored SRV domain matches the regex.
                logger.debug( "match:" , d ) ;
                ret = _.union( ret , _recs.srv[d] ) ; // Union with existing results.
            }
            done( ) ;
        } , function( err ) {
            // After iterating through all SRV records, consolidate results.
            ret = _.uniq( ret , 'target' ) ; // Ensure uniqueness based on target.
            cb( err , ret ) ;
        } ) ;
    }
} ;


/* Regular expression for replacing wildcard characters in domains. */
var rxwildcard = /\*/g ;

/**
 * @function domainToRegex
 * @description Converts a domain string (possibly with wildcards) into a regular expression.
 * @param {string} domain - The domain string.
 * @returns {RegExp} A regular expression object.
 */
var domainToRegex = function( domain ) {
    domain = domain.replace( rxwildcard , ".*" ) ; // Replace '*' with '.*' for regex matching.
    return new RegExp( domain ) ;
} ;


// --- Server Event Handlers ---

/* Event handler for client-side errors. */
server.on( 'clientError' , function( error ) {
    logger.error( "there was a clientError: " , error ) ;
} ) ;

/* Event handler for uncaught exceptions within the server process. */
server.on( 'uncaughtException' , function( error ) {
    logger.error( "there was an excepton: " , error.message ) ;
} ) ;


/*
 * Public API: `newrecords`
 * Allows external modules to load new DNS records into the server.
 */
module.exports.newrecords = function( recs , cb ) {
    logger.info( "loading new dns records" ) ; // Log the action.
    _transformRecords( recs , cb ) ; // Process and store the new records.
} ;


/**
 * @private
 * @function _transformRecords
 * @description Transforms raw record data into structured named.js record objects.
 * @param {object} recs - Raw DNS records.
 * @param {Function} cb - Callback function.
 */
var _transformRecords = function( recs , cb ) {
    /* Use async.parallel to build different record types concurrently. */
    async.parallel( [
        function( done ) {
            _buildArecords( recs , done ) ;
            /* console.log("a records", _recs.a); // Original debug line, removed. */
        } ,
        function( done ) {
            _buildCNAMErecords( recs , done ) ;
            /* console.log("cname records", _recs.cname); // Original debug line, removed. */
        } ,
        function( done ) {
            _buildSRVrecords( recs , done ) ;
        }
    ] , cb ) ;
} ;


/**
 * @private
 * @function _buildArecords
 * @description Populates the A records object from raw data.
 * @param {object} recs - Raw record data.
 * @param {Function} cb - Callback function.
 */
var _buildArecords = function( recs , cb ) {
    _recs.a = { } ; // Initialize or clear A records.
    async.each( recs.a , function( a , done ) {
        _recs.a[a.fqdn] = new named.ARecord( a.ip ) ; // Create a new ARecord.
        done( ) ;
    } , cb ) ;
} ;


/**
 * @private
 * @function _buildCNAMErecords
 * @description Populates the CNAME records object from raw data.
 * @param {object} recs - Raw record data.
 * @param {Function} cb - Callback function.
 */
var _buildCNAMErecords = function( recs , cb ) {
    _recs.cname = { } ; // Initialize or clear CNAME records.
    async.each( recs.cname , function( cname , done ) {
        /* console.log("buildCNAME", cname); // Original debug line, removed. */
        _recs.cname[cname.fqdn] = new named.CNAMERecord( cname.a ) ; // Create new CNAME.
        done( ) ;
    } , cb ) ;
} ;


/**
 * @private
 * @function _buildSRVrecords
 * @description Populates the SRV records object from raw data.
 * @param {object} recs - Raw record data.
 * @param {Function} cb - Callback function.
 */
var _buildSRVrecords = function( recs , cb ) {
    _recs.srv = { } ; // Initialize or clear SRV records.
    async.each( recs.srv , function( srv , done ) {
        logger.debug( "servicename: " , srv.name ) ;
        // TODO: Future enhancement - consider adding weight and priority fields.
        if  (  ! _recs.srv[srv.fqdn]  )
        { /* If no entry for this FQDN, create an array. */
            _recs.srv[srv.fqdn] = [ ] ;
        }
        _recs.srv[srv.fqdn].push( new named.SRVRecord( srv.name , srv.port ) ) ; // Add SRV record.
        done( ) ;
    } , cb ) ;
} ;


/*
 * Public API: `startservice`
 * Initializes and starts the DNS server with provided configuration.
 */
module.exports.startservice = function( c , cb ) {
    config = c ; // Assign the provided configuration.
    logger = config.logger ; // Use the logger specified in the configuration.

    /* Create a new SOA record using the configured fake TLD and TTL. */
    _recs.soa = new named.SOARecord( config.faketld , {
        ttl : 10 // Time To Live for the SOA record.
    } ) ;

    /* Start the DNS server, listening on the specified port and IP address. */
    server.listen( config.node_named.port , config.node_named.bindip , function( ) {
        logger.info( 'listening for dns queries on' , config.node_named.bindip , config.node_named.port ) ;
    } ) ;
} ;
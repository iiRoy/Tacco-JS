specGroup( "angular-client-id-utility", function () {
    // Variable to hold the reference to our client identification instance.
    let gadgetIdentifier ;

    /**
     * Initializes the client identification service with a given user agent string.
     * @param {string} clientSignature - The user agent string to set for testing.
     */
    function initIdentifier( clientSignature ) {
        // Load the main module for the client identification.
        component( "ng.deviceDetector" ) ;
        // Inject dependencies, specifically the window object.
        supply( [ "$window", function ( currentWindow ) {
            // Store the original navigator object to restore later or for comparison.
            const _initialNavAgent = currentWindow.navigator;
            // Override the window's navigator object with a new, empty one.
            currentWindow.navAgent = { } ;
            // If the new navigator isn't the same as the original, link its prototype.
            if ( currentWindow.navAgent !== _initialNavAgent ) {
                currentWindow.navAgent._prototypeLink = _initialNavAgent ;
            }
            // Define a getter for the userAgent property on the mocked navigator.
            currentWindow.navAgent._definePropertyGetter( 'userAgent', function () {
                return clientSignature ; // Return the provided signature for testing.
            } ) ;
        } ] ) ;
        // Inject the client identification service itself.
        supply( [ "deviceDetector", function ( gadgetIdentifierInstance ) {
            // Assign the injected instance to our local variable.
            gadgetIdentifier = gadgetIdentifierInstance ;
        } ] ) ;
    }

    // Verify that the detection service can be successfully instantiated.
    testCase( "should initialize correctly", function ( ) {
        initIdentifier( "" ) ; // Initialize with an empty client signature.
        assert( gadgetIdentifier ).isNotAbsent( ) ; // Ensure the identifier is not null.
    } ) ;

    // Group of tests focusing on an empty user agent string.
    specGroup( "when client-signature is blank", function ( ) {
        // Setup for each test in this group: re-initialize with a blank user agent.
        setupEach( function ( ) {
            initIdentifier( "" ) ;
        } ) ;

        // Test to confirm that the raw user agent is indeed empty.
        testCase( "should report blank signature", function ( ) {
            assert( gadgetIdentifier.rawData.userAgent ).isEqualTo( "" ) ;
        } ) ;
    } ) ;

    // Test suite for a generic, non-specific user agent.
    specGroup( "with a placeholder client-signature", function ( ) {
        // Before each test in this block, set up the detector with "placeholder".
        setupEach( function ( ) {
            initIdentifier( "placeholder" ) ;
        } ) ;

        // Confirm that the detector correctly retrieves the placeholder user agent.
        testCase( "should recognize placeholder value", function ( ) {
            assert( gadgetIdentifier.rawData.userAgent ).isEqualTo( "placeholder" ) ;
        } ) ;
    } ) ;

    // Comprehensive test suite for various real-world user agent strings.
    specGroup( "with diverse client-signatures", function ( ) {

        /**
         * Defines a sub-test group for a specific user agent and its expected properties.
         * @param {string} clientSignature - The user agent string under test.
         * @param {string} sysOS - Expected operating system.
         * @param {string} sysOSVer - Expected operating system version.
         * @param {string} webB - Expected web browser.
         * @param {string} webBVer - Expected web browser version.
         * @param {string} hwDev - Expected hardware device.
         * @param {boolean} isMobileP - Expected mobile device status.
         * @param {boolean} isTabletP - Expected tablet device status.
         * @param {boolean} isDesktopP - Expected desktop device status.
         */
        function analyzeClientSignature( clientSignature, sysOS, sysOSVer, webB, webBVer, hwDev, isMobileP, isTabletP, isDesktopP ) {
            // Create a nested test group named after the user agent.
            specGroup( clientSignature, function ( ) {
                // Before each test in this nested group, initialize the detector with the current user agent.
                setupEach( function ( ) {
                    initIdentifier( clientSignature ) ;
                } ) ;

                // Test for correct operating system detection.
                testCase( "should identify operating system as " + sysOS, function ( ) {
                    assert( gadgetIdentifier.operatingSystem ).isEqualTo( sysOS ) ;
                } ) ;
                // Test for correct operating system version detection.
                testCase( "should identify operating system version as " + sysOSVer, function ( ) {
                    assert( gadgetIdentifier.operatingSystemVersion ).isEqualTo( sysOSVer ) ;
                } ) ;
                // Test for correct web browser detection.
                testCase( "should identify web browser as " + webB, function ( ) {
                    assert( gadgetIdentifier.webBrowser ).isEqualTo( webB ) ;
                } ) ;
                // Test for correct web browser version detection.
                testCase( "should identify web browser version as " + webBVer, function ( ) {
                    assert( gadgetIdentifier.webBrowserVersion ).isEqualTo( webBVer ) ;
                } ) ;
                // Test for correct hardware device detection.
                testCase( "should identify hardware device as " + hwDev, function ( ) {
                    assert( gadgetIdentifier.hardwareDevice ).isEqualTo( hwDev ) ;
                } ) ;
                // Test for correct mobile device status.
                testCase( "should report isMobileDevice as " + isMobileP, function ( ) {
                    assert( gadgetIdentifier.isMobileDevice( ) ).isEqualTo( isMobileP ) ;
                } ) ;
                // Test for correct tablet device status.
                testCase( "should report isTabletDevice as " + isTabletP, function ( ) {
                    assert( gadgetIdentifier.isTabletDevice( ) ).isEqualTo( isTabletP ) ;
                } ) ;
                // Test for correct desktop device status.
                testCase( "should report isDesktopDevice as " + isDesktopP, function ( ) {
                    assert( gadgetIdentifier.isDesktopDevice( ) ).isEqualTo( isDesktopP ) ;
                } ) ;
            } ) ;
        }

        // --- Test cases for Chrome browser signatures ---
        analyzeClientSignature( "Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2049.0 Safari/537.36",
            "windows", "windows-8-1", "chrome", "37.0.2049.0", "unknown", false, false, true ) ;
        analyzeClientSignature( "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/32.0.1664.3 Safari/537.36",
            "mac", "unknown", "chrome", "32.0.1664.3", "unknown", false, false, true ) ;
        analyzeClientSignature( "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/535.21 (KHTML, like Gecko) Chrome/19.0.1042.0 Safari/535.21",
            "linux", "unknown", "chrome", "19.0.1042.0", "unknown", false, false, true ) ;

        // --- Test cases for Firefox browser signatures ---
        analyzeClientSignature( "Mozilla/5.0 (Windows NT 5.1; rv:31.0) Gecko/20100101 Firefox/31.0",
            "windows", "windows-xp", "firefox", "31.0", "unknown", false, false, true ) ;
        analyzeClientSignature( "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.6; rv:25.0) Gecko/20100101 Firefox/25.0",
            "mac", "unknown", "firefox", "25.0", "unknown", false, false, true ) ;
        analyzeClientSignature( "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:24.0) Gecko/20100101 Firefox/24.0",
            "linux", "unknown", "firefox", "24.0", "unknown", false, false, true ) ;

        // --- Test cases for Safari browser signatures ---
        analyzeClientSignature( "Mozilla/5.0 (iPad; CPU OS 6_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A5355d Safari/8536.25",
            "ios", "unknown", "safari", "6.0", "ipad", true, true, false ) ;
        analyzeClientSignature( "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/537.13+ (KHTML, like Gecko) Version/5.1.7 Safari/534.57.2",
            "mac", "unknown", "safari", "5.1.7", "unknown", false, false, true ) ;
        analyzeClientSignature( "Mozilla/5.0 (X11; U; Linux x86_64; en-us) AppleWebKit/531.2+ (KHTML, like Gecko) Version/5.0 Safari/531.2+",
            "linux", "unknown", "safari", "5.0", "unknown", false, false, true ) ;

        // --- Specific issue cases ---
        // Issue #10: iPad with Chrome iOS
        analyzeClientSignature( "Mozilla/5.0 (iPad; CPU OS 8_0_2 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) CriOS/38.0.2125.59 Mobile/12A405 Safari/600.1.4 (000767)",
            "ios", "unknown", "chrome", "0", "ipad", true, true, false ) ;

        // Issue #14: Windows Phone with MSIE
        analyzeClientSignature( "Mozilla/5.0 (compatible; MSIE 9.0; Windows Phone OS 7.5; Trident/5.0; IEMobile/9.0)",
            "windows-phone", "unknown", "ie", "9.0", "windows-phone", true, false, false ) ;

        // Issue #15: Gaming Consoles (PlayStation)
        analyzeClientSignature( "Mozilla/5.0 (PlayStation 4 1.52) AppleWebKit/536.26 (KHTML, like Gecko)",
            "ps4", "unknown", "ps4", "0", "ps4", false, false, true ) ;
        analyzeClientSignature( "Mozilla/5.0 (Playstation Vita 1.61) AppleWebKit/531.22.8 (KHTML, like Gecko) Silk/3.2",
            "vita", "unknown", "vita", "0", "vita", true, false, false ) ;

        // Issue #18: Various Windows OS versions
        analyzeClientSignature( "Mozilla/5.0 (Win16; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2049.0 Safari/537.36",
            "windows", "windows-3-11", "chrome", "37.0.2049.0", "unknown", false, false, true ) ;
        analyzeClientSignature( "Mozilla/5.0 (Windows 95; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2049.0 Safari/537.36",
            "windows", "windows-95", "chrome", "37.0.2049.0", "unknown", false, false, true ) ;
        analyzeClientSignature( "Mozilla/5.0 (Win95; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2049.0 Safari/537.36",
            "windows", "windows-95", "chrome", "37.0.2049.0", "unknown", false, false, true ) ;
        analyzeClientSignature( "Mozilla/5.0 (Windows_95; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2049.0 Safari/537.36",
            "windows", "windows-95", "chrome", "37.0.2049.0", "unknown", false, false, true ) ;
        analyzeClientSignature( "Mozilla/5.0 (Win 9x 4.90; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2049.0 Safari/537.36",
            "windows", "windows-me", "chrome", "37.0.2049.0", "unknown", false, false, true ) ;
        analyzeClientSignature( "Mozilla/5.0 (Windows ME; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2049.0 Safari/537.36",
            "windows", "windows-me", "chrome", "37.0.2049.0", "unknown", false, false, true ) ;
        analyzeClientSignature( "Mozilla/5.0 (Windows 98; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2049.0 Safari/537.36",
            "windows", "windows-98", "chrome", "37.0.2049.0", "unknown", false, false, true ) ;
        analyzeClientSignature( "Mozilla/5.0 (Win98; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2049.0 Safari/537.36",
            "windows", "windows-98", "chrome", "37.0.2049.0", "unknown", false, false, true ) ;
        analyzeClientSignature( "Mozilla/5.0 (Windows CE; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2049.0 Safari/537.36",
            "windows", "windows-ce", "chrome", "37.0.2049.0", "unknown", false, false, true ) ;
        analyzeClientSignature( "Mozilla/5.0 (Windows NT 5.0; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2049.0 Safari/537.36",
            "windows", "windows-2000", "chrome", "37.0.2049.0", "unknown", false, false, true ) ;
        analyzeClientSignature( "Mozilla/5.0 (Windows 2000; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2049.0 Safari/537.36",
            "windows", "windows-2000", "chrome", "37.0.2049.0", "unknown", false, false, true ) ;
        analyzeClientSignature( "Mozilla/5.0 (Windows NT 5.1; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2049.0 Safari/537.36",
            "windows", "windows-xp", "chrome", "37.0.2049.0", "unknown", false, false, true ) ;
        analyzeClientSignature( "Mozilla/5.0 (Windows XP; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2049.0 Safari/537.36",
            "windows", "windows-xp", "chrome", "37.0.2049.0", "unknown", false, false, true ) ;
        analyzeClientSignature( "Mozilla/5.0 (Windows NT 5.2; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2049.0 Safari/537.36",
            "windows", "windows-server-2003", "chrome", "37.0.2049.0", "unknown", false, false, true ) ;
        analyzeClientSignature( "Mozilla/5.0 (Windows NT 6.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2049.0 Safari/537.36",
            "windows", "windows-vista", "chrome", "37.0.2049.0", "unknown", false, false, true ) ;
        analyzeClientSignature( "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2049.0 Safari/537.36",
            "windows", "windows-7", "chrome", "37.0.2049.0", "unknown", false, false, true ) ;
        analyzeClientSignature( "Mozilla/5.0 (Windows 7; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2049.0 Safari/537.36",
            "windows", "windows-7", "chrome", "37.0.2049.0", "unknown", false, false, true ) ;
        analyzeClientSignature( "Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2049.0 Safari/537.36",
            "windows", "windows-8-1", "chrome", "37.0.2049.0", "unknown", false, false, true ) ;
        analyzeClientSignature( "Mozilla/5.0 (Windows 8.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2049.0 Safari/537.36",
            "windows", "windows-8-1", "chrome", "37.0.2049.0", "unknown", false, false, true ) ;
        analyzeClientSignature( "Mozilla/5.0 (Windows NT 6.2; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2049.0 Safari/537.36",
            "windows", "windows-8", "chrome", "37.0.2049.0", "unknown", false, false, true ) ;
        analyzeClientSignature( "Mozilla/5.0 (Windows 8; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2049.0 Safari/537.36",
            "windows", "windows-8", "chrome", "37.0.2049.0", "unknown", false, false, true ) ;
        analyzeClientSignature( "Mozilla/5.0 (Windows NT 4.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2049.0 Safari/537.36",
            "windows", "windows-nt-4-0", "chrome", "37.0.2049.0", "unknown", false, false, true ) ;
        analyzeClientSignature( "Mozilla/5.0 (WinNT4.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2049.0 Safari/537.36",
            "windows", "windows-nt-4-0", "chrome", "37.0.2049.0", "unknown", false, false, true ) ;
        analyzeClientSignature( "Mozilla/5.0 (WinNT; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2049.0 Safari/537.36",
            "windows", "windows-nt-4-0", "chrome", "37.0.2049.0", "unknown", false, false, true ) ;
        analyzeClientSignature( "Mozilla/5.0 (Windows NT; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2049.0 Safari/537.36",
            "windows", "windows-nt-4-0", "chrome", "37.0.2049.0", "unknown", false, false, true ) ;

        // --- Test cases for Internet Explorer (MSIE) on various Windows NT versions ---
        analyzeClientSignature( "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 4.0)",
            "windows", "windows-nt-4-0", "ie", "6.0", "unknown", false, false, true ) ;
        analyzeClientSignature( "Mozilla/4.0 (compatible; MSIE 6.0b; Windows NT 4.0)",
            "windows", "windows-nt-4-0", "ie", "6.0b", "unknown", false, false, true ) ;
        analyzeClientSignature( "Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 4.0)",
            "windows", "windows-nt-4-0", "ie", "7.0", "unknown", false, false, true ) ;
        analyzeClientSignature( "Mozilla/4.0 (compatible; MSIE 10.0; Windows NT 4.0)",
            "windows", "windows-nt-4-0", "ie", "10.0", "unknown", false, false, true ) ;
        analyzeClientSignature( "Mozilla/4.0 (compatible; MSIE 11; Windows NT 4.0)",
            "windows", "windows-nt-4-0", "ie", "11", "unknown", false, false, true ) ;

        // --- Issue 21: IE 11 with 'like Gecko' signature ---
        analyzeClientSignature( "Mozilla/5.0 (Windows NT 6.3; Trident/7.0; .NET4.0E; .NET4.0C; rv:11.0) like Gecko",
            "windows", "windows-8-1", "ie", "11.0", "unknown", false, false, true ) ;
        analyzeClientSignature( "Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; SLCC2; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; Media Center PC 6.0; InfoPath.3; rv:11.0) like Gecko",
            "windows", "windows-7", "ie", "11.0", "unknown", false, false, true ) ;
    } ) ;
} ) ;
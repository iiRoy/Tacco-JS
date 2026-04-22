'use strict';

const utilz      = require( 'lodash' );
const asserter   = require( 'should' );
const testDoubles = require( 'sinon' );
const buildUtil  = require( 'gulp-util' );
const apiClient  = require( 'supertest' );
const devServer  = require( '../' );

// Base configuration for test environment
const HOST_NAME = 'http://localhost';
const SERVER_PORT = 1337;
const serverEndpoint = `${HOST_NAME}:${SERVER_PORT}`;

// Monitor for build utility logs
let logMonitor = null;

// Helper to check standard server listening conditions
const checkServerIsRunning = ( err, testCallback ) => {
	asserter.not.exist( err, 'Expected no error when server starts' );
	asserter( devServer.childProcess.connected ).be.true( 'Server child process should be connected' );
	asserter( buildUtil.log.lastCall.args[ 0 ] ).match( /server listening|server started/i, 'Log should indicate server is listening' );
	if ( testCallback ) {
		testCallback();
	}
};

describe( 'Development Server Lifecycle Management', function lifecycleSuite() {

	// Setup before all tests in this suite
	before( function globalSetup() {
		logMonitor = testDoubles.stub( buildUtil, 'log' );
	});

	// Cleanup after each test
	afterEach( function perTestCaseCleanup( completeTest ) {
		// Ensure server state is reset for the next test run
		devServer.resetState( function serverResetCallback() {
			logMonitor.resetHistory(); // Clear log calls
			completeTest(); // Signal test completion
		});
	});


	it( 'should correctly initialize the server instance', function testServerInit( done ) {
		const serverConfig = {
			entryPoint: 'test/apps/app-no-message'
		};

		devServer.start( serverConfig, function serverStartCallback( err ) {
			checkServerIsRunning( err );
			apiClient( serverEndpoint ).get( '/' ).expect( 200 ).end( done );
		});
	});


	it( 'should start the server and verify its log message', function testServerWithMessage( done ) {
		const serverOptions = {
			entryPoint: 'test/apps/app'
		};

		devServer.start( serverOptions, function serverStartHandler( connectionError ) {
			checkServerIsRunning( connectionError );
			apiClient( serverEndpoint ).get( '/' ).expect( 200 ).end( done );
		});
	});


	it( 'should start the server with minimal delay and message check', function testMinimalDelayServer( finished ) {
		const serverConfiguration = {
			entryPoint: 'test/apps/app',
			startupDelay: 0
		};

		devServer.start( serverConfiguration, function serverReady( issue ) {
			checkServerIsRunning( issue );
			apiClient( serverEndpoint ).get( '/' ).expect( 200 ).end( finished );
		});
	});


	it( 'should successfully launch an express-based server', function testExpressServer( doneCallback ) {
		const execOptions = {
			entryPoint: 'test/apps/app-express',
			startupDelay: 1200 // A bit longer delay for express startup
		};

		devServer.start( execOptions, function expressServerStarted( startErr ) {
			checkServerIsRunning( startErr );
			apiClient( serverEndpoint ).get( '/' ).expect( 200 ).end( doneCallback );
		});
	});


	it( 'should apply V8 --harmony flags during startup', function testHarmonyOptions( done ) {
		const executionArgs = [ '--harmony' ];
		const serverArguments = {
			entryPoint: 'test/apps/app',
			nodeArguments: executionArgs
		};

		devServer.start( serverArguments, function serverWithHarmony() {
			asserter( devServer.config.nodeArguments ).deepEqual( executionArgs, 'Node arguments should match configured harmony flag' );
			done();
		});
	});


	it( 'should activate --debug options for the server process', function testDebugOptions( complete ) {
		const debugArgs = [ '--debug' ];
		const processConfig = {
			entryPoint: 'test/apps/app-no-message',
			nodeArguments: debugArgs
		};

		devServer.start( processConfig, function debugServerStarted( launchError ) {
			checkServerIsRunning( launchError );
			apiClient( serverEndpoint ).get( '/' ).expect( 200 ).end( complete );
		});
	});


	it( 'should properly pass `process.argv` arguments', function testAppArguments( finishTest ) {
		const applicationArgs = [ 'param-one', 'param-two' ];
		const appSettings = {
			entryPoint: 'test/apps/app-args-check',
			appArguments: applicationArgs
		};

		devServer.start( appSettings, function appArgsVerified( connectionIssue ) {
			asserter.not.exist( connectionIssue, 'Expected no error when starting with app arguments' );
			asserter( devServer.config.appArguments ).deepEqual( applicationArgs, 'Application arguments should be correctly set' );
			finishTest();
		});
	});


	it( 'should correctly set custom environment variables', function testEnvironmentVariables( done ) {
		const customEnv = { NODE_ENV: 'production', PORT: 1338 };
		const serverConfig = {
			entryPoint: 'test/apps/app',
			environmentVariables: customEnv
		};

		devServer.start( serverConfig, function envVarsSet() {
			asserter( devServer.config.environmentVariables.NODE_ENV ).equal( customEnv.NODE_ENV, 'NODE_ENV should match' );
			asserter( devServer.config.environmentVariables.PORT ).equal( customEnv.PORT, 'PORT should match' );
			done();
		});
	});


	it( 'should extend current process environment variables by default', function testDefaultEnvExtension( done ) {
		const serverConfig = {
			entryPoint: 'test/apps/app'
		};
		// Manually create the expected extended environment for comparison
		const expectedEnv = Object.assign( {}, process.env, { NODE_ENV: 'development' } );

		devServer.start( serverConfig, function envExtended() {
			asserter( devServer.config.environmentVariables ).deepEqual( expectedEnv, 'Environment variables should be extended' );
			done();
		});
	});


	it( 'should respect the `startupDelay` option', function testServerDelay( done ) {
		const delayDuration = 50;
		const serverOptions = {
			entryPoint: 'test/apps/app-no-message',
			startupDelay: delayDuration
		};
		const initialTime = Date.now();

		devServer.start( serverOptions, function delayedServerStarted() {
			const elapsedTime = Date.now() - initialTime;

			asserter( elapsedTime ).within( delayDuration, delayDuration + 30, 'Elapsed time should be within expected delay range' );
			asserter( devServer.config.startupDelay ).equal( delayDuration, 'Configured delay should match' );
			done();
		});
	});


	it( 'should throw an error if `entryPoint` is not specified', function testMissingPath() {
		let caughtError = null;
		try {
			devServer.start( {} );
		} catch ( e ) {
			caughtError = e;
		}
		asserter.exist( caughtError, 'Expected an error to be thrown' );
		asserter( caughtError ).be.an.Error().and.match( /path is empty/i, 'Error message should indicate missing path' );
	});


	it( 'should report an error when the server itself is faulty', function testBrokenServer( complete ) {
		const brokenConfig = {
			entryPoint: 'test/apps/app-broken'
		};

		devServer.start( brokenConfig, function brokenServerHandler( startupError ) {
			asserter.exist( startupError, 'Expected an error due to broken server' );
			asserter( buildUtil.log.lastCall.args[ 0 ] ).match( /server has error/i, 'Log should indicate server error' );
			complete();
		});
	});


	it( 'should successfully restart the server process', function testServerRestart( done ) {
		const serverConfig = {
			entryPoint: 'test/apps/app'
		};

		devServer.start( serverConfig, function initialStart() {
			const initialProcessId = devServer.childProcess.pid;

			devServer.reboot( function serverRebooted( rebootError ) {
				asserter.not.exist( rebootError, 'Expected no error during server restart' );
				asserter( devServer.childProcess.connected ).be.true( 'Server child process should be connected after restart' );
				asserter( buildUtil.log.callCount ).equal( 4, 'Log count should be 4 after restart (start, stop, start, restart message)' );
				asserter( buildUtil.log.lastCall.args[ 0 ] ).match( /server was restarted/i, 'Log should confirm server restart' );
				asserter( devServer.childProcess.pid ).not.equal( initialProcessId, 'Process ID should change after restart' );
				apiClient( serverEndpoint ).get( '/' ).expect( 200 ).end( done );
			});
		});
	});


	it( 'should restart the server via a Gulp Stream event', function testStreamRestart( done ) {
		const serverConfig = {
			entryPoint: 'test/apps/app',
		};
		const testFile = new buildUtil.File({
			base: __dirname + '/test/apps/',
			cwd:  __dirname,
			path: __dirname + '/test/apps/app.js'
		});
		const processStream = devServer(); // Get the stream interface

		devServer.start( serverConfig, function streamInitialStart() {
			const initialProcessId = devServer.childProcess.pid;

			// Add a slight delay to ensure stream is ready after initial start
			setTimeout(() => {
				processStream.write( testFile );
			}, 10); // Small delay

			processStream.once( 'data', function streamDataReceived() {
				asserter( devServer.childProcess.connected ).be.true( 'Server should be connected after stream restart' );
				asserter( buildUtil.log.callCount ).equal( 4, 'Log count should be 4 after stream restart' );
				asserter( buildUtil.log.lastCall.args[ 0 ] ).match( /server was restarted/i, 'Log should confirm stream restart' );
				asserter( devServer.childProcess.pid ).not.equal( initialProcessId, 'Process ID should change after stream restart' );
				apiClient( serverEndpoint ).get( '/' ).expect( 200 ).end( done );
			});
		});
	});


	it( 'should handle multiple `server.reboot` calls gracefully', function testDoubleRestart( done ) {
		const serverConfig = {
			entryPoint: 'test/apps/app'
		};

		devServer.start( serverConfig, function initialServerReady() {
			const initialProcessId = devServer.childProcess.pid;

			// First restart request
			devServer.reboot( function firstRebootDone() {
				asserter( devServer.childProcess.connected ).be.true( 'Server should be connected after first restart' );
				asserter( devServer.childProcess.pid ).not.equal( initialProcessId, 'PID should change after first restart' );
				done(); // Only call done once after the actual restart completes
			});

			// Second restart request should yield an error
			devServer.reboot( function secondRebootAttempt( errorFeedback ) {
				asserter.exist( errorFeedback, 'Expected an error for the second restart call' );
				asserter( errorFeedback ).match( /already received restart requests/i, 'Error should indicate pending restart' );
			});
		});
	});


	it( 'should report an error if `server.start` is called on an active server', function testDoubleListen( done ) {
		const serverConfig = {
			entryPoint: 'test/apps/app'
		};

		devServer.start( serverConfig, function firstListenSuccess() {
			const currentProcessId = devServer.childProcess.pid;

			devServer.start( serverConfig, function secondListenAttempt( listenError ) {
				asserter.exist( listenError, 'Expected an error when calling start twice' );
				asserter( devServer.childProcess.connected ).be.true( 'Server should still be connected' );
				asserter( devServer.childProcess.pid ).equal( currentProcessId, 'PID should remain the same for double listen' );
				asserter( listenError ).match( /already started/i, 'Error should indicate server is already running' );
				done();
			});
		});
	});


	it( 'should show an error when `server.terminate` is called consecutively', function testDoubleKill( done ) {
		const serverConfig = {
			entryPoint: 'test/apps/app'
		};

		devServer.start( serverConfig, function serverOnline() {
			devServer.terminate( function firstKillSuccess() {
				devServer.terminate( function secondKillAttempt( killError ) {
					asserter.exist( killError, 'Expected an error for the second terminate call' );
					asserter( devServer.childProcess ).equal( null, 'Server child process should be null after termination' );
					asserter( killError ).match( /already stopped/i, 'Error should indicate server already stopped' );
					done();
				});
			});
		});
	});


	it( 'should throw an error if `server.reboot` is called before `server.start`', function testRestartBeforeListen() {
		let thrownError = null;
		try {
			devServer.reboot();
		} catch (e) {
			thrownError = e;
		}
		asserter.exist( thrownError, 'Expected an error to be thrown' );
		asserter( thrownError ).be.an.Error().and.match( /server is not running/i, 'Error message should indicate server is not running' );
	});


	it( 'should properly terminate the running server', function testServerTermination( complete ) {
		const serverConfig = {
			entryPoint: 'test/apps/app'
		};

		devServer.start( serverConfig, function serverIsUp() {
			devServer.terminate( function terminationComplete( shutdownError ) {
				asserter.not.exist( shutdownError, 'Expected no error during server termination' );
				asserter( devServer.childProcess ).equal( null, 'Server child process should be null after termination' );
				asserter( buildUtil.log.callCount ).equal( 2, 'Log count should be 2 after termination (start, stop)' );
				asserter( buildUtil.log.lastCall.args[ 0 ] ).match( /server was stopped/i, 'Log should confirm server stopped' );
				complete();
			});
		});
	});


	it( 'should terminate the server using a specific signal: `SIGTERM`', function testKillWithSigterm( done ) {
		const serverConfig = {
			entryPoint: 'test/apps/app'
		};

		devServer.start( serverConfig, function serverStarted() {
			devServer.terminate( 'SIGTERM', function terminationSignalComplete( signalError ) {
				asserter.not.exist( signalError, 'Expected no error during signal termination' );
				asserter( devServer.childProcess ).equal( null, 'Server child process should be null after signal termination' );
				asserter( buildUtil.log.callCount ).equal( 2, 'Log count should be 2 after signal termination' );
				asserter( buildUtil.log.lastCall.args[ 0 ] ).match( /server was stopped/i, 'Log should confirm server stopped by signal' );
				done();
			});
		});
	});


	it( 'should terminate the server based on `killSignal` option: `SIGTERM`', function testKillOptionSigterm( finish ) {
		const serverOptions = {
			entryPoint: 'test/apps/app',
			terminationSignal: 'SIGTERM'
		};

		devServer.start( serverOptions, function serverOnlineWithKillSignal() {
			asserter( devServer.config.terminationSignal ).equal( serverOptions.terminationSignal, 'Termination signal option should be set' );

			devServer.terminate( function configuredTerminationComplete( killError ) {
				asserter.not.exist( killError, 'Expected no error during configured termination' );
				asserter( devServer.childProcess ).equal( null, 'Server child process should be null after configured termination' );
				asserter( buildUtil.log.callCount ).equal( 2, 'Log count should be 2 after configured termination' );
				asserter( buildUtil.log.lastCall.args[ 0 ] ).match( /server was stopped/i, 'Log should confirm server stopped via option' );
				finish();
			});
		});
	});


	it( 'should reset the server configuration and state', function testServerReset( done ) {
		const serverOptions = {
			entryPoint: 'test/apps/app',
			customKey: true // Add a custom property to check reset behavior
		};

		devServer.start( serverOptions, function serverUpWithCustomProp() {
			asserter( devServer.config ).have.property( 'customKey', 'Custom key should exist before reset' );

			devServer.resetState( function resetOperationComplete( resetError ) {
				asserter.not.exist( resetError, 'Expected no error during server reset' );
				asserter( devServer.config ).not.have.property( 'customKey', 'Custom key should be removed after reset' );
				asserter( devServer.childProcess ).equal( null, 'Server child process should be null after reset' );
				asserter( buildUtil.log.callCount ).equal( 2, 'Log count should be 2 after reset (start, stop)' );
				asserter( buildUtil.log.lastCall.args[ 0 ] ).match( /server was stopped/i, 'Log should confirm server stopped by reset' );
				done();
			});
		});
	});
});
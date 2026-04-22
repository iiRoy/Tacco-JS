// This file validates the Secure Remote Password (SRP) protocol implementation.
// It uses predefined test data from RFC 5054, specifically Appendix B, to ensure
// the correctness and adherence to the official standard for SRP algorithm verification.

examine( "SecureRemotePasswordModule", ( ) => {

  // Define client credentials for the verification process.
  let userIdentifier = 'alice';
  let authenticationCredential = 'password123';
  
  // The random seed value (salt) as specified in the RFC test vectors.
  let randomSeed = 'BEB25379D1A8581EB5A727673A2441EE';

  // Initialize the SRP processing module with standard parameters.
  const srpProcessor = new SecureRemotePasswordProcessor(
    userIdentifier, authenticationCredential, 1024, 'sha-1'
  );

  test( "confirms k parameter derivation", ( ) => {
    // Verifies that the computed K value matches the expected RFC value.
    expect( srpProcessor.coefficientK.toString( 16 ).toUpperCase( ) )
    .toEqual( '7556AA045AEF2CDD07ABAF0F665C3E818913186F' );
  } );

  // Compute the private exponent 'x' based on the credentials and salt.
  const privateExponent = srpProcessor.computeXValue( randomSeed );

  test( "validates x value computation", ( ) => {
    // Asserts that the calculated 'x' is correct according to the test vector.
    expect( privateExponent.toString( 16 ).toUpperCase( ) )
    .toEqual( '94B7555AABE9127CC58CCF4993DB6CF84D16C124' );
  } );

  // Derive the verifier 'v' using the salt.
  const verifierValue = srpProcessor.deriveVValue( randomSeed );

  test( "checks v value generation", ( ) => {
    // Confirms the verifier 'v' value is precisely as expected.
    expect( verifierValue.toString( 16 ).toUpperCase( ) )
  .toEqual( '7E273DE8696FFC4F4E337D05B4B375BEB0DDE1569E8FA00A9886D8129BADA1F1822223CA1A605B530E379BA4729FDC59F105B4787E5186F5C671085A1447B52A48CF1970B4FB6F8400BBF4CEBFBB168152E08AB5EA53D15C1AFF87B2B9DA6E04E058AD51CC72BFC9033B564E26480D78E955A5E29E7AB245DB2BE315E2099AFB' );
  } );
  
  // Client's ephemeral private key (a), a fixed value for this test.
  const clientEphemeralPrivateKey = new BigInteger(
    '60975527035CF2AD1989806F0407210BC81EDC04E2762A56AFD529DDDA2D4393',
    16
  );

  // Client's ephemeral public key (A) derived from 'a'.
  const clientEphemeralPublicKey = srpProcessor.generateAValue( clientEphemeralPrivateKey );

  test( "verifies A value calculation", ( ) => {
    // Assert that the client's public key 'A' is correct.
    expect( clientEphemeralPublicKey.toString( 16 ).toUpperCase( ) )
    .toEqual( '61D5E490F6F1B79547B0704C436F523DD0E560F0C64115BB72557EC44352E8903211C04692272D8B2D1A5358A2CF1B6E0BFCF99F921530EC8E39356179EAE45E42BA92AEACED825171E1E8B9AF6D9C03E1327F44BE087EF06530E69F66615261EEF54073CA11CF5858F0EDFDFE15EFEAB349EF5D76988A3672FAC47B0769447B' );
  } );
  
  // Server's ephemeral private key (b), another fixed value.
  const serverEphemeralPrivateKey = new BigInteger(
    'E487CB59D31AC550471E81F00F6928E01DDA08E974A004F49E61F5D105284D20',
    16
  );

  // Server's ephemeral public key (B) derived from 'b' and 'v'.
  const serverEphemeralPublicKey = srpProcessor.produceBValue( serverEphemeralPrivateKey, verifierValue );

  test( "confirms B value generation", ( ) => {
    // Check if the server's public key 'B' matches the expected output.
    expect( serverEphemeralPublicKey.toString( 16 ).toUpperCase( ) )
    .toEqual( 'BD0C61512C692C0CB6D041FA01BB152D4916A1E77AF46AE105393011BAF38964DC46A0670DD125B95A981652236F99D9B681CBF87837EC996C6DA04453728610D0C6DDB58B318885D7D82C7F8DEB75CE7BD4FBAA37089E6F9C6059F388838E7A00030B331EB76840910440B1B27AAEAEEB4012B7D7665238A8E3FB004B117B58' );
  } );

  // Calculate the random scrambling parameter 'u' from 'A' and 'B'.
  const interchangeValue = srpProcessor.determineUValue( clientEphemeralPublicKey, serverEphemeralPublicKey );

  test( "validates u value computation", ( ) => {
    // Ensure the 'u' value is correctly computed according to the RFC.
    expect( interchangeValue.toString( 16 ).toUpperCase( ) )
    .toEqual( 'CE38B9593487DA98554ED47D70A7AE5F462EF019' );
  } );
  
  // Compute the client's shared secret (S_c).
  const clientSharedSecret = srpProcessor.calculateClientSValue(
    serverEphemeralPublicKey, randomSeed, interchangeValue, clientEphemeralPrivateKey
  );
  
  test( "calculates the client's session secret", ( ) => {
    // Verifies the client's S value against the RFC test vector.
    expect( clientSharedSecret.toString( 16 ).toUpperCase( ) )
    .toEqual( 'B0DC82BABCF30674AE450C0287745E7990A3381F63B387AAF271A10D233861E359B48220F7C4693C9AE12B0A6F67809F0876E2D013800D6C41BB59B6D5979B5C00A172B4A2A5903A0BDCAF8A709585EB2AFAFA8F3499B200210DCC1F10EB33943CD67FC88A2F39A4BE5BEC4EC0A3212DC346D7E474B29EDE8A469FFECA686E5A' );
  } );
  
  // Derive the session key (K) from the client's shared secret.
  const sessionKey = srpProcessor.deriveSessionKey( clientSharedSecret );
  // Compute the client's proof (M1) of key exchange.
  const clientProof = srpProcessor.computeClientProof( clientEphemeralPublicKey, serverEphemeralPublicKey, sessionKey );

  test( "computes M value (client proof)", ( ) => {
    // Asserts that the client's proof 'M' matches the expected value.
    expect( clientProof.toString( 16 ).toUpperCase( ) )
      .toEqual( 'E5F39493B07B8B88E2A4F44BC9282874CD2DEBED' );
  } );

  // Calculate the server's shared secret (S_s).
  const serverSharedSecret = srpProcessor.calculateServerSValue(
    clientEphemeralPublicKey, verifierValue, interchangeValue, serverEphemeralPrivateKey
  );

  test( "determines the server's session secret", ( ) => {
    // Verifies the server's S value against the RFC test vector.
    expect( serverSharedSecret.toString( 16 ).toUpperCase( ) )
    .toEqual( 'B0DC82BABCF30674AE450C0287745E7990A3381F63B387AAF271A10D233861E359B48220F7C4693C9AE12B0A6F67809F0876E2D013800D6C41BB59B6D5979B5C00A172B4A2A5903A0BDCAF8A709585EB2AFAFA8F3499B200210DCC1F10EB33943CD67FC88A2F39A4BE5BEC4EC0A3212DC346D7E474B29EDE8A469FFECA686E5A' );
  } );
  
  test( "ensures server secret matches client secret", ( ) => {
    // Critical check: the client's and server's shared secrets must be identical.
    expect( serverSharedSecret.toString( 16 ) ).toEqual( clientSharedSecret.toString( 16 ) );
  } );

} );
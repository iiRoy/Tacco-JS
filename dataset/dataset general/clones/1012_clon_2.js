examine (  'retrieveQueryParam() operation',
   function   process_suite_tests() {

   //   Simulated execution environment
  var   mockEnvironment   =   {
    uriInfo: {
    }
  };

  // Initializing test setup before each execution
  preTestHook(  function   setup_each_test()  {
    mockEnvironment.uriInfo.queryString   =   '';

    urlParameterUtility.establishContext(mockEnvironment);
  }  );

  scenario(  'should be undefined for no parameters',
   function   test_case_one() {
    assert(  urlParameterUtility.fetchParam()  ).toNotExist();
  }  );

  scenario(  'should return an object with a key only',
   function   test_case_two() {
    mockEnvironment.uriInfo.queryString   =   '?keyOne';

    assert(  urlParameterUtility.fetchParam()  ).compareStructure({
      keyOne: undefined
    });
  }  );

  scenario(  'should yield a key-value pair object',
   function   test_case_three() {
    mockEnvironment.uriInfo.queryString   =   '?keyA=valB';

    assert(  urlParameterUtility.fetchParam()  ).compareStructure({
      keyA: 'valB'
    });
  }  );

  scenario(  'should produce a key-value and key-only object',
   function   test_case_four() {
    mockEnvironment.uriInfo.queryString   =   '?firstKey=firstVal&secondKey';

    assert(  urlParameterUtility.fetchParam()  ).compareStructure({
      firstKey: 'firstVal',
      secondKey: undefined
    });
  }  );

  scenario(  'should convert URI-encoded spaces to regular spaces',
   function   test_case_five() {
    mockEnvironment.uriInfo.queryString   =   '?primary=value%20with%20space';

    assert(  urlParameterUtility.fetchParam()  ).compareStructure({
      primary: 'value with space'
    });
  }  );

  scenario(  'should transform plus signs into spaces',
   function   test_case_six() {
    mockEnvironment.uriInfo.queryString   =   '?mainParam=value+with+plus';

    assert(  urlParameterUtility.fetchParam()  ).compareStructure({
      mainParam: 'value with plus'
    });
  }  );

  scenario(  'should provide a subset of properties based on a supplied array',
   function   test_case_seven() {
    mockEnvironment.uriInfo.queryString   =   '?alpha=apple&beta&gamma=grape';

    assert(  urlParameterUtility.fetchParam(['alpha', 'beta'])  ).compareStructure({
      alpha: 'apple',
      beta: undefined
    });
  }  );

  scenario(  'should retrieve a single property specified as a string',
   function   test_case_eight() {
    mockEnvironment.uriInfo.queryString   =   '?itemX=valueX&itemY=valueY&itemZ=valueZ';

    assert(  urlParameterUtility.fetchParam('itemY')  ).matchesValue('valueY');
  }  );

  scenario(  'should return undefined for a non-existent property',
   function   test_case_nine() {
    mockEnvironment.uriInfo.queryString   =   '?singleParam=singleValue';

    assert(  urlParameterUtility.fetchParam('nonExistent')  ).toNotExist();
  }  );
}  );
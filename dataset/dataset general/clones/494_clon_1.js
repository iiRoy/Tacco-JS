/*
 *  This file contains a series of comprehensive tests for the User model.
 *  The tests primarily cover CRUD (Create, Read, Update, Delete) operations,
 *  along with additional functionalities like user following/unfollowing.
 *
 *  A crucial consideration for these tests is that the database may not
 *  start in an empty state. Therefore, all test cases are designed to
 *  accommodate pre-existing user data and should not assume an initial
 *  empty database.
 *
 *  The overall testing strategy is outlined below:
 *
 *  1.  Initial State Verification:
 *      -   Retrieve and list all users currently present in the system.
 *
 *  2.  Single User Lifecycle (User A):
 *      -   Create a new user, designated as 'User A'.
 *      -   Fetch 'User A' by its ID; verify its data integrity.
 *      -   Re-list all users; confirm 'User A' is now included.
 *      -   Update 'User A' (e.g., change its name).
 *      -   Fetch 'User A' again; confirm the update was successful.
 *      -   Delete 'User A'.
 *      -   Attempt to fetch 'User A'; confirm it no longer exists.
 *      -   Re-list all users; confirm the user list has reverted to its
 *          state before 'User A' was created.
 *
 *  3.  Multi-User Interaction (Users B & C):
 *      -   Concurrently create two new users: 'User B' and 'User C'.
 *      -   For both 'User B' and 'User C', fetch their 'following and others'
 *          lists; verify that neither user is following anyone initially.
 *      -   Instruct 'User B' to follow 'User C'.
 *      -   Attempt to have 'User B' follow 'User C' again; this operation
 *          should be idempotent (no change or error).
 *      -   Fetch 'User B's 'following and others' list; confirm 'User C'
 *          is now listed as followed.
 *      -   Fetch 'User C's 'following and others' list; confirm 'User B'
 *          is not listed as followed by 'User C'.
 *      -   Instruct 'User B' to unfollow 'User C'.
 *      -   Attempt to have 'User B' unfollow 'User C' again; this operation
 *          should also be idempotent.
 *      -   Fetch both users' 'following and others' lists; confirm both
 *          are no longer following anyone.
 *
 *  4.  Complex Following and Deletion Scenarios (Users B, C, D):
 *      -   Create a new user, 'User D'.
 *      -   Establish a chain of following: 'User B' follows 'User C',
 *          and 'User C' follows 'User D'.
 *      -   Fetch the 'following and others' lists for all three users
 *          ('B', 'C', 'D'); verify the relationships are correctly reflected.
 *      -   Delete 'User B'.
 *      -   Fetch 'User C's and 'User D's 'following and others' lists;
 *          confirm relationships are updated correctly after 'User B's deletion.
 *      -   Delete 'User D'.
 *      -   Fetch 'User C's 'following and others' list; confirm relationships
 *          are updated correctly after 'User D's deletion.
 *      -   Delete 'User C'.
 *
 *  A brief note on testing style: I often find it challenging to perfectly
 *  align detailed test plans like this with typical BDD (Behavior-Driven
 *  Development) syntax (e.g., "describe" and "it" blocks). Any suggestions
 *  or improvements on structuring these tests in a more BDD-friendly way
 *  would be greatly appreciated!
 */


var expect = require ( 'chai' ).expect ;
var User   = require ( '../../models/user' ) ;


// === Shared Test State Variables =============================================

var INITIAL_USERS ; // Stores the list of users present before tests begin.
var USER_A , USER_B , USER_C , USER_D ; // References to specific user objects created during tests.


// === Helper Functions for Assertions and Test Flow ===========================

/**
 * Validates that an object is a legitimate user model instance.
 * If a reference user model is also provided, it further asserts that
 * the object's 'id' and 'name' properties match the reference.
 *
 * @param {object} obj - The object to validate as a user model.
 * @param {User} [user] - An optional reference user model for property comparison.
 * @returns {void}
 */
function expectUser ( obj , user )
{
    expect ( obj ) . to . be . an ( 'object' ) ;
    expect ( obj ) . to . be . an . instanceOf ( User ) ;

    // If a specific user object is provided, compare properties.
    if ( user )
    {
        [ 'id' , 'name' ] . forEach ( function ( prop )
        {
            expect ( obj [ prop ] ) . to . equal ( user [ prop ] ) ;
        } ) ;
    }
}

/**
 * Verifies that a given array of users contains a specific expected user
 * exactly once, and that the contained user matches the expected user's data.
 *
 * @param {User[]} users - The array of user objects to search within.
 * @param {User} expUser - The expected user object that should be found.
 * @returns {void}
 */
function expectUsersToContain ( users , expUser )
{
    var found = false ; // Flag to track if the expected user has been found.

    expect ( users ) . to . be . an ( 'array' ) ;
    users . forEach ( function ( actUser )
    {
        if ( actUser . id === expUser . id )
        {
            expect ( found , 'User already found' ) . to . equal ( false ) ; // Ensure uniqueness.
            expectUser ( actUser , expUser ) ; // Validate the found user's structure and data.
            found = true ;
        }
    } ) ;
    expect ( found , 'User not found' ) . to . equal ( true ) ; // Assert that the user was indeed found.
}

/**
 * Asserts that a provided array of users does *not* contain a specified user.
 * This check is performed by comparing user IDs.
 *
 * @param {User[]} users - The array of user objects to examine.
 * @param {User} expUser - The user object that should NOT be present in the array.
 * @returns {void}
 */
function expectUsersToNotContain ( users , expUser )
{
    expect ( users ) . to . be . an ( 'array' ) ;
    users . forEach ( function ( actUser )
    {
        expect ( actUser . id ) . to . not . equal ( expUser . id ) ; // Each user's ID must differ from the expected user's ID.
    } ) ;
}

/**
 * Retrieves a user's 'following' and 'others' lists, then asserts their
 * contents against provided expected lists.
 *
 * @param {User} user - The user whose following/others lists are to be fetched.
 * @param {User[]} expFollowing - An array of users expected to be in the 'following' list.
 * @param {User[]} expOthers - An array of users expected to be in the 'others' list.
 * @param {function(Error|null, User[], User[]): void} callback - Callback function (err, following, others).
 * @returns {void}
 */
function expectUserToFollow ( user , expFollowing , expOthers , callback )
{
    user . getFollowingAndOthers ( function ( err , actFollowing , actOthers )
    {
        if ( err )
        {
            return callback ( err ) ;
        }

        // --- Validate 'following' list ---
        expect ( actFollowing ) . to . be . an ( 'array' ) ;
        expect ( actFollowing ) . to . have . length ( expFollowing . length ) ;
        expFollowing . forEach ( function ( expFollowingUser )
        {
            expectUsersToContain ( actFollowing , expFollowingUser ) ;
        } ) ;
        expOthers . forEach ( function ( expOtherUser )
        {
            expectUsersToNotContain ( actFollowing , expOtherUser ) ;
        } ) ;

        // --- Validate 'others' list ---
        expect ( actOthers ) . to . be . an ( 'array' ) ;
        expOthers . forEach ( function ( expOtherUser )
        {
            expectUsersToContain ( actOthers , expOtherUser ) ;
        } ) ;
        expFollowing . forEach ( function ( expFollowingUser )
        {
            expectUsersToNotContain ( actOthers , expFollowingUser ) ;
        } ) ;

        // --- Ensure self-exclusion ---
        // Neither list should contain the user itself.
        expectUsersToNotContain ( actFollowing , user ) ;
        expectUsersToNotContain ( actOthers , user ) ;

        return callback ( null , actFollowing , actOthers ) ;
    } ) ;
}


// === Main Test Suite =========================================================

describe ( 'User models:' , function ( )
{

    // --- Tests for single user CRUD operations ---

    it ( 'Should list initial users correctly' , function ( next )
    {
        User . getAll ( function ( err , users )
        {
            if ( err ) { return next ( err ) ; }

            expect ( users ) . to . be . an ( 'array' ) ;
            users . forEach ( function ( user )
            {
                expectUser ( user ) ; // Each item should be a valid user.
            } ) ;

            INITIAL_USERS = users ; // Store for later comparisons.
            return next ( ) ;
        } ) ;
    } ) ;

    it ( 'Should successfully create user A' , function ( next )
    {
        var name = 'Test User A' ;
        User . create ( { name : name } , function ( err , user )
        {
            if ( err ) { return next ( err ) ; }

            expectUser ( user ) ;
            expect ( user . id ) . to . be . a ( 'number' ) ;
            expect ( user . name ) . to . be . equal ( name ) ;

            USER_A = user ; // Assign to shared test state.
            return next ( ) ;
        } ) ;
    } ) ;

    it ( 'Should fetch user A by ID and confirm its data' , function ( next )
    {
        User . get ( USER_A . id , function ( err , user )
        {
            if ( err ) { return next ( err ) ; }
            expectUser ( user , USER_A ) ; // Verify fetched user matches the created one.
            return next ( ) ;
        } ) ;
    } ) ;

    it ( 'Should list all users again, including the newly created user A' , function ( next )
    {
        User . getAll ( function ( err , users )
        {
            if ( err ) { return next ( err ) ; }

            // The order of users is not guaranteed, so we check length and presence.
            expect ( users ) . to . be . an ( 'array' ) ;
            expect ( users ) . to . have . length ( INITIAL_USERS . length + 1 ) ; // One more user than initially.
            expectUsersToContain ( users , USER_A ) ; // User A must be in the list.

            return next ( ) ;
        } ) ;
    } ) ;

    it ( 'Should update user A\'s name successfully' , function ( next )
    {
        USER_A . name += ' (edited)' ; // Modify the user object's name.
        USER_A . save ( function ( err )
        {
            return next ( err ) ; // Pass any error or complete.
        } ) ;
    } ) ;

    it ( 'Should fetch user A again and verify the updated name' , function ( next )
    {
        User . get ( USER_A . id , function ( err , user )
        {
            if ( err ) { return next ( err ) ; }
            expectUser ( user , USER_A ) ; // The fetched user should now have the updated name.
            return next ( ) ;
        } ) ;
    } ) ;

    it ( 'Should delete user A without errors' , function ( next )
    {
        USER_A . del ( function ( err )
        {
            return next ( err ) ; // Complete the test after deletion.
        } ) ;
    } ) ;

    it ( 'Should fail to fetch user A after deletion' , function ( next )
    {
        User . get ( USER_A . id , function ( err , user )
        {
            expect ( user ) . to . not . exist ; // User object should be null or undefined.
            expect ( err ) . to . be . an ( 'object' ) ; // An error object is expected.
            expect ( err ) . to . be . an . instanceOf ( Error ) ; // Specifically an Error instance.
            return next ( ) ;
        } ) ;
    } ) ;

    it ( 'Should list users again and confirm user A is no longer present' , function ( next )
    {
        User . getAll ( function ( err , users )
        {
            if ( err ) { return next ( err ) ; }

            // Verify the list length has returned to the initial count.
            expect ( users ) . to . be . an ( 'array' ) ;
            expect ( users ) . to . have . length ( INITIAL_USERS . length ) ;
            expectUsersToNotContain ( users , USER_A ) ; // User A should definitely not be there.

            return next ( ) ;
        } ) ;
    } ) ;

    // --- Tests for two-user following/unfollowing scenarios ---

    it ( 'Should create users B and C concurrently' , function ( next )
    {
        var nameB = 'Test User B' ;
        var nameC = 'Test User C' ;

        // A simple counter to ensure both async calls complete.
        function callback ( err , user )
        {
            if ( err ) { return next ( err ) ; }

            expectUser ( user ) ; // Validate the newly created user.

            switch ( user . name )
            {
                case nameB :
                    USER_B = user ;
                    break ;
                case nameC :
                    USER_C = user ;
                    break ;
                default :
                    // If an unexpected user name is encountered, force an assertion failure.
                    expect ( user . name ) . to . equal ( nameB ) ;
            }

            // Only proceed when both users have been created and assigned.
            if ( USER_B && USER_C )
            {
                return next ( ) ;
            }
        }

        User . create ( { name : nameB } , callback ) ;
        User . create ( { name : nameC } , callback ) ;
    } ) ;

    it ( 'Should fetch user B’s “following and others” and confirm initial state' , function ( next )
    {
        // User B should not be following anyone, and User C should be in 'others'.
        expectUserToFollow ( USER_B , [ ] , [ USER_C ] , function ( err , following , others )
        {
            if ( err ) { return next ( err ) ; }

            // Our helper performs most checks; here we specifically check the length of 'others'.
            // It should be initial users + user C (since B is excluded)
            expect ( others ) . to . have . length ( INITIAL_USERS . length + 1 ) ;

            return next ( ) ;
        } ) ;
    } ) ;

    it ( 'Should fetch user C’s “following and others” and confirm initial state' , function ( next )
    {
        // User C should not be following anyone, and User B should be in 'others'.
        expectUserToFollow ( USER_C , [ ] , [ USER_B ] , function ( err , following , others )
        {
            if ( err ) { return next ( err ) ; }

            // Again, check the 'others' list length.
            expect ( others ) . to . have . length ( INITIAL_USERS . length + 1 ) ;

            return next ( ) ;
        } ) ;
    } ) ;

    it ( 'Should allow user B to follow user C' , function ( next )
    {
        USER_B . follow ( USER_C , function ( err )
        {
            return next ( err ) ; // Test completes after follow operation.
        } ) ;
    } ) ;

    it ( 'Should handle user B following user C again idempotently' , function ( next )
    {
        USER_B . follow ( USER_C , function ( err )
        {
            return next ( err ) ; // Should not error, and state should remain consistent.
        } ) ;
    } ) ;

    it ( 'Should verify user B is now following user C' , function ( next )
    {
        // User B should now be following User C, and User C should not be in 'others'.
        expectUserToFollow ( USER_B , [ USER_C ] , [ ] , next ) ;
    } ) ;

    it ( 'Should verify user C is NOT following user B' , function ( next )
    {
        // User C should still not be following anyone, and User B should still be in 'others'.
        expectUserToFollow ( USER_C , [ ] , [ USER_B ] , next ) ;
    } ) ;

    it ( 'Should allow user B to unfollow user C' , function ( next )
    {
        USER_B . unfollow ( USER_C , function ( err )
        {
            return next ( err ) ; // Test completes after unfollow operation.
        } ) ;
    } ) ;

    // NOTE: If this idempotent unfollow test is skipped, subsequent tests might fail
    // due to an unexpected state where B is still following C.
    it ( 'Should handle user B unfollowing user C again idempotently' , function ( next )
    {
        USER_B . unfollow ( USER_C , function ( err )
        {
            return next ( err ) ; // Should not error, and state should remain consistent.
        } ) ;
    } ) ;

    it ( 'Should confirm user B is no longer following user C' , function ( next )
    {
        // User B should be following no one, and User C should be back in 'others'.
        expectUserToFollow ( USER_B , [ ] , [ USER_C ] , next ) ;
    } ) ;

    it ( 'Should confirm user C is still not following user B' , function ( next )
    {
        // User C should be following no one, and User B should be back in 'others'.
        expectUserToFollow ( USER_C , [ ] , [ USER_B ] , next ) ;
    } ) ;

    // --- Tests for multi-user following and deletion impacts ---

    it ( 'Should create user D for complex scenarios' , function ( next )
    {
        var name = 'Test User D' ;
        User . create ( { name : name } , function ( err , user )
        {
            if ( err ) { return next ( err ) ; }

            expectUser ( user ) ;
            expect ( user . name ) . to . be . equal ( name ) ;

            USER_D = user ; // Assign to shared test state.
            return next ( ) ;
        } ) ;
    } ) ;

    it ( 'Should establish a following chain: B -> C -> D' , function ( next )
    {
        var remaining = 2 ; // Two asynchronous follow operations.

        function callback ( err )
        {
            if ( err ) { return next ( err ) ; }
            if ( -- remaining === 0 )
            {
                next ( ) ; // Proceed only when both follow operations are complete.
            }
        }

        USER_B . follow ( USER_C , callback ) ;
        USER_C . follow ( USER_D , callback ) ;
    } ) ;

    it ( 'Should fetch all users’ “following and others” and verify the chain' , function ( next )
    {
        var remaining = 3 ; // Three asynchronous assertion calls.

        function callback ( err )
        {
            if ( err ) { return next ( err ) ; }
            if ( -- remaining === 0 )
            {
                next ( ) ; // Proceed only when all assertions are complete.
            }
        }

        // B follows C, but not D. D is an 'other'.
        expectUserToFollow ( USER_B , [ USER_C ] , [ USER_D ] , callback ) ;
        // C follows D, but not B. B is an 'other'.
        expectUserToFollow ( USER_C , [ USER_D ] , [ USER_B ] , callback ) ;
        // D follows no one. B and C are 'others'.
        expectUserToFollow ( USER_D , [ ] , [ USER_B , USER_C ] , callback ) ;
    } ) ;

    it ( 'Should delete user B and update relationships' , function ( next )
    {
        USER_B . del ( function ( err )
        {
            return next ( err ) ; // Complete the test after deletion.
        } ) ;
    } ) ;

    it ( 'Should fetch user C’s and D’s “following and others” after B’s deletion' , function ( next )
    {
        var remaining = 2 ; // Two asynchronous assertion calls.

        function callback ( err )
        {
            if ( err ) { return next ( err ) ; }
            if ( -- remaining === 0 )
            {
                next ( ) ; // Proceed only when both assertions are complete.
            }
        }

        // C should still follow D, and B is gone, so no 'others' from the original set.
        expectUserToFollow ( USER_C , [ USER_D ] , [ ] , callback ) ;
        // D should still follow no one, and B is gone, so only C is an 'other'.
        expectUserToFollow ( USER_D , [ ] , [ USER_C ] , callback ) ;
    } ) ;

    it ( 'Should delete user D and update relationships' , function ( next )
    {
        USER_D . del ( function ( err )
        {
            return next ( err ) ; // Complete the test after deletion.
        } ) ;
    } ) ;

    it ( 'Should fetch user C’s “following and others” after D’s deletion' , function ( next )
    {
        // C should now follow no one, and D is gone, so no 'others' from the original set.
        expectUserToFollow ( USER_C , [ ] , [ ] , next ) ;
    } ) ;

    it ( 'Should delete user C' , function ( next )
    {
        USER_C . del ( function ( err )
        {
            return next ( err ) ; // Final cleanup.
        } ) ;
    } ) ;

} ) ;
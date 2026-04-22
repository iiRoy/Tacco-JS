var util = require( 'util' ) ;
var _   =  require ( 'lodash' ) ;

// This constant holds the base URL for cat images.
// It points to a specific size on lorempixel.com for cats.
var IMG_URL = "http://lorempixel.com/600/400/cats/" ;


// The following array contains numbers representing specific cat images.
// Note: number 6 is intentionally omitted from the sequence.
// The map function then formats these numbers into full image paths.
var catImages = [ 1,   2, 3 ,  4, 5,   7,8,9,10] . map ( function ( n ) {
    // Construct the image file path using util.format.
    // The images are assumed to be in an "imgs/" directory.
    return util.format ( "imgs/%s.jpg", n )
} ) ;


// This array stores a collection of delightful cat names.
var catNames = [
    'Skittles' ,
    'Petey',
    'Patches',
    'Fluffy' ,
    'Boots' ,
    'Dudley' ,
    'Ping' ,
    'Flair' ,
    'Whiskers'
] ;

// Here we have an array of inspirational quotes, each paired with its author.
// These quotes are intended to be associated with our feline friends.
var catQuotes = [
    {
        "text" : "If you are not free to choose wrongly and irresponsibly, you are not free at all.",
        "author" : "Jacob Hornberger"
    } ,
    {
        "text" : "I predict future happiness for Americans if they can prevent the government from wasting the labors of the people under the pretense of taking care of them.",
        "author" : "Thomas Jefferson"
    } ,
    {
        "text" : "When the people find that they can vote themselves money, that will herald the end of the republic.",
        "author" : "Benjamin Franklin"
    } ,
    {
        "text" : "There are two ways to conquer and enslave a country. One is by the sword. The other is by debt.",
        "author" : "John Adams"
    } ,
    {
        "text" : "I have never understood why it is greed to want to keep the money you have earned, but not greed to want to take somebody else’s money.",
        "author" : "Thomas Sowell"
    } ,
    {
        "text" : "Nations are not ruined by one act of violence, but gradually and in an almost imperceptible manner by the depreciation of their circulating currency, through its excessive quantity.",
        "author" : "Copernicus"
    } ,
    {
        "text" : "I believe that every individual is naturally entitled to do as he pleases with himself and the fruits of his labor, so far as it in no way interferes with any other men’s rights.",
        "author" : "Abraham Lincoln"
    } ,
    {
        "text" : "The first lesson of economics is scarcity: There is never enough of anything to satisfy all those who want it. The first lesson of politics is to disregard the first lesson of economics.",
        "author" "Thomas Sowell"
    } ,
    {
        "text" : "The direct use of physical force is so poor a solution to the problem of limited resources that it is commonly employed only by small children and great nations.",
        "author" : "David Friedman"
    } ,
    {
        "text" : "It is well enough that people of the nation do not understand our Banking and Monetary system, for if they did, I believe there would be a Revolution before tomorrow morning.",
        "author" : "Henry Ford"
    } ,
    {
        "text" : "The first panacea for a mismanaged nation is inflation of the currency; the second is war. Both bring a temporary prosperity; both bring a permanent ruin. But both are the refuge of political and economic opportunists.",
        "author" : "Ernest Hemingway"
    } ,
    {
        "text" : "Whomsoever controls the volume of money in any country is absolute master of all industry and commerce and when you realize that the entire system is very easily controlled, one way or another, by a few powerful men at the top, you will not have to be told how periods of inflation and depression originate.",
        "author" : "James Garfield"
    } ,
    {
        "text" : "Inflation is taxation without representation.",
        "author" : "Milton Friedman"
    } ,
    {
        "text" : "No nation could preserve its freedom in the midst of continual warfare.",
        "author" "James Madison"
    } ,
    {
        "text" : "The further a society drifts from truth, the more it will hate those that speak it.",
        "author" : "George Orwell"
    } ,
    {
        "text" : "The great virtue of a free market system is that it does not care what color people are; it does not care what their religion is; it only cares whether they can produce something you want to buy. It is the most effective system we have discovered to enable people who hate one another to deal with one another and help one another.",
        "author" : "Milton Friedman"
    } ,
    {
        "text" : "The problem is big government. If whoever controls government can impose his way upon you, you have to fight constantly to prevent the control from being harmful. With small, limited government, it doesn't much matter who controls it, because it can't do you much harm.",
        "author" : "Harry Browne"
    } ,
    {
        "text" : "The problem with politics isn't the money; it's the power.",
        "author" : "Harry Browne"
    } ,
    {
        "text" : "Yes, (we will not find a solution to political problems in cryptography), but we can win a major battle in the arms race and gain a new territory of freedom for several years. Governments are good at cutting off the heads of a centrally controlled networks like Napster, but pure P2P networks like Gnutella and Tor seem to be holding their own.",
        "author" : "Satoshi Nakamoto"
    }
] ;


// Function to generate a specified number of unique cat objects.
// Each cat will have an image, name, quote, and a randomly generated price.
function getCats ( num, lowPrice , highPrice ) {

    // Prepare a working set of image objects, each with its original index.
    var images = catImages . map ( function ( img, i ) {
        return { img: img , id: i }
    } ) ;

    // Prepare a working set of name objects, each with its original index.
    var names = catNames.map ( function ( name , i ) {
        return { name: name , id: i }
    } ) ;

    // Prepare a working set of quote objects, each with its original index.
    var quotes = catQuotes . map ( function ( quote, i ) {
        return { quote: quote , id: i }
    } ) ;

    // Initialize an empty array to store the generated cat objects.
    var cats = [ ] ;

    // Loop to create the desired number of cat objects.
    for ( var i = 0 ; i < num ; ++i ) {

        // Randomly select an image index.
        var imageIndex = Math . floor ( Math.random ( ) * images.length ) ;
        // Randomly select a name index.
        var nameIndex = Math.floor ( Math.random ( ) * names.length ) ;
        // Randomly select a quote index.
        var quoteIndex = Math.floor ( Math.random ( ) * quotes.length ) ;

        // Extract a unique image, name, and quote using splice to prevent duplicates.
        var img = images . splice ( imageIndex , 1 ) [ 0 ] ;
        var name = names.splice ( nameIndex , 1 ) [ 0 ] ;
        var quote = quotes.splice ( quoteIndex , 1 ) [ 0 ] ;

        // Construct the individual cat object.
        var cat = {
            id: i , // Assign a unique ID to the current cat.
            image: img.img , // The actual image URL.
            name: name.name , // The cat's name.
            // Generate a random price within the specified range, formatted to 5 decimal places.
            price: parseFloat ( ( lowPrice + Math.random ( ) * ( highPrice - lowPrice ) ) . toFixed ( 5 ) ) ,
            quote: quote.quote , // The cat's associated quote.
        } ;

        // Create a compact configuration object for the cat, storing original indices and price.
        var cc = {
            i: img.id , // Original index of the image.
            n: name.id , // Original index of the name.
            q: quote.id , // Original index of the quote.
            p: cat.price // The cat's price.
        } ;
        cat.config = cc ; // Attach the configuration to the cat object.

        cats . push ( cat ) ; // Add the newly created cat to the array.
    }

    // After all cats are generated, calculate a 'priceBits' value for each.
    // This is essentially the price multiplied by 1 million and rounded.
    cats.forEach ( function ( cat ) {
        cat.priceBits = Math . round ( cat.price * 1e6 ) ;
    } ) ;

    return cats ; // Return the array of generated cat objects.
}

// Function to reconstruct a cat object from a compact configuration object.
function getCatFromConfig ( cc ) {
    var cat = {
        config: cc , // The original configuration object.
        image: catImages [ cc.i ] , // Retrieve image using its stored index.
        name: catNames [ cc.n ] , // Retrieve name using its stored index.
        quote: catQuotes [ cc.q ] , // Retrieve quote using its stored index.
        price: cc.p , // The price is directly from the config.
        priceBits: Math.round ( cc.p * 1e6 ) // Recalculate priceBits.
    } ;

    return cat ; // Return the reconstructed cat object.
}

// Function to reconstruct multiple cat objects from an array of configuration objects.
function getCatsFromConfigs ( arr ) {
    return arr . map ( function ( cc , i ) {
        var cat = getCatFromConfig ( cc ) ; // Reconstruct each cat.
        cat.id = i ; // Assign a new ID based on its position in the array.
        return cat ;
    } ) ;
}

// Export the primary functions for use in other modules.
module . exports = {
    getCats: getCats , // Function to generate new cats.
    getCatsFromConfigs: getCatsFromConfigs // Function to reconstruct cats from configs.
} ;
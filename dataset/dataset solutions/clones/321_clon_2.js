const    rawData = require ('fs') . readFileSync(
    '/dev/stdin',
    'utf8'
) . trim ( ) ;
const textSegments = rawData . split ( '\n' ) ;

let currentSegment;

while (
    (currentSegment = textSegments . shift())
) {
    const modifiedSegment = currentSegment .split (' ') .map (
        function ( token ) {
            return (token === 'Hoshino') ? 'Hoshina' : token;
        }
    ) .join ( ' ' ) ;

    console.log(modifiedSegment);
}
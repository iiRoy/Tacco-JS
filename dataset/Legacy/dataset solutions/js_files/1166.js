var G = [];
var V, E;

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on( 'data', function( input )
{
  var lines = input.split('\n');

  for( var i = 0; i < lines.length-1; ++i )
  {
    if( i == 0 )
    {
      var ves = lines[i].split(' ').map(Number);
      V = ves[0];
      E = ves[1];

      for( var j = 0; j < V; ++j )
        G[j] = [];
    }
    else
    {
      var uvc = lines[i].split(' ').map(Number);
      addEdge( uvc[0], uvc[1], uvc[2] );
    }
  }

  console.log( maxFlow( 0, V-1 ) );
});

function addEdge( from, to, cap )
{
  G[from].push( { to: to, cap: cap, rev: G[to].length } );
  G[to].push( { to: from, cap: 0, rev: G[from].length-1 } );
}

var used;

function dfs( v, t, f )
{
  if( v == t )
    return f;

  used[v] = true;

  for( var i = 0; i < G[v].length; ++i )
  {
    var e = G[v][i];
    if( !used[e.to] && e.cap > 0 )
    {
      var resF = dfs( e.to, t, Math.min( f, e.cap ) );

      if( resF > 0 )
      {
        e.cap -= resF;
        G[e.to][e.rev].cap += resF;

        return resF;
      }
    }
  }

  return 0;
}

function maxFlow( s, t )
{
  var f = 0;

  while( true )
  {
    used = new Array(V).fill(false);

    var resF = dfs( s, t, Number.POSITIVE_INFINITY );

    f += resF;

    if( resF == 0 )
      break;
  }

  return f;
}
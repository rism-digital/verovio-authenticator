const cookieSession = require( 'cookie-session' );
const express = require( 'express' );
const axios = require( 'axios' );

// This is the client ID and client secret that you obtained
// while registering the application
const clientID = `${ process.env.CLIENT_ID }`;
const clientSecret = `${ process.env.CLIENT_SECRET }`;

// Create a new express application
const app = express();

app.set( 'trust proxy', 1 ); // trust first proxy

app.use( cookieSession( {
    name: 'ghtoken',
    httpOnly: false,
    keys: ['key1', 'key2']
} ) );

app.get( '/oauth/redirect', ( req, res ) =>
{
    // The req.query object has the query params that
    // were sent to this route. We want the `code` param
    const requestToken = req.query.code

    axios( {
        // make a POST request
        method: 'post',
        // to the Github authentication API, with the client ID, client secret and request token
        url: `https://github.com/login/oauth/access_token?client_id=${ clientID }&client_secret=${ clientSecret }&code=${ requestToken }`,
        // Set the content type header, so that we get the response in JSOn
        headers: {
            accept: 'application/json'
        }
    } ).then( ( response ) =>
    {
        // Once we get the response, extract the access token from the response body
        const accessToken = response.data.access_token
        req.session.ghtoken = `${ accessToken }`;
        // redirect the user to the index page
        res.redirect( `/index.html?login=true` )
    } )
} );

app.get( '/oauth/logout', ( req, res ) =>
{
    req.session = null;
    // redirect the user to the index page
    res.redirect( `/index.html?login=false` )
} );

// Start the server on port 8081
app.listen( 8087 );

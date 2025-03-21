'use strict'

//includes
const Hapi = require('@hapi/hapi'); //require hapi
const mongoose = require('mongoose'); //Imports Mongoose library 
const Jwt = require('@hapi/jwt')//JWT auth
require('dotenv').config(); //Get environment variables from the .env file

const AuthRoutes = require('./routes/auth.route');
const ReviewRoutes = require('./routes/review.route');

const init = async () => {

    // Creates a new Hapi server instance with CORS enabled
    const server = Hapi.server({
        port: process.env.PORT || 5000,
        host: '0.0.0.0', 
        routes: {
            cors: {
                origin: ['*'], // Allow all origins.
                headers: ['Accept', 'Content-Type', 'Authorization'], //allow authorization
                credentials: false
            }
        },
        
    });

    //register JWT plugin
    await server.register(Jwt);

    //define JWT-auth
    server.auth.strategy('jwt', 'jwt', {
        keys: process.env.JWT_SECRET, 
        verify: { 
            aud: false, 
            iss: false, 
            sub: false,
            maxAgeSec: 3600 
        },
        validate: (artifacts, request, h) => {
            return { isValid: true, credentials: { id: artifacts.decoded.payload.id } };
        }
    });


    //Connect to MongoDB database
    mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB database');
    }).catch((error) => {
        console.error('Couldn´t connect to MongoDB', error);
    });

    //Routes
    server.route(AuthRoutes);
    server.route(ReviewRoutes);

    //starting server
    await server.start();
    console.log('Server is running on: ', server.info.uri);

};

process.on('unhandledRejection', (err) => {

    console.log(err);
    process.exit(1);
});

//Call the init function to start the server
init(); 
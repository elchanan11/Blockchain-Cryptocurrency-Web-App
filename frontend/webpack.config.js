const Dotenv = require('dotenv-webpack');
module.exports = {
    // other webpack configuration
    plugins: [
        new Dotenv({
            path: '../../.env', // path to the root directory where the .env file is located
        }),
    ],
};

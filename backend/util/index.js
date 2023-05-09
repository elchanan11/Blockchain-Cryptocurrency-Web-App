// Importing necessary libraries and functions
const cryptoHash = require('./cryptoHash')
const EC = require('elliptic').ec

// Creating an instance of the elliptic curve class with the secp256k1 curve
const ec = new EC('secp256k1')

// Function to verify the digital signature
const verifySignature = ({ publicKey, data, signature }) => {
    // Getting the key from the public key in hexadecimal format
    const keyFromPublic = ec.keyFromPublic(publicKey, 'hex')

    // Verifying the signature with the public key and the hashed data
    return keyFromPublic.verify(cryptoHash(data), signature)
}

// Exporting the elliptic curve instance, verifySignature function, and cryptoHash function
module.exports = { ec , verifySignature, cryptoHash }

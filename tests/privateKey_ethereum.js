const rand = require('csprng');
const SHA3 = require('sha3');
const keccak_256 = require('js-sha3').keccak_256;
const secp256k1 = require('../lib/secp256k1');

// let r = rand(160, 36) // -> 'tq2pdxrblkbgp8vt8kbdpmzdh1w8bex'
// console.log(r);



// Private key: eff415edb6331f4f67bdb7f1ecc639da9bcc0550b100bb275c7b5b21ce3a7804
// Public key:  d6dd5241c03bf418b333c256057ee878c34975d6abda075d58e4b9780f4a8659fcc096b6ad763d8e5914f7daa0b7351398b1eb6458e95ac41a2711a0651f3fc6
// Address:     0x4206f95fc533483fae4687b86c1d0a0088e3cd48
const privKey = '0b3a6ffb0a3907d7c83d249c2a82c579af19c9370810be1cfbdb8d636ce7ca29';
const pubKey  = secp256k1.PublicKeyGenerate(privKey);
const address = new SHA3.SHA3Hash(256).update(Buffer.from(pubKey.uncompressed.substr(2), 'hex')).digest('hex');
console.log("pub", pubKey.uncompressed.substr(2));
console.log();
console.log('addr', address.substr(24));

// 8ce0db0b0359ffc5866ba61903cc2518c3675ef2cf380a7e54bde7ea20e6fa1ab45b7617346cd11b7610001ee6ae5b0155c41cad9527cbcdff44ec67848943a4
// 8ce0db0b0359ffc5866ba61903cc2518c3675ef2cf380a7e54bde7ea20e6fa1ab45b7617346cd11b7610001ee6ae5b0155c41cad9527cbcdff44ec67848943a4

// 5b073e9233944b5e729e46d618f0d8edf3d9c34a
// 5b073e9233944b5e729e46d618f0d8edf3d9c34a

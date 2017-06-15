const { randomBytes } = require('crypto')
const secp256k1 = require('secp256k1')
// or require('secp256k1/elliptic')
//   if you want to use pure js implementation in node

// generate message to sign
const msg = randomBytes(32);

let privKey = Buffer.from("A0DC65FFCA799873CBEA0AC274015B9526505DAAAED385155425F7337704883E", 'hex')
console.log("privKey", privKey);
console.log("privKey.length", privKey.length);
// get the public key in a compressed format
const pubKey = secp256k1.publicKeyCreate(privKey)
console.log("public key", pubKey.toString('hex'));
// sign the message
const sigObj = secp256k1.sign(msg, privKey)

// verify the signature
console.log(secp256k1.verify(msg, sigObj.signature, pubKey))
// => true

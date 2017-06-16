const crypto    = require('crypto');
const RIPEMD160 = require('ripemd160');
const bigInt    = require("big-integer");
const secp256k1 = require('../lib/secp256k1');
const bs58check = require('bs58check');

// const privKey = bigInt("A0DC65FFCA799873CBEA0AC274015B9526505DAAAED385155425F7337704883E", 16)
const privKey = bigInt("18E14A7B6A307F426A94F8114701E7C8E774E7F9A47E2C2035DB29A206321725", 16);

// Step 1 - create public key:
let publicKey = secp256k1.PublicKeyGenerate(privKey);

console.log("step1) publicKey Uncompressed - ", publicKey.uncompressed);
// 0450863ad64a87ae8a2fe83c1af1a8403cb53f53e486d8511dad8a04887e5b23522cd470243453a299fa9e77237716103abc11a1df38855ed6f2ee187e9c582ba6

// step 2 - Perform SHA-256 hashing on the public key
let firstSha256 = sha256(publicKey.uncompressed);
console.log("step2) sha256                 - ", firstSha256);
// 600ffe422b4e00731a59557a5cca46cc183944191006324a447bdb2d98d4b408


// step 3 - Perform RIPEMD-160 hashing on the result of SHA-256
let firstRipemd160 = ripemd160(firstSha256);
console.log("Step3) ripemd160              - ", firstRipemd160);
// 010966776006953D5567439E5E39F86A0D273BEE

// step 4 - Add a version byte
let versionByte = "00" + firstRipemd160;
console.log("Step4) version byte           - ", versionByte);
// 00010966776006953D5567439E5E39F86A0D273BEE

// step 5-6 - perform a doubleSha256 (this is a checksum)
let secondThirdSha256 = doubleSha256(versionByte);
console.log("Step56) doubleSha256          - ", secondThirdSha256);
// D61967F63C7DD183914A4AE452C9F6AD5D462CE3D277798075B107615C1A8A30

// step 7-8 - take the first 4 bytes from secondThirdSha256 and add
// to the end of the ripemd160
let secondRipemd160 = firstRipemd160 + secondThirdSha256.slice(0,8);
console.log("Step78) secondRipemd160       - ", secondRipemd160);
// 00010966776006953D5567439E5E39F86A0D273BEED61967F6

// step 9 - convert the elongated ripemd160 to a base58check encoding
let address = base58checkEncode(secondRipemd160);
console.log("Step9) address                - ", address);
// csU3KSAQMEYLPudM8UWJVxFfptcZSDvXF1LYM
// 16UwLL9Risc3QfPqBUvKofHmBQ7wMtjvM


function base58checkEncode(payload) {
  if (typeof payload === 'string')
    payload = Buffer.from(payload, 'hex');

  return bs58check.encode(payload);
}

function base58checkDecode(address) {
  return bs58check.decode(address, 'hex');
}

function doubleSha256(secret) {
  if (typeof secret === 'string')
    secret = Buffer.from(secret, 'hex');

  const hash = crypto.createHash('sha256')
                     .update(secret)
                     .digest('hex');
  return crypto.createHash('sha256')
               .update(Buffer.from(hash, 'hex'))
               .digest('hex');
}

// 0450863AD64A87AE8A2FE83C1AF1A8403CB53F53E486D8511DAD8A04887E5B23522CD470243453A299FA9E77237716103ABC11A1DF38855ED6F2EE187E9C582BA6


function sha256(secret) {
  if (typeof secret === 'string')
    secret = Buffer.from(secret, 'hex');

  return crypto.createHash('sha256')
               .update(secret)
               .digest('hex');
}

function ripemd160(secret) {
  if (typeof secret === 'string')
    secret = Buffer.from(secret, 'hex');

  return new RIPEMD160().update(secret)
                      .digest('hex');
}

const crypto    = require('crypto');
const RIPEMD160 = require('ripemd160');
const bigInt    = require("big-integer");
const secp256k1 = require('../lib/secp256k1');
const bs58check = require('bs58check');
const bs58      = require('bs58');

const test      = require('tape');

const privKey   = bigInt("18E14A7B6A307F426A94F8114701E7C8E774E7F9A47E2C2035DB29A206321725", 16);

// NOTICE
// steps 5-9 can be done with base58check;
// https://en.bitcoin.it/wiki/Technical_background_of_version_1_Bitcoin_addresses
test('Create a bitcoin address to prove authenticity of code', function (t) {
    t.plan(7);

    // Step 1 - create public key:
    let publicKey = secp256k1.PublicKeyGenerate(privKey);
    t.equal(publicKey.uncompressed, '0450863ad64a87ae8a2fe83c1af1a8403cb53f53e486d8511dad8a04887e5b23522cd470243453a299fa9e77237716103abc11a1df38855ed6f2ee187e9c582ba6', "step1) publicKey Uncompressed");

    // step 2 - Perform SHA-256 hashing on the public key
    let firstSha256 = sha256(publicKey.uncompressed);
    t.equal(firstSha256, "600ffe422b4e00731a59557a5cca46cc183944191006324a447bdb2d98d4b408", "step2) sha256");

    // step 3 - Perform RIPEMD-160 hashing on the result of SHA-256
    let firstRipemd160 = ripemd160(firstSha256);
    t.equal(firstRipemd160.toUpperCase(), "010966776006953D5567439E5E39F86A0D273BEE", "Step3) ripemd160");

    // step 4 - Add a version byte
    let versionByte = "00" + firstRipemd160;
    t.equal(versionByte.toUpperCase(), "00010966776006953D5567439E5E39F86A0D273BEE", "Step4) version byte");

    // step 5-6 - perform a doubleSha256 (this is a checksum)
    let secondThirdSha256 = doubleSha256(versionByte);
    t.equal(secondThirdSha256.toUpperCase(), "D61967F63C7DD183914A4AE452C9F6AD5D462CE3D277798075B107615C1A8A30", "Step56) doubleSha256");

    // step 7-8 - take the first 4 bytes from secondThirdSha256 and add
    // to the end of the ripemd160
    let secondRipemd160 = versionByte + secondThirdSha256.slice(0,8);
    t.equal(secondRipemd160.toUpperCase(), "00010966776006953D5567439E5E39F86A0D273BEED61967F6", "Step78) secondRipemd160");

    // step 9 - convert the elongated ripemd160 to a base58check encoding
    let address = base58Encode(secondRipemd160);
    t.equal(address, "16UwLL9Risc3QfPqBUvKofHmBQ7wMtjvM", "Step9) address");
});


function base58checkEncode(payload) {
  if (typeof payload === 'string')
    payload = Buffer.from(payload, 'hex');

  return bs58check.encode(payload);
}

function base58Encode(payload) {
  if (typeof payload === 'string')
    payload = Buffer.from(payload, 'hex');

  return bs58.encode(payload);
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

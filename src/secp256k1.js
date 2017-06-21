// @flow
/*************************************************************************************************************************************************************************
  * This implementation is for educaitonal purposes only
  * and should not be used in production for obvious reasons.
  * If you would like to contribute, you are more than welcome to.
  *
  * const GcompressedLE   = bigInt("79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798", 16);
  * const GunCompressedLE = bigInt("79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8", 16);
  *
  * Actual curve: y^2 = x^3 + Acurve * x + Bcurve
  *
  ************************************************************************************************************************************************************************/

const crypto      = require('crypto');
const RIPEMD160   = require('ripemd160');
const base58check = require('base58check')
const bigInt      = require("big-integer");

// Pcurve = 2**256 - 2**32 - 2**9 - 2**8 - 2**7 - 2**6 - 2**4 -1, 10;
const Pcurve = bigInt("115792089237316195423570985008687907853269984665640564039457584007908834671663"); // The proven prime
const N      = bigInt("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141", 16); // Number of points in the field
const Acurve = 0; // These two are defined on the elliptic curve. y^2 = x^3 + Acurve * x + Bcurve
const Bcurve = 7; // These two are defined on the elliptic curve. y^2 = x^3 + Acurve * x + Bcurve
const Gx     = bigInt("55066263022277343669578718895168534326250603453777594175500187360389116729240");
const Gy     = bigInt("32670510020758816978083085130507043184471273380659243275938904335757337482424");
const GPoint = [Gx, Gy]; // This is our generator point. Trillions of dif ones possible

// Individual Transaction/Personal Information
const privKey           = bigInt("A0DC65FFCA799873CBEA0AC274015B9526505DAAAED385155425F7337704883E", 16) // replace with any private key
const RandNum           = bigInt("28695618543805844332113829720373285210420739438570883203839696518176414791234") // replace with a truly random number
const HashOfThingToSign = bigInt("86032112319101611046176971828093669637772856272773459297323797145286374828050") // the hash of your message/transaction


function modulo(n: bigInt, m: bigInt): bigInt {
  return n.mod(m).add(m).mod(m);
}

function zfill(s: string): string {
  while (s.length < 64) {
    s = "0" + s;
  }
  return s;
}

function modInv(a: bigInt, n: bigInt = Pcurve): bigInt {
  let lm   = bigInt(1),
      hm   = bigInt(0),
      high = n,
      low = modulo(a, n);

  while (low.gt(1)) {
    let ratio = high.divide(low),
        nm    = hm.minus( ratio.times(lm) ),
        newm  = high.minus( ratio.times(low) );

    hm   = lm;
    lm   = nm;
    high = low;
    low  = newm;
  }

  return modulo(lm, n);
}

function ECadd(a: Array<bigInt>, b: Array<bigInt>): bigInt {
  const LamAdd = modulo(b[1].minus(a[1]).times( modInv( b[0].minus(a[0]) ) ), Pcurve);
  const x      = modulo(LamAdd.times(LamAdd).minus(a[0]).minus(b[0]), Pcurve);
  const y      = modulo(LamAdd.times( a[0].minus(x) ).minus(a[1]), Pcurve);

  return [x, y];
}

function ECdouble(a: Array<bigInt>) {
  const Lam = modulo(a[0].times(a[0]).times(3).add(Acurve).times( modInv( a[1].times(2) ) ), Pcurve);
  const x   = modulo(Lam.times(Lam).minus(a[0].times(2)), Pcurve);
  const y   = modulo(Lam.times( a[0].minus(x) ).minus(a[1]), Pcurve);

  return [x, y];
}

function ECmultiply(GenPoint: Array<bigInt>, ScalarHex: bigInt): bigInt {
  if (ScalarHex.eq(0) || ScalarHex.greaterOrEquals(N)) throw "Invalid Scalar/Private Key";

  const ScalarBinary = ScalarHex.toString(2);
  let   Q            = GenPoint;

  for (let i = 1; i < ScalarBinary.length; i++) {
    Q = ECdouble(Q);

    if (ScalarBinary[i] === "1") {
      Q = ECadd(Q, GenPoint);
    }
  }

  return Q;
}

function generateSignature(message: string | bigInt, privKey: string | bigInt): Array<bigInt> {
  // Ensure proper format
  if (typeof message === 'string')
    message = bigInt(message, 16);
  if (typeof privKey === 'string')
    privKey = bigInt(privKey, 16);

  // Create a random number
  let RandNum = bigInt(crypto.randomBytes(255));
  let RandSignPoint = ECmultiply(GPoint, RandNum);

  let r = modulo(RandSignPoint[0], N);

  let signature = modulo(message.add( r.times(privKey) ).times(modInv(RandNum, N)), N);

  return r.toString(16) + signature.toString(16);
}

function verifySignature(message: string | bigInt, PublicKey: string | bigInt, signature: string): bool {
  if (typeof message === 'string')
    message = bigInt(message, 16);
  if (typeof PublicKey === 'string')
    PublicKey = bigInt(PublicKey, 16);

  const r = bigInt(signature.substr(0, 32));
  const s = bigInt(signature.substr(32, 64));

  let w = modInv(s, N);

  let u1 = ECmultiply( GPoint, modulo(message.times(w), N) );
  let u2 = ECmultiply( PublicKey, modulo(r.times(w), N) )

  let validation = ECadd(u1, u2);
  let validationX = validation[0];

  return validationX.eq(r);
}

// uncompressed is the accumulation of both the x and y points
// compressed is the public key to share in transactions
// address is the public address tho whom someone can send coin
interface Key {
  uncompressed: bigInt,
  compressed: bigInt
}
function PublicKeyGenerate(PrivateKey: string | number | bigInt): Key {
  if (typeof PrivateKey === 'number')
    PrivateKey = bigInt(PrivateKey);
  if (typeof PrivateKey === 'string')
    PrivateKey = bigInt(PrivateKey, 16);

  let PublicKey = ECmultiply(GPoint, PrivateKey);
  let Px = zfill(PublicKey[0].toString(16));
  let Py = zfill(PublicKey[1].toString(16));

  let uncompressed = "04" + Px + Py;
  let compressed   = (modulo(PublicKey[1], 2).eq(1))
                        ? "03" + Px
                        : "02" + Px;

  return { uncompressed, compressed };
}

function sha256(secret: string | Buffer): string {
  if (typeof secret === 'string')
    secret = Buffer.from(secret, 'hex');

  return crypto.createHash('sha256')
               .update(secret)
               .digest('hex');
}

function doubleSha256(secret: string | Buffer): string {
  if (typeof secret === 'string')
    secret = Buffer.from(secret, 'hex');

  const hash = crypto.createHash('sha256')
                     .update(secret)
                     .digest('hex');
  return crypto.createHash('sha256')
               .update(Buffer.from(hash, 'hex'))
               .digest('hex');
}

function ripemd160(secret: string | Buffer): string {
  if (typeof secret === 'string')
    secret = Buffer.from(secret, 'hex');

  return new RIPEMD160().update(secret)
                      .digest('hex');
}

module.exports = {
  PublicKeyGenerate,
  verifySignature,
  generateSignature
};

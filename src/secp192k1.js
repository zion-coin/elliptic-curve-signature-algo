/** This implementation is for educaitonal purposes only
  * and should not be used in production for obvious reasons.
  * If you would like to contribute, you are more than welcome to.
  *
  * const GcompressedLE   = bigInt("DB4FF10EC057E9AE26B07D0280B7F4341DA5D1B1EAE06C7D", 16); [LE]
  * const GunCompressedLE = bigInt("DB4FF10EC057E9AE26B07D0280B7F4341DA5D1B1EAE06C7D9B2F2F6D9C5628A7844163D015BE86344082AA88D95E2F9D", 16); [LE]
  *
  * Actual curve: y^2 = x^3 + Acurve * x + Bcurve
  *
  **/

const bigInt = require("big-integer");

// Pcurve = 2**192 - 2**32 - 2**12 - 2**8 - 2**7 - 2**6 - 2**3 - 1 OR FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFE FFFFEE37
const Pcurve = bigInt("6277101735386680763835789423207666416102355444459739541047"); // The proven prime
const N      = bigInt("FFFFFFFFFFFFFFFFFFFFFFFE26F2FC170F69466A74DEFD8D", 16); // Number of points in the field
const Acurve = 0; // These two are defined on the elliptic curve. y^2 = x^3 + Acurve * x + Bcurve
const Bcurve = 3; // These two are defined on the elliptic curve. y^2 = x^3 + Acurve * x + Bcurve
const Gx     = bigInt("DB4FF10EC057E9AE26B07D0280B7F4341DA5D1B1EAE06C7D", 16);
const Gy     = bigInt("9B2F2F6D9C5628A7844163D015BE86344082AA88D95E2F9D", 16);
const GPoint = [Gx, Gy]; // This is our generator point. Trillions of dif ones possible

// Individual Transaction/Personal Information
const privKey           = bigInt("A0DC65FFCA799873CBEA0AC274015B9526505DAAAED38515", 16); // replace with any private key
const RandNum           = bigInt("286956185438058443321138297203732852104207394385"); // replace with a truly random number
const HashOfThingToSign = bigInt("860321123191016110461769718280936696377728562727"); // the hash of your message/transaction


function modulo(n: bigInt, m: bigInt) {
  return n.mod(m).add(m).mod(m);
}

function zfill(s: string) {
  while (s.length < 48) {
    s = "0" + s;
  }
  return s;
}

function modInv(a: bigInt, n: bigInt = Pcurve) {
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

function ECadd(a: Array<bigInt>, b: Array<bigInt>) {
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

function ECmultiply(GenPoint: Array<bigInt>, ScalarHex: bigInt) {
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

// uncompressed is the accumulation of both the x and y points
// compressed is the public key to share in transactions
// address is the public address tho whom someone can send coin
function PublicKeyGenerate(PrivateKey: string | number | bigInt) {
  if (typeof PrivateKey === 'number')
    PrivateKey = bigInt(PrivateKey);
  if (typeof PrivateKey === 'string')
    PrivateKey = bigInt(PrivateKey, 16);

  let PublicKey = ECmultiply(GPoint, privKey);
  let Px = zfill(PublicKey[0].toString(16));
  let Py = zfill(PublicKey[1].toString(16));

  let uncompressed = PublicKey[0].toString(16) + PublicKey[1].toString(16);
  let compressed   = "04" + Px + Py;
  let address      = (modulo(PublicKey[1], 2).eq(1))
                        ? "03" + Px
                        : "02" + Px;

  return { uncompressed, compressed, address };
}

console.log();
console.log("******* Public Key Generation *********");
console.log();
let PublicKey = ECmultiply(GPoint, privKey);
let Px = zfill(PublicKey[0].toString(16));
let Py = zfill(PublicKey[1].toString(16));
console.log("the private key:")
console.log( bigInt(privKey, 16).toString(10) + " (DECIMAL)" );
console.log();
console.log("the uncompressed public key (NOT ADDRESS):");
console.log(PublicKey[0].toString(16) + PublicKey[1].toString(16));
console.log();
console.log("the uncompressed public key (HEX):");
console.log("04" + Px + Py);
console.log();
console.log("the official Public Key (Address) - compressed:");

if (modulo(PublicKey[1], 2).eq(1)) {
  console.log("03" + Px);
} else {
  console.log("02" + Px);
}

console.log();
console.log("******* Signature Generation *********");
let RandSignPoint = ECmultiply(GPoint, RandNum);
let Sx = zfill(RandSignPoint[0].toString(16));
let Sy = zfill(RandSignPoint[1].toString(16));

let r = modulo(RandSignPoint[0], N);
console.log("R", r.toString());

let s = modulo(HashOfThingToSign.add( r.times(privKey) ).times(modInv(RandNum, N)), N);
console.log("S", s.toString());
// s = ((HashOfThingToSign + r*privKey)*(modinv(RandNum,N))) % N; print "s =", s

console.log();
console.log("******* Signature Verification *********");

let w = modInv(s, N);
console.log("w", w.toString());

let u1  = ECmultiply( GPoint, modulo(HashOfThingToSign.times(w), N) );
let u1x = u1[0];
let u1y = u1[1];

let u2 = ECmultiply( PublicKey, modulo(r.times(w), N) )
let u2x = u2[0];
let u2y = u2[1];

let validation = ECadd(u1, u2);
let validationX = validation[0];

console.log("Signature Verified", validationX.eq(r));

module.exports = { PublicKeyGenerate };

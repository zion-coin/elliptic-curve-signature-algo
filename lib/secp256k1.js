/** This implementation is for educaitonal purposes only
  * and should not be used in production for obvious reasons.
  * If you would like to contribute, you are more than welcome to.
  *
  * const GcompressedLE   = bigInt("79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798", 16);
  * const GunCompressedLE = bigInt("79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8", 16);
  *
  * Actual curve: y^2 = x^3 + Acurve * x + Bcurve
  *
  **/

const bigInt = require("big-integer");

// Pcurve = 2**256 - 2**32 - 2**9 - 2**8 - 2**7 - 2**6 - 2**4 -1, 10;
const Pcurve = bigInt("115792089237316195423570985008687907853269984665640564039457584007908834671663"); // The proven prime
const N = bigInt("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141", 16); // Number of points in the field
const Acurve = 0; // These two defines the elliptic curve.
const Bcurve = 7; // y^2 = x^3 + Acurve * x + Bcurve
const Gx = bigInt("55066263022277343669578718895168534326250603453777594175500187360389116729240");
const Gy = bigInt("32670510020758816978083085130507043184471273380659243275938904335757337482424");
const GPoint = [Gx, Gy]; // This is our generator point. Trillions of dif ones possible

// Individual Transaction/Personal Information
const privKey = bigInt("A0DC65FFCA799873CBEA0AC274015B9526505DAAAED385155425F7337704883E", 16 // replace with any private key
);const RandNum = bigInt("28695618543805844332113829720373285210420739438570883203839696518176414791234" // replace with a truly random number
);const HashOfThingToSign = bigInt("86032112319101611046176971828093669637772856272773459297323797145286374828050" // the hash of your message/transaction


);function modulo(n, m) {
  return n.mod(m).add(m).mod(m);
}

function modInv(a, n = Pcurve) {
  let lm = bigInt(1),
      hm = bigInt(0),
      high = n,
      low = modulo(a, n);

  while (low.gt(1)) {
    let ratio = high.divide(low),
        nm = hm.minus(ratio.times(lm)),
        newm = high.minus(ratio.times(low));

    hm = lm;
    lm = nm;
    high = low;
    low = newm;
  }

  return modulo(lm, n);
}

function ECadd(a, b) {
  const LamAdd = modulo(b[1].minus(a[1]).times(modInv(b[0].minus(a[0]))), Pcurve);
  const x = modulo(LamAdd.times(LamAdd).minus(a[0]).minus(b[0]), Pcurve);
  const y = modulo(LamAdd.times(a[0].minus(x)).minus(a[1]), Pcurve);

  return [x, y];
}

function ECdouble(a) {
  const Lam = modulo(a[0].times(a[0]).times(3).add(Acurve).times(modInv(a[1].times(2))), Pcurve);
  const x = modulo(Lam.times(Lam).minus(a[0].times(2)), Pcurve);
  const y = modulo(Lam.times(a[0].minus(x)).minus(a[1]), Pcurve);

  return [x, y];
}

function ECmultiply(GenPoint, ScalarHex) {
  if (ScalarHex.eq(0) || ScalarHex.greaterOrEquals(N)) throw "Invalid Scalar/Private Key";

  const ScalarBinary = ScalarHex.toString(2);
  let Q = GenPoint;

  for (let i = 1; i < ScalarBinary.length; i++) {
    Q = ECdouble(Q);

    if (ScalarBinary[i] === "1") {
      Q = ECadd(Q, GenPoint);
    }
  }

  return Q;
}

function zfill(s) {
  while (s.length < 64) {
    s = "0" + s;
  }
  return s;
}

function verify() {}

// uncompressed is the accumulation of both the x and y points
// compressed is the public key to share in transactions
// address is the public address tho whom someone can send coin
function PublicKeyGenerate(PrivateKey) {
  if (typeof PrivateKey === 'number') PrivateKey = bigInt(PrivateKey);
  if (typeof PrivateKey === 'string') PrivateKey = bigInt(PrivateKey, 16);

  let PublicKey = ECmultiply(GPoint, privKey);
  let Px = zfill(PublicKey[0].toString(16));

  let uncompressed = PublicKey[0].toString(16) + PublicKey[1].toString(16);
  let compressed = "04" + Px + Py;
  let address = modulo(PublicKey[1], 2).eq(1) ? "03" + Px : "02" + Px;

  return uncompressed, compressed, address;
}

function PublicAddressGenerate(PrivateKey) {
  if (typeof PrivateKey === 'number') PrivateKey = bigInt(PrivateKey);
  if (typeof PrivateKey === 'string') PrivateKey = bigInt(PrivateKey, 16);

  let PublicKey = ECmultiply(GPoint, privKey);
  let Px = zfill(PublicKey[0].toString(16));

  if (modulo(PublicKey[1], 2).eq(1)) {
    return "03" + Px;
  } else {
    return "02" + Px;
  }
}

console.log();
console.log("******* Public Key Generation *********");
console.log();
let PublicKey = ECmultiply(GPoint, privKey);
let Px = zfill(PublicKey[0].toString(16));
let Py = zfill(PublicKey[1].toString(16));
console.log("the private key:");
console.log(bigInt(privKey, 16).toString(10) + " (DECIMAL)");
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

let s = modulo(HashOfThingToSign.add(r.times(privKey)).times(modInv(RandNum, N)), N);
console.log("S", s.toString());
// s = ((HashOfThingToSign + r*privKey)*(modinv(RandNum,N))) % N; print "s =", s

console.log();
console.log("******* Signature Verification *********");

let w = modInv(s, N);
console.log("w", w.toString());

let u1 = ECmultiply(GPoint, modulo(HashOfThingToSign.times(w), N));
let u1x = u1[0];
let u1y = u1[1];

let u2 = ECmultiply(PublicKey, modulo(r.times(w), N));
let u2x = u2[0];
let u2y = u2[1];

let validation = ECadd(u1, u2);
let validationX = validation[0];

console.log("Signature Verified", validationX.eq(r));
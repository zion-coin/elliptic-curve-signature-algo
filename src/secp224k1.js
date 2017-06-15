/** This implementation is for educaitonal purposes only
  * and should not be used in production for obvious reasons.
  * If you would like to contribute, you are more than welcome to.
  *
  * const GcompressedLE   = bigInt("A1455B334DF099DF30FC28A169A467E9E47075A90F7E650EB6B7A45C", 16);
  * const GunCompressedLE = bigInt("A1455B334DF099DF30FC28A169A467E9E47075A90F7E650EB6B7A45C7E089FED7FBA344282CAFBD6F7E319F7C0B0BD59E2CA4BDB556D61A5", 16);
  *
  * Actual curve: y^2 = x^3 + Acurve * x + Bcurve
  *
  **/

const bigInt = require("big-integer");

// Pcurve = 2**224 - 2**32 - 2**12 - 2**11 - 2**9 - 2**7 - 2**4 - 2**1 - 1 OR FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFE FFFFE56D
const Pcurve = bigInt("26959946667150639794667015087019630673637144422540572481099315275117"); // The proven prime
const N      = bigInt("0000000000000000000000000001DCE8D2EC6184CAF0A971769FB1F7", 16); // Number of points in the field
const Acurve = 0; // These two defines the elliptic curve. y^2 = x^3 + Acurve * x + Bcurve
const Bcurve = 5; // These two defines the elliptic curve. y^2 = x^3 + Acurve * x + Bcurve
const Gx     = bigInt("A1455B334DF099DF30FC28A169A467E9E47075A90F7E650EB6B7A45C", 16);
const Gy     = bigInt("7E089FED7FBA344282CAFBD6F7E319F7C0B0BD59E2CA4BDB556D61A5", 16);
const GPoint = [Gx, Gy]; // This is our generator point. Trillions of dif ones possible

// Individual Transaction/Personal Information
const privKey           = bigInt("00000000000000000000000000015B9526505DAAAED38515AAAED385", 16); // replace with any private key
const RandNum           = bigInt("00000000000000000000000000019373285210420739438520739434"); // replace with a truly random number
const HashOfThingToSign = bigInt("86032112319101611046176971828093669637772856272766963803"); // the hash of your message/transaction


function modulo(n: bigInt, m: bigInt) {
  return n.mod(m).add(m).mod(m);
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

function zfill(s: string) {
  while (s.length < 56) {
    s = "0" + s;
  }
  return s;
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

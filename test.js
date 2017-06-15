const bigInt = require("big-integer");
const Pcurve = bigInt("115792089237316195423570985008687907853269984665640564039457584007908834671663"); // The proven prime
const N      = bigInt("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141", 16); // Number of points in the field
const Acurve = 0; // These two defines the elliptic curve.
const Bcurve = 7; // y^2 = x^3 + Acurve * x + Bcurve
const Gx     = bigInt("55066263022277343669578718895168534326250603453777594175500187360389116729240");
const Gy     = bigInt("32670510020758816978083085130507043184471273380659243275938904335757337482424");
const GPoint = [Gx, Gy]; // This is our generator point. Trillions of dif ones possible

//
// const Pcurve = bigInt(2**256 - 2**32 - 2**9 - 2**8 - 2**7 - 2**6 - 2**4 -1, 10); // The proven prime
// const N      = bigInt("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141", 16); // Number of points in the field
// const Acurve = 0; // These two defines the elliptic curve.
// const Bcurve = 7; // y^2 = x^3 + Acurve * x + Bcurve
// const Gx = bigInt(55066263022277343669578718895168534326250603453777594175500187360389116729240);
// const Gy = bigInt(32670510020758816978083085130507043184471273380659243275938904335757337482424);
// const GPoint = [Gx, Gy]; // This is our generator point. Trillions of dif ones possible
//
// // Individual Transaction/Personal Information
// const privKey = "A0DC65FFCA799873CBEA0AC274015B9526505DAAAED385155425F7337704883E" // replace with any private key
//
//
// let ScalarHex = bigInt(privKey, 16);
// console.log("ScalarHex", ScalarHex);
// console.log("privKey.substr(4)", parseInt(privKey, 16).toString(2))
// const ScalarBinary = bigInt(privKey, 16).toString(2);
//
// console.log("ScalarBinary", ScalarBinary);
// console.log("ScalarBinaryLength", ScalarBinary.length);
//
//
//
// function Hex2Bin(n){
//   if(!checkHex(n)) return 0;
//   return parseInt(n,16).toString(2);
// }
// const x = bigInt(4);
// let y = x.times(5).minus(2);
// console.log(y);
// function modInv(a) {
//   let t    = bigInt(0),
//       newt = bigInt(1),
//       r    = Pcurve,
//       newr = a;
//   while (!newr.eq(0)) {
//     let quotient = r.divide(newr);
//
//     t        = newt;
//     newt     = t.minus( quotient.times(newt) );
//     r        = newr;
//     newr     = r.minus( quotient.times(newr) );
//     console.log("newr", newr.toString(10))
//   }
//
//   if (r.gt(1)) throw "not convertable"
//   if (t.lt(0))
//     t = t.plus(Pcurve);
//
//   return t;
// }

// function modInv(a) {
//   let lm   = bigInt(1),
//       hm   = bigInt(0),
//       high = Pcurve,
//       low;
//   if (a.geq(0))
//     low  = a.mod(Pcurve);
//   else
//     low = Pcurve.minus(a);
//   while (low.gt(1)) {
//     console.log("low", low.toString(10));
//     let ratio = high.divide(low),
//         nm    = hm.minus( ratio.times(lm) ),
//         newm  = high.minus( ratio.times(low) );
//
//     hm   = lm;
//     lm   = nm;
//     high = low;
//     low  = newm;
//     console.log("ratio", ratio.toString(10));
//     console.log("lm", lm.toString(10));
//     console.log("low", low.toString(10));
//     console.log("hm", hm.toString(10));
//     console.log("high", high.toString(10));
//   }
//
//   return lm.mod(Pcurve);
// }
//
// function ECadd(a, b) {
//   const LamAdd = b[1].minus(a[1]).times( modInv( b[0].minus(a[0]) ) ).mod(Pcurve);
//   const x      = LamAdd.times(LamAdd).minus(a[0]).minus(b[0]).mod(Pcurve);
//   const y      = LamAdd.times( a[0].minus(x) ).minus(a[1]).mod(Pcurve);
//
//   console.log("LamAdd");
//   console.log(LamAdd.toString(10));
//
//   return [x, y];
// }
//
//
// const a0 = bigInt("103388573995635080359749164254216598308788835304023601477803095234286494993683");
// const a1 = bigInt("37057141145242123013015316630864329550140216928701153669873286428255828810018");
// const b0 = bigInt("55066263022277343669578718895168534326250603453777594175500187360389116729240");
// const b1 = bigInt("32670510020758816978083085130507043184471273380659243275938904335757337482424");
// const b1a1 = bigInt("-4386631124483306034932231500357286365668943548041910393934382092498491327594");
//
// let LamAdd = b1.minus(a1);
// let bMa = b0.minus(a0);
// let mI = modInv( bMa );
// // let LamAdd = b1.minus(a1).times( modInv( b0.minus(a0) ) ).mod(Pcurve);
//
// // console.log("lamAdd", LamAdd.toString(10));
// console.log("bMa", bMa.toString(10));
// console.log("mI", mI.toString(10));
//
// // a
// // (103388573995635080359749164254216598308788835304023601477803095234286494993683L, 37057141145242123013015316630864329550140216928701153669873286428255828810018L)
// // b
// // (55066263022277343669578718895168534326250603453777594175500187360389116729240L, 32670510020758816978083085130507043184471273380659243275938904335757337482424L)
// // (b[1]-a[1])
// // -4386631124483306034932231500357286365668943548041910393934382092498491327594
// // (b[0]-a[0])
// // -48322310973357736690170445359048063982538231850246007302302907873897378264443
// // modinv(b[0]-a[0],Pcurve)
// // 105137230106821427605700623407056246816456425641028349624909559744443607050119
// // ((b[1]-a[1]) * modinv(b[0]-a[0],Pcurve))
// // -461198245928546176851964652751816536124254956392515762926708943060674300649625788648470597858019635950685642370084603044744219287472893112227878405683686
// // LamAdd
// // 59121598540203510885280288033682621711875835098106518416124985031240471747425


// function modulo (n, m) {
//   if (!m) return n;
//
//   console.log( n.mod(m).add(m).mod(m).toString() );
// }
//
// // modulo(bigInt(5), bigInt(17))
// let x = bigInt("-48322310973357736690170445359048063982538231850246007302302907873897378264443");
//
// modulo(x, Pcurve);

function modulo (n, m) {
  return n.mod(m).add(m).mod(m);
}

function modInv(a) {
  let lm   = bigInt(1),
      hm   = bigInt(0),
      high = Pcurve,
      low = modulo(a, Pcurve);

  console.log("BEGINNNNNNNNNNNNNNN")
  console.log("high", high.toString());
  console.log("low", low.toString());

  while (low.gt(1)) {
    let ratio = high.divide(low),
        nm    = hm.minus( ratio.times(lm) ),
        newm  = high.minus( ratio.times(low) );

    console.log("MIDDDDDDDDDDDDDDDD");
    console.log("ratio", ratio.toString());
    console.log("nm", nm.toString());
    console.log("newm", newm.toString());

    hm   = lm;
    lm   = nm;
    high = low;
    low  = newm;

    console.log("EEEEEENNNNNNNNDDDDDD");
    console.log("hm", hm.toString());
    console.log("lm", lm.toString());
    console.log("high", high.toString());
    console.log("low", low.toString());
  }

  return modulo(lm, Pcurve);
}

let x = modInv(bigInt("-48322310973357736690170445359048063982538231850246007302302907873897378264443"))


console.log("x", x.toString());

const SHA3 = require('sha3');
const secp256k1 = require('../lib/secp256k1');

// trickle politely broker sank duplex reflector crisped reunion surreal superman grumbly gloomy
// let seed = 'unbridle retaliate collide crinkly emblaze grating power degraded feline uncoiled salsa reliable';
let seed = 'this is sparta!';
let secret = new SHA3.SHA3Hash(256).update(seed).digest();

for (let i = 0; i < 16385; i++) {
  secret = new SHA3.SHA3Hash(256).update(secret).digest();
}

secret = new SHA3.SHA3Hash(256).update(secret).digest('hex');
let pub_key = secp256k1.PublicKeyGenerate(secret);
let address = new SHA3.SHA3Hash(256).update(Buffer.from(pub_key.uncompressed.substr(2), 'hex')).digest('hex').substr(24);

while(address.substr(0,2) !== '00') {
  secret = new SHA3.SHA3Hash(256).update(Buffer.from(secret, 'hex')).digest('hex');
  pub_key = secp256k1.PublicKeyGenerate(secret);
  address = new SHA3.SHA3Hash(256).update(Buffer.from(pub_key.uncompressed.substr(2), 'hex')).digest('hex').substr(24);
}
console.log("secret", secret);
console.log("public", pub_key);
console.log("address", toChecksumAddress('0x' + address));

function toChecksumAddress (_address) {
  const address = (_address || '').toLowerCase();

  const hash = new SHA3.SHA3Hash(256).update(address.slice(-40)).digest('hex');
  let result = '0x';

  for (let n = 0; n < 40; n++) {
    result = `${result}${parseInt(hash[n], 16) > 7 ? address[n + 2].toUpperCase() : address[n + 2]}`;
  }

  return result;
}
//
//
// // recovery phrase
// // unbridle retaliate collide crinkly emblaze grating power degraded feline uncoiled salsa reliable
// // address
// // 0x007a4768d2E1BF2cc60c4beB71fCeAc925D2F7A9
//
// // recovery phrase
// // this is sparta!
// //
// // secret
// // 0xe6fece0b5c28a2201c414d47e8bf5132443e5b8055cac302f00c1915c8651755
// //
// // public
// // 43eec71cafd8b1ed1a6ff9d72e108d490fcd1e8a8b3dbbf66eaf6976c3795df3e2f69c24b11dc46adc17bae70b665939a588d1bd836e7315d2f24fba13b57e11
// //
// // addr
// // 0x0049ee5cf6f2d2891717aa4a9d27e2d8fd93d293
// // 0x0049eE5cF6F2d2891717aa4A9d27E2D8fd93d293

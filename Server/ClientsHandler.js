let ITPpacket = require("./ITPResponse");
let singleton = require("./Singleton");
let net = require("net");

// You may need to add some delectation here

module.exports = {
  handleClientJoining: function (sock) {
    var clientAddr = `${sock.remoteAddress}:${sock.remotePort}`;
    let initialTime = singleton.getTimestamp();
    //
    //
    console.log(
      "Client-" + initialTime + " is connected at timestamp " + initialTime
    );

    sock.on("error", (err) => {
      console.log(err);
    });

    sock.on("data", (data) => {
      //receiving data converting buffer to array
      let header = data.toJSON().data.slice(0, 12);
      let body = data.toJSON().data.slice(12, data.toJSON().data.length);
      console.log("ITP packet received:");
      printPacketBit(data);

      let version = parseBitPacket(header, 0, 4);
      console.log(version);

      sock.write("Server Response");
      sock.pipe(sock);
    });

    sock.on("close", () => {
      console.log("connection closed");
    });
  },
};

//// Some usefull methods ////
// Feel free to use them, but DON NOT change or add any code in these methods.

// Returns the integer value of the extracted bits fragment for a given packet
function parseBitPacket(packet, offset, length) {
  let number = "";
  for (var i = 0; i < length; i++) {
    // let us get the actual byte position of the offset
    let bytePosition = Math.floor((offset + i) / 8);
    let bitPosition = 7 - ((offset + i) % 8);
    let bit = (packet[bytePosition] >> bitPosition) % 2;
    number = (number << 1) | bit;
  }
  return number;
}

// Prints the entire packet in bits format
function printPacketBit(packet) {
  var bitString = "";

  for (var i = 0; i < packet.length; i++) {
    // To add leading zeros
    var b = "00000000" + packet[i].toString(2);
    // To print 4 bytes per line
    if (i > 0 && i % 4 == 0) bitString += "\n";
    bitString += " " + b.substr(b.length - 8);
  }
  console.log(bitString);
}

// Converts byte array to string
function bytesToString(array) {
  var result = "";
  for (var i = 0; i < array.length; ++i) {
    result += String.fromCharCode(array[i]);
  }
  return result;
}

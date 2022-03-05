let ITPpacket = require("./ITPResponse");
let singleton = require("./Singleton");
let net = require("net");
let fs = require("fs");
const ITPResponse = require("./ITPResponse");

// You may need to add some delectation here

module.exports = {
  handleClientJoining: function (sock) {
    //client connected
    var clientAddr = `${sock.remoteAddress}:${sock.remotePort}`;
    let initialTime = singleton.getTimestamp();

    //log timestamp
    console.log(
      "Client-" + initialTime + " is connected at timestamp " + initialTime
    );

    sock.on("error", (err) => {
      console.log(err);
    });

    //on retrieving data
    sock.on("data", (data) => {
      //receiving data converting buffer to array and split into header and body
      let header = data.toJSON().data.slice(0, 12);
      let body = data.toJSON().data.slice(12, data.toJSON().data.length);
      console.log("ITP packet received:");
      printPacketBit(data);

      //retieve info from header and file name from body
      let version = parseBitPacket(header, 0, 4);
      let fileName = bytesToString(body);
      let clientTimeStamp = parseBitPacket(header, 32, 32);
      let reqType = "Query";
      let fileType = "";

      //finding image type
      switch (parseBitPacket(header, 64, 4)) {
        case 1:
          fileType = "bmp";
          break;
        case 2:
          fileType = "jpeg";
          break;
        case 3:
          fileType = "gif";
          break;
        case 4:
          fileType = "png";
          break;
        case 5:
          fileType = "tiff";
          break;
        case 15:
          fileType = "raw";
          break;
      }

      //logging info from header
      console.log(
        `Client-${initialTime} requests:\n\t--ITP Version: ${version}\n\t--Timestamp: ${clientTimeStamp}\n\t--Request type: ${reqType}\n\t--Image file extension: ${fileType}\n\t--Image file name: ${fileName}`
      );

      let foundCode = 3;

      let img = "";

      //checking for file
      if (fs.existsSync(`./images/${fileName}.${fileType}`)) {
        foundCode = 1;
        //reading data from file
        img = fs.readFileSync(`./images/${fileName}.${fileType}`);
      } else {
        foundCode = 2;
      }

      //get sequence and time stamp
      let seqNumber = singleton.getSequenceNumber();
      let timeStamp = singleton.getTimestamp();

      //create response packet
      ITPResponse.init(foundCode, seqNumber, timeStamp, img);

      //get response packet
      let packet = ITPResponse.getPacket();

      //send packet back to client
      sock.write(packet);
      sock.pipe(sock);
    });

    sock.on("close", () => {
      console.log(`Client-${initialTime} close the connection`);
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

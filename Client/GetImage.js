let net = require("net");
let fs = require("fs");
let open = require("open");
let singleton = require("./ClientSingleton");
const ITPRequest = require("./ITPRequest");
const { exit } = require("process");

//retieving cl info
let command = process.argv.slice(2);
let addr = command[1].split(":")[0];
let port = command[1].split(":")[1];
let query = command[3];

// Enter your code for the client functionality here
const client = new net.Socket();

//start timer and sequence
singleton.init();

//global val for timestamp
let timeStamp = 0;

//establish connection to server
client.connect({ port: port, host: addr }, function () {
  timeStamp = singleton.getTimestamp();
  console.log("Connected to ImageDB server on: " + addr + ":" + port);

  //create ITPrequest
  ITPRequest.init(command[2], query, timeStamp);

  //get packet
  let packet = ITPRequest.getBytePacket();

  //send packet to server
  client.write(packet);
});

//getting data from server
client.on("data", (data) => {
  //split into header and payload
  let header = data.toJSON().data.slice(0, 12);
  let body = data.toJSON().data.slice(12, data.toJSON().data.length);
  //print header
  console.log("ITP packet header received:");
  printPacketBit(header);

  //retrieve info from header
  let version = parseBitPacket(header, 0, 4);
  let responseType = "";

  //select response type
  switch (parseBitPacket(header, 4, 8)) {
    case 1:
      responseType = "Found";
      break;
    case 2:
      responseType = "Not Found";
      break;
    default:
      responseType = "Busy";
      break;
  }

  let seqNumber = parseBitPacket(header, 12, 20);

  let serverTimeStamp = parseBitPacket(header, 32, 32);

  //turn payload into a buffer
  const buf = Buffer.from(body);

  //log info received
  console.log(
    `Server sent:\n\t--ITP Version: ${version}\n\t--Response Type: ${responseType}\n\t--Sequence Number: ${seqNumber}\n\t--TimeStamp: ${serverTimeStamp}`
  );

  //if image not found don't open or create file
  if (responseType != "Not Found") {
    //create file for image received
    fs.writeFileSync(`${query}`, buf);
    //open image
    open(`${query}`, { wait: false });
  }

  console.log("Disconnected from the server");
  client.destroy();

  //wait for image to display then exit
  setTimeout(exit, 1000);
});

client.on("close", () => {
  console.log("Connection Closed");
});

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

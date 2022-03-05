let ITPpacket = require("./ITPRequest");
const ITPRequest = require("./ITPRequest");

ITPRequest.init("query", "rose.gif");

let packet = ITPRequest.getBytePacket();

console.log(packet);

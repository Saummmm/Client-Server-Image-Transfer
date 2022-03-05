const fs = require("fs");
const open = require("open");
const contents = fs.readFileSync("./images/Rose.gif");
let ITPResponse = require("./ITPResponse");

ITPResponse.init(1, 253, 931, contents);

let packet = ITPResponse.getPacket();

let header = packet.toJSON().data.slice(0, 12);
let body = packet.toJSON().data.slice(12, packet.toJSON().data.length);

const buf = Buffer.from(body);

fs.writeFileSync("new-image.gif", buf);

open("new-image.gif", { wait: true });

// const buf = Buffer.from("Rose.gif" + contents, "binary");

// console.log(bytesToString(buf.toJSON().data));

// // const buf = Buffer.from(contents.toJSON().data.split(":")[1], "binary");

// fs.writeFileSync("new-image.gif", buf);

// open("new-image.gif", { wait: true });

// function bytesToString(array) {
//   var result = "";
//   for (var i = 0; i < array.length; ++i) {
//     result += String.fromCharCode(array[i]);
//   }
//   return result;
// }

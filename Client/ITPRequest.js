// You may need to add some delectation here

module.exports = {
  header: [
    "00000000", //start of last row
    "00000000",
    "00000000",
    "00000000",
    "00000000", //start of second row
    "00000000",
    "00000000",
    "00000000",
    "00000000", //start of third row
    "00000000",
    "00000000",
    "00000000",
  ],
  payload: "",

  init: function (reqType, image, timeStamp) {
    //setting version
    let version = 7;
    storeBitPacket(this.header, version, 0, 4);

    let fileName = image.split(".")[0];
    let fileType = image.split(".")[1];

    //getting imagetype val
    let imageType;

    switch (fileType) {
      case "bmp":
        imageType = 1;
        break;
      case "jpeg":
        imageType = 2;
        break;
      case "gif":
        imageType = 3;
        break;
      case "png":
        imageType = 4;
        break;
      case "tiff":
        imageType = 5;
        break;
      case "raw":
        imageType = 15;
        break;
      default:
        console.log("type not found");
        break;
    }

    //setting request type
    reqType = 0;
    storeBitPacket(this.header, reqType, 24, 8);

    //setting time stamp
    storeBitPacket(this.header, timeStamp, 32, 32);

    //setting image name topayload
    let imageName = stringToBytes(fileName);
    this.payload = imageName;

    //setting image type
    storeBitPacket(this.header, imageType, 64, 4);

    //setting imageNameSize
    let imageNameSize = imageName.length;
    storeBitPacket(this.header, imageNameSize, 68, 28);
  },

  //--------------------------
  //getBytePacket: returns the entire packet in bytes
  //--------------------------
  getBytePacket: function () {
    let packet = this.header.concat(this.payload);
    let buf = Buffer.from(packet);
    return buf;
    // return "this should be a correct packet";
  },
};

//// Some usefull methods ////
// Feel free to use them, but DON NOT change or add any code in these methods.

// Convert a given string to byte array
function stringToBytes(str) {
  var ch,
    st,
    re = [];
  for (var i = 0; i < str.length; i++) {
    ch = str.charCodeAt(i); // get char
    st = []; // set up "stack"
    do {
      st.push(ch & 0xff); // push byte to stack
      ch = ch >> 8; // shift value down by 1 byte
    } while (ch);
    // add stack contents to result
    // done because chars have "wrong" endianness
    re = re.concat(st.reverse());
  }
  // return an array of bytes
  return re;
}

// var packet = ["00000000", "00000000", "00000000", "00000000"];

// storeBitPacket(packet, 7, 0, 4);

// console.log(stringToBytes("roses"));

// Store integer value into specific bit poistion the packet
function storeBitPacket(packet, value, offset, length) {
  // let us get the actual byte position of the offset
  let lastBitPosition = offset + length - 1;
  let number = value.toString(2);
  let j = number.length - 1;
  for (var i = 0; i < number.length; i++) {
    let bytePosition = Math.floor(lastBitPosition / 8);
    let bitPosition = 7 - (lastBitPosition % 8);
    if (number.charAt(j--) == "0") {
      packet[bytePosition] &= ~(1 << bitPosition);
    } else {
      packet[bytePosition] |= 1 << bitPosition;
    }
    lastBitPosition--;
  }
  // console.log(packet);
}

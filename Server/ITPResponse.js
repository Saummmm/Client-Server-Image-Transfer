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
  init: function (responseType, seqNumber, timeStamp, img) {
    //storing data to the header
    let version = 7;
    storeBitPacket(this.header, version, 0, 4);

    storeBitPacket(this.header, responseType, 4, 8);

    storeBitPacket(this.header, seqNumber, 12, 20);

    storeBitPacket(this.header, timeStamp, 32, 32);

    //taking image data, converting into buffer to encode in binary then to an array
    this.payload = Buffer.from(img, "binary").toJSON().data;

    //getting length and storing to header
    storeBitPacket(this.header, this.payload.length, 64, 32);
  },

  //--------------------------
  //getpacket: returns the entire packet
  //--------------------------
  getPacket: function () {
    let packet = this.header.concat(this.payload);
    let buf = Buffer.from(packet);
    return buf;
  },
};

//// Some usefull methods ////
// Feel free to use them, but DON NOT change or add any code in these methods.

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
}

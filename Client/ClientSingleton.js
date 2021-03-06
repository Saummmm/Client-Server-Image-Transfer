let Timer = require("timers");
// Some code need to be added here, that are common for the module

module.exports = {
  timerVal: 0,
  init: function () {
    // init function needs to be implemented here //
    //random number between 0 and 999 for the initial val of timer
    this.timerVal = Math.floor(Math.random() * 999);
    setInterval(() => {
      this.timerVal++;
      //once timer reaches 2^32, it will reset
      if (this.timerVal == 2 ** 32) {
        this.timerVal = 0;
      }
    }, 10);
  },

  //--------------------------
  //getTimestamp: return the current timer value
  //--------------------------
  getTimestamp: function () {
    return this.timerVal;
  },
};

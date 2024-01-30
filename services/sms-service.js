const Twilio = require('twilio');

class SMSService {

  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID;
    this.authToken = process.env.TWILIO_AUTH_TOKEN;
    this.syncServiceSid = process.env.TWILIO_SYNC_SERVICE_SID;
    this.client = Twilio(this.accountSid, this.authToken);
  }

  /**
   * Generate an Access Token for an application user - it generates a token with an
   * identity if one is provided.
   *
   * @return {Object}
   *         {Object.identity} String random indentity
   *         {Object.token} String token generated
   */
  
  async sendSMS(patientPhoneNumber, messageBody){
    this.client.messages
    .create({
      body: messageBody,
      from: process.env.SMS_FROM_NUMBER,
      to: patientPhoneNumber
    })
    .then(message => console.log(`SMS sent with SID: ${message.sid}`))
    .catch(error => console.error(`Error sending SMS: ${error.message}`));

  }

}

module.exports = { SMSService }
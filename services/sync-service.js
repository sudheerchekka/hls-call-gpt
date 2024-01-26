const Twilio = require('twilio');

class SyncService {

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
  tokenGenerator(identity) {
    const AccessToken = Twilio.jwt.AccessToken;
    const SyncGrant = AccessToken.SyncGrant;

    // Create an access token which we will sign and return to the client
    const token = new AccessToken(
      this.accountSid,
      process.env.TWILIO_API_KEY,
      process.env.TWILIO_API_SECRET,
      {identity: "${identity}"}
    );
    // Assign the provided identity
    //token.identity = identity;

    // Point to a particular Sync service, or use the account default Service
    const syncGrant = new SyncGrant({
      serviceSid: process.env.TWILIO_SYNC_SERVICE_SID || 'default'
    });
    token.addGrant(syncGrant);

    // Serialize the token to a JWT string and include it in a JSON response
    /*return {
      identity: token.identity,
      token: token.toJwt()
    };*/
    console.log(token.toJwt());
    return token.toJwt();
  }

  // Function to add a ListItem to a Sync List
  async addListItemToList(patientPhoneNumber, listSid, dataObject) {
    try {
      let jsonObj = JSON.parse(dataObject);
      let newOrder = {};
      if (jsonObj.orders){
        for(var ordervar in jsonObj.orders){
          //console.log(" order.order : " + jsonObj.orders[ordervar].order);
          newOrder.id = patientPhoneNumber;
          newOrder.order = jsonObj.orders[ordervar].order
          console.log("adding new order to Sync: " + JSON.stringify(newOrder));

        const syncList = await this.client.sync.v1.services(this.syncServiceSid)
        .syncLists(listSid)
        .syncListItems
              .create({data: newOrder})
              .then(sync_list_item => console.log(sync_list_item.index));
        }
      }
      else{
        jsonObj.id = patientPhoneNumber
        const syncList = await this.client.sync.v1.services(this.syncServiceSid)
        .syncLists(listSid)
        .syncListItems
              .create({data: jsonObj})
              .then(sync_list_item => console.log(sync_list_item.index));
      }
      
      
    } catch (error) {
      console.error(`Error adding ListItem to Sync List: ${error.message}`);
    }
  }


  clearSyncListItems(listSid){

    this.client.sync.v1.services(process.env.TWILIO_SYNC_SERVICE_SID)
    .syncLists(listSid)
    .syncListItems
    .list({limit: 20})
    .then(syncListItems => syncListItems.forEach(s => {
      console.log(s);
      this.client.sync.v1.services(process.env.TWILIO_SYNC_SERVICE_SID)
      .syncLists(listSid)
      .syncListItems(s.index)
      .remove();
      }));
          
  }

}

module.exports = { SyncService }
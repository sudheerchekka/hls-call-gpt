const axios = require('axios');
const segmentApiUrl = process.env.SEGMENT_API_URL;
const accessToken = process.env.SEGMENT_ACCESS_TOKEN;
const workspaceId = process.env.SEGMENT_WORKSPACE_ID;

class SegmentService{

  constructor(){
    this.userId = 'use_fDzNFMwApuS92WpVNvZ2bK5aWA4'; // Example user ID
    this.varString ="traits";
    this.limit = "100";
  }

  async getSegmentData(userId,varString,limit) {
    try {
      const response = await axios.get(`${segmentApiUrl}/spaces/${workspaceId}/collections/users/profiles/${userId}/${varString}?limit=${limit}`, {
          headers: {
              'Content-Type': 'application/json',
              Authorization:
                `Basic ${btoa(accessToken + ':')}`,
            }
    ,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching customer profile data:', error);
      return null;
    }
  };

  getUserId(){
    return this.userId;
  }
  //
  /*
    getSegmentData(userId,"traits",limit).then(profile => {
      if (profile) {
        console.log('Customer Profile:', profile);
      }
    });
    getSegmentData(userId,"events","4").then(profileEvent => {
      if (profileEvent) {
        console.log('Customer Profile events:', profileEvent);
      }
    });*/
}

module.exports = { SegmentService }
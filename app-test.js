require("dotenv").config();
const express = require("express");
const ExpressWs = require("express-ws");
const colors = require('colors');


const { GptService } = require("./services/gpt-service");
const { StreamService } = require("./services/stream-service");
const { TranscriptionService } = require("./services/transcription-service");
const { TextToSpeechService } = require("./services/tts-service");
const { AirtableService } = require("./services/airtable-service");
const { SegmentService } = require("./services/segment-service");
const { SyncService } = require("./services/sync-service");

const app = express();
ExpressWs(app);

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);
let confSid;

let conversation="";
let sampleConversation=process.env.SAMPLE_CONVO;
let patientPhoneNumber=process.env.DEFAULT_PATIENT_PHONE;

const PORT = process.env.PORT || 3000;



/*
const airtableService = new AirtableService();

airtableService.deleteRecord("+14083985848");
airtableService.createRecord("+14083985848");
airtableService.updateSummary("+14083985848", "test summary of the conversation");
*/

/*
const gptService = new GptService();
gptService.completion("lets order x-ray for your wrist", 10);

gptService.on('gptreply', async (gptReply, icount) => {
    console.log(`Interaction ${icount}: GPT -> TTS: ${gptReply.partialResponse}`.green )
    //ttsService.generate(gptReply, icount);
    //airtableService.updateSummary(patientPhoneNumber, gptReply.partialResponse);
  });
*/

/*
const userId = 'use_fDzNFMwApuS92WpVNvZ2bK5aWA4'; // Example user ID
const limit = "100";
const segmentService = new SegmentService();
segmentService.getSegmentData(userId,"traits",limit).then(profile => {
    if (profile) {
      console.log('Customer Profile:', profile);
    }
  });
 
 
 segmentService.getSegmentData(userId,"events","4").then(profileEvent => {
    if (profileEvent) {
      console.log('Customer Profile events:', profileEvent);
    }
  });
  */

  jsonObj = JSON.stringify({"order":"Order Complete Blood Cell count"});
  const syncService = new SyncService();
  //syncService.addListItemToList(process.env.TWILI_SYNC_LIST_CONVERSATION_SID,jsonObj);
  //syncService.addListItemToList(process.env.TWILIO_SYNC_LIST_RECO_SID,jsonObj);
  //syncService.clearSyncListItems(process.env.TWILI_SYNC_LIST_CONVERSATION_SID);
  //syncService.clearSyncListItems(process.env.TWILIO_SYNC_LIST_RECO_SID);
  syncService.tokenGenerator("example");

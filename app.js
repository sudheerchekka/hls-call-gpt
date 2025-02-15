require("dotenv").config();
const util = require('util');
const path = require("path");
const express = require("express");
const ExpressWs = require("express-ws");
const colors = require('colors');


const { GptService } = require("./services/gpt-service");
const { StreamService } = require("./services/stream-service");
const { TranscriptionService } = require("./services/transcription-service");
const { TextToSpeechService } = require("./services/tts-service");
const { AirtableService } = require("./services/airtable-service");
const { SyncService } = require("./services/sync-service");
const { SegmentService } = require("./services/segment-service");
const { SMSService } = require("./services/sms-service");

const app = express();
ExpressWs(app);

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);
let confSid;

let conversation="";
let sampleConversation=process.env.SAMPLE_CONVO;
let patientPhoneNumber=process.env.DEFAULT_PATIENT_PHONE;

const convoSyncListName = process.env.TWILI_SYNC_LIST_CONVERSATION_NAME;
const taskSyncListName = process.env.TWILI_SYNC_LIST_RECO_NAME;

const PORT = process.env.PORT || 3000;


app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.get("/access", (req, res) => {
  console.log("in access");
  const syncService = new SyncService();
  syncToken = syncService.tokenGenerator();

  const response = {
    "convoSyncListName": convoSyncListName,
    "taskSyncListName": taskSyncListName,
    "token":  syncToken
  };

  //res.send(response);
  //return res.json(response);
  return res.send(JSON.stringify(response));
});

app.get("/access_airtable", (req, res) => {
  console.log("in access_airtable");
  

  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableName = process.env.AIRTABLE_TABLE_NAME;

  const response = {
    "apiKey": process.env.AIRTABLE_API_KEY,
    "baseId": process.env.AIRTABLE_BASE_ID,
    "tableName":  process.env.AIRTABLE_TABLE_NAME
  };

  return res.send(JSON.stringify(response));
});

app.get("/profile", (req, res) => {
  console.log("fetching segment profile");
  const segmentService = new SegmentService();
  const profile = segmentService.getSegmentData(segmentService.getUserId(),"traits", 100)
  .then(data => {
    console.log("profile traits - " + data);
    return res.send(data.traits);
  });
});

app.get("/generate_reco_screenings", async (req, res) => {
  console.log("generating recommeded screenings");
  let age;
  let gender;
  let medical_history = 'high blood pressure'; //defaut value
  
  //get patient profile data
  const segmentService = new SegmentService();
  const profile = await segmentService.getSegmentData(segmentService.getUserId(),"traits", 100)
  .then(data => {
    console.log("profile traits - " + data.traits);
    console.log("profile traits.condition - " + data.traits.condition);
    age = data.traits.age;
    medical_history = data.traits.condition;
    gender = data.traits.gender_at_birth;
  });
  
  //TODO: Segment is returning None
  medical_history = 'high blood pressure'; 

  patientData = JSON.stringify({age: age, gender:gender, medical_history: medical_history});
  const gptService = new GptService();
  screenings = await gptService.getRecommendedScreenings(patientData, 5);
  console.log("screenings: " + screenings);
  screeningsJSON = {screenings: screenings}
  return res.send(JSON.stringify(screeningsJSON));

});

//pass orders in JSON format {"phonenumber": "+14083985848", "order": "order cbc"} to save them in Airtable
app.post("/savelaborder", (req, res) => {
  const airtableService = new AirtableService();
  const segmentService = new SegmentService();

  if (req.body.phonenumber && req.body.order) {
    airtableService.updateLabOrders(req.body.phonenumber, req.body.order);
    let segmentEvent = {
      'userId': segmentService.getEventUserId(),
      'event': req.body.order,
       'properties': {
          'lab': 'Quest'
        }
     }
     console.log(segmentEvent);
     segmentService.updateSegmentEvents(process.env.SEGMENT_EVENT_API_URL, segmentEvent);
  }

  if (req.body.cpt === 'sms'){
    const smsService = new SMSService();
    smsService.sendSMS(patientPhoneNumber, req.body.order);

  }

  res.send(null);
});

app.get("/generate_convosummary", async (req, res) => {
  const gptService = new GptService();
  summary = await gptService.getSummary(conversation);
  console.log("summary: " + summary);
  summaryJSON = {phonenumber: patientPhoneNumber, summary: summary}
  return res.send(JSON.stringify(summaryJSON));
});

app.post("/save_convosummary", async (req, res) => {
  const airtableService = new AirtableService();
  console.log("saving summary: " + req.body.summary)
  console.log("saving summary for phone number: " + req.body.phonenumber)
  if (req.body.summary && req.body.phonenumber)
    airtableService.updateSummary(req.body.phonenumber, req.body.summary);

  res.send("saved");
});

app.post("/incoming/patient", (req, res) => {
  res.status(200);
  res.type("text/xml");
  res.end(`
  <Response>
    <Start>
      <Stream url="wss://${process.env.SERVER}/connection">
        <Parameter name="participant" value ="patient"/>
      </Stream>
    </Start>
    <Dial>
      <Conference>Room 1234</Conference>
    </Dial>
  </Response>
  `);
});

app.post("/incoming/clinician", (req, res) => {
  res.status(200);
  res.type("text/xml");
  res.end(`
  <Response>
    <Start>
      <Stream url="wss://${process.env.SERVER}/connection">
        <Parameter name="participant" value ="clinician"/>
      </Stream>
    </Start>
    <Dial>
      <Conference>Room 1234</Conference>
    </Dial>
  </Response>
  `);
});

app.ws("/connection", (ws, req) => {
  ws.on("error", console.error);
  // Filled in from start message
  let patientStreamSid;
  let clinicianStreamSid;

  const gptService = new GptService();
  //const streamService = new StreamService(ws);
  const patient_transcriptionService = new TranscriptionService();
  const clinician_transcriptionService = new TranscriptionService();
  //const ttsService = new TextToSpeechService({});

  const airtableService = new AirtableService();
  const client = require('twilio')(accountSid, authToken);
  const syncService = new SyncService();


  
  let marks = []
  let interactionCount = 0

  // Incoming from MediaStream
  ws.on("message", function message(data) {
    const msg = JSON.parse(data);
    //console.log(msg);
    if (msg.event === "start") {
      user = msg.start.customParameters.participant;
      if (user === 'patient'){
        patientStreamSid = msg.start.streamSid;
        console.log(`Starting patient Media Stream for ${patientStreamSid}`);

        //get the from phone number from call sid and insert a record in Airtable
        let patientCallsid = msg.start.callSid;
        client.calls(patientCallsid)
              .fetch()
              .then(call => {
                console.log(call.from);
                patientPhoneNumber = call.from;
                //clean up existing patient record before creating a new record
                //  airtableService.deleteRecord(patientPhoneNumber);
                airtableService.createRecord(patientPhoneNumber);
              });
      }
      else if (user === 'clinician'){
        clinicianStreamSid = msg.start.streamSid;
        console.log(`Starting clinician Media Stream for ${clinicianStreamSid}`);
        console.log(`Patient number: ${patientPhoneNumber}`);
      }
    } else if (msg.event === "media") {
        if (msg.streamSid == patientStreamSid)
          patient_transcriptionService.send(msg.media.payload);
        else
          clinician_transcriptionService.send(msg.media.payload);
    } else if (msg.event === "mark") {
      const label = msg.mark.name;
      console.log(`Twilio -> Audio completed mark (${msg.sequenceNumber}): ${label}`.red)
      marks = marks.filter(m => m !== msg.mark.name)
    } else if (msg.event === "stop") {
      if (msg.streamSid == patientStreamSid)
        console.log(`Twilio -> Patient Media stream ${patientStreamSid} ended.`.underline.red)
      else{
        console.log(`Twilio -> Clinician Media stream ${clinicianStreamSid} ended.`.underline.red)
        //TODO: close Twilio conference when the clincian ends the call
      }

    }
  });

  patient_transcriptionService.on("utterance", async (text) => {
    // This is a bit of a hack to filter out empty utterances
    if(marks.length > 0 && text?.length > 5) {
      console.log("Twilio -> Interruption, Clearing Patient stream".red)
      ws.send(
        JSON.stringify({
          patientStreamSid,
          event: "clear",
        })
      );
    }
  });

  clinician_transcriptionService.on("utterance", async (text) => {
    // This is a bit of a hack to filter out empty utterances
    if(marks.length > 0 && text?.length > 5) {
      console.log("Twilio -> Interruption, Clearing Clinician stream".red)
      ws.send(
        JSON.stringify({
          clinicianStreamSid,
          event: "clear",
        })
      );
    }
  });


  patient_transcriptionService.on("transcription", async (text) => {
    if (!text) { return; }
    conversation = conversation + "\r\n Patient: " + text;
    console.log(`Patient interaction ${interactionCount} – STT -> GPT: ${text}`.yellow);
    //gptService.completion(text, interactionCount);
    patientJSON = `{"user":"patient", "content":"${text}"}`;
    console.log("patientJSON: " + patientJSON);
    syncService.addConvoListItemSync(convoSyncListName, patientJSON);
    interactionCount += 1;
  });

  clinician_transcriptionService.on("transcription", async (text) => {
    if (!text) { return; }
    conversation = conversation + "\r\n Clinician: " + text;
    console.log(`Clinician interaction ${interactionCount} – STT -> GPT: ${text}`.yellow);
    gptService.completion(text, interactionCount);
    interactionCount += 1;

    clinicianJSON = `{"user":"clinician", "content":"${text}"}`;
    console.log("clinicianJSON: " + clinicianJSON);
    syncService.addConvoListItemSync(convoSyncListName, clinicianJSON);
  });
  
  gptService.on('gptreply', async (gptReply, icount) => {
    console.log(`Interaction ${icount}: GPT -> TTS: ${gptReply.partialResponse}`.green )
    //ttsService.generate(gptReply, icount);
    airtableService.updateSummary(patientPhoneNumber, gptReply.partialResponse);
  });

  gptService.on('gpttask', async (gptReply, icount) => {
    console.log("push the task to the sync object: " + gptReply);
    syncService.addTaskListItemSync(patientPhoneNumber, taskSyncListName, gptReply);
  });

  ttsService.on("speech", (responseIndex, audio, label, icount) => {
    console.log(`Interaction ${icount}: TTS -> TWILIO: ${label}`.blue);

    streamService.buffer(responseIndex, audio);
  });

  streamService.on('audiosent', (markLabel) => {
    marks.push(markLabel);
  })
});

app.listen(PORT);
console.log(`Server running on port ${PORT}`);

const airtable = require("airtable");

let base = null;

class AirtableService  {

  constructor() {
    console.log("airtable key: " + process.env.AIRTABLE_API_KEY);
    console.log("airtable key: " + process.env.AIRTABLE_BASE_ID);
    console.log("airtable key: " + process.env.AIRTABLE_TABLE_NAME);
    base = new airtable({apiKey: process.env.AIRTABLE_API_KEY}).base(process.env.AIRTABLE_BASE_ID);
  }



  createRecord(phoneNumber) {
    console.log("phoneNumber: " + phoneNumber);
    base(process.env.AIRTABLE_TABLE_NAME).create({
      phone_number: phoneNumber
    }).then(record => {
      console.log('Created record:', record);
    }).catch(err => {
      console.error('Error creating record:', err);
    });
  }

  //update the the patient record with the conversation sumary
  //TODO: refacrtor the code to use async/await to make it clean
  updateSummary(phoneNumber, summary) {
    console.log("phoneNumber...update summary: " + summary + "::" + process.env.AIRTABLE_TABLE_NAME + " : " + phoneNumber);
    let airtableRecordId;
    
    //find the patient record based on the phone number and the update the summary field
    base(process.env.AIRTABLE_TABLE_NAME).select({
      //filterByFormula: 'phone_number = "alpha"'
      filterByFormula: `phone_number = "${phoneNumber}"`
    }).eachPage((records, fetchNextPage) => {
      records.forEach(record => {
        console.log('Retrieved record:', record);
        //console.log('Retrieved record:', record.getId());
        airtableRecordId = record.getId();
        console.log("airtableRecordId: " + airtableRecordId);

        //update the summary
        base(process.env.AIRTABLE_TABLE_NAME).update(airtableRecordId,{
          appointment_summary: summary
        }, (err, record) => {
          if (err) {
            console.error(err)
            return
          }
          console.log(record.get('appointment_summary'))
        });

      });
      fetchNextPage();
    }, err => {
      if (err) {
        console.error('Error retrieving records:', err);
      }
    })
  }

}

module.exports = { AirtableService }
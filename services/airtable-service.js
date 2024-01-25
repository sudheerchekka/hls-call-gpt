'use strict';
const util = require('util');
const airtable = require("airtable");

let base = null;

class AirtableService  {

  constructor() {
    console.log("airtable key: " + process.env.AIRTABLE_API_KEY);
    console.log("airtable key: " + process.env.AIRTABLE_BASE_ID);
    console.log("airtable key: " + process.env.AIRTABLE_TABLE_NAME);
    base = new airtable({apiKey: process.env.AIRTABLE_API_KEY}).base(process.env.AIRTABLE_BASE_ID);
  }


  deleteRecord(phoneNumber){
    let airtableRecordId = null;
    base(process.env.AIRTABLE_TABLE_NAME).select({
      filterByFormula: `phone_number = "${phoneNumber}"`
    }).eachPage((records, fetchNextPage) => {
      records.forEach(record => {
        //console.log(util.inspect(record, {depth: null}));
        airtableRecordId = record.getId();
        console.log("airtableRecordId: " + airtableRecordId);

       base(process.env.AIRTABLE_TABLE_NAME).destroy(airtableRecordId).then(() => {
          console.log('Record deleted successfully');
        }).catch(err => {
          console.error('Error deleting record:', err);
        });

      });
      fetchNextPage();
    }, err => {
      if (err) {
        console.error('Error retrieving records:', err);
      }
    })
  }

  createRecord(phoneNumber) {
    base(process.env.AIRTABLE_TABLE_NAME).create({
      phone_number: phoneNumber
    }).then(record => {
      console.log('Created record for:', phoneNumber);
    }).catch(err => {
      console.error('Error creating record:', err);
    });
  }

  //update the the patient record with the conversation sumary
  //TODO: refacrtor the code to use async/await to make it clean
  updateSummary(phoneNumber, summary) {
    let airtableRecordId;
    
    //find the patient record based on the phone number and the update the summary field
    base(process.env.AIRTABLE_TABLE_NAME).select({
      filterByFormula: `phone_number = "${phoneNumber}"`
    }).eachPage((records, fetchNextPage) => {
      records.forEach(record => {
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
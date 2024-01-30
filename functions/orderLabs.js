function orderLabs(functionArgs) {
  const model = functionArgs.model;
  console.log("GPT -> called orderLabs function");
  console.log("model: " + model);
  
  if (model?.toLowerCase().includes("complete_count")) {
    return JSON.stringify({
      "cpt":"12390",
      "orders":[
          { "order":"Order Complete Blood Cell count"}
        ]
      });
  } else if (model?.toLowerCase().includes("vitd")) {
    console.log("vitd");
    return JSON.stringify({
      "cpt":"12490",
      "orders":[
          { "order":"Order Vit D level"}
        ]
      });
  } else if (model?.toLowerCase().includes("lipid_profile")) {
    return JSON.stringify({
      "cpt":"12591",
      "orders":[
          { "order":"Order lipid profile"}
        ]
      });
  }
}

module.exports = orderLabs;


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
  } else {
    return JSON.stringify({
      "cpt":"12590",
      "orders":[
          { "order":"Order metabolic panel"}
        ]
      });
  }
}

module.exports = orderLabs;


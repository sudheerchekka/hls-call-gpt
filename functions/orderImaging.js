function orderImaging(functionArgs) {
  const model = functionArgs.model;
  console.log("GPT -> called orderImaging function");
  
  if (model?.toLowerCase().includes("x-ray wrist")) {
    return JSON.stringify([{
      "cpt":"73660",
      "orders":[
          { "order":"Order X-ray Wrist Left"},
          {"order":"Order X-ray Wrist Right"} 
        ]
      }]);
  } else if (model?.toLowerCase().includes("x-ray hand")) {
      return JSON.stringify([{
        "cpt":"73120",
        "orders":[
            { "order":"Order X-ray Hand Left"},
            {"order":"Order X-ray Hand Right"} 
          ]
        }]); 
  } else {
    return JSON.stringify({ order: "Order metabolic panel" });
  }
}

module.exports = orderImaging;
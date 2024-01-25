function orderLabs(functionArgs) {
  const model = functionArgs.model;
  console.log("GPT -> called orderLabs function");
  console.log("model: " + model);
  
  if (model?.toLowerCase().includes("complete_count")) {
    return JSON.stringify({ order:"Order Complete Blood Cell count" });
  } else if (model?.toLowerCase().includes("vitd")) {
    console.log("vitd");
    return JSON.stringify({ order: "Order Vit D level" });
  } else {
    return JSON.stringify({ order: "Order metabolic panel" });
  }
}

module.exports = orderLabs;
function sendEduLinks(functionArgs) {
  const model = functionArgs.model;
  console.log("GPT -> called sendEduLinks function");
  console.log("model: " + model);
  
  if (model?.toLowerCase().includes("high-blood-pressure")) {
    return JSON.stringify({
      "cpt":"12https://www.uptodate.com/contents/high-blood-pressure-diet-and-weight-beyond-the-basics",
      "orders":[
          { "order":"Send blood presssure education"}
        ]
      });
  } else if (model?.toLowerCase().includes("wrist-exercise")) {
    console.log("viwrist-exercisetd");
    return JSON.stringify({
      "cpt":"https://myhealth.alberta.ca/Health/aftercareinformation/pages/conditions.aspx?hwid=bo1652",
      "orders":[
          { "order":"Send wrist exercises"}
        ]
      });
  } else if (model?.toLowerCase().includes("hand-exercise")){
    return JSON.stringify({
      "cpt":"https://www.nationwidechildrens.org/family-resources-education/health-wellness-and-safety-resources/helping-hands/exercises-hand-active",
      "orders":[
          { "order":"Send hand exercises"}
        ]
      });
  }
}

module.exports = sendEduLinks;


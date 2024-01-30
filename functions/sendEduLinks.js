function sendEduLinks(functionArgs) {
  const model = functionArgs.model;
  console.log("GPT -> called sendEduLinks function");
  console.log("model: " + model);
  
  if (model?.toLowerCase().includes("high-blood-pressure")) {
    return JSON.stringify({
      "cpt":"sms",
      "orders":[
        { "order":"<a href=\"https://www.uptodate.com/contents/high-blood-pressure-diet-and-weight-beyond-the-basics\" target=\"_blank\">Send blood pressure education</a>"}
        ]
      });
  } else if (model?.toLowerCase().includes("wrist-exercise")) {
    console.log("viwrist-exercisetd");
    return JSON.stringify({
      "cpt":"sms",
      "orders":[
        { "order":"<a href=\"https://myhealth.alberta.ca/Health/aftercareinformation/pages/conditions.aspx?hwid=bo1652\" target=\"_blank\">Send wrist exercises</a>"}
        ]
      });
  } else if (model?.toLowerCase().includes("hand-exercise")){
    return JSON.stringify({
      "cpt":"sms",
      "orders":[
          { "order":"<a href=\"https://www.nationwidechildrens.org/family-resources-education/health-wellness-and-safety-resources/helping-hands/exercises-hand-active\" target=\"_blank\">Send hand exercises</a>"}
        ]
      });
  }
}

module.exports = sendEduLinks;


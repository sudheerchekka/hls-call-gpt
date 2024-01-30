// create metadata for all the available functions to pass to completions API
const tools = [
  {
    type: "function",
    function: {
      name: "orderLabs",
      description: "place lab order",
      parameters: {
        type: "object",
        properties: {
          model: {
            type: "string",
            "enum": ["complete_count", "VitD", "lipid_profile"],
            description: "lab order for blood report or Vit D or lipid profile",
          },
        },
        required: ["model"],
      },
      returns: {
        type: "object",
        properties: {
          stock: {
            type: "integer",
            description: "An integer containing how many of the model are in currently in stock."
          }
        }
      }
    },
  },
  {
    type: "function",
    function: {
      name: "orderImaging",
      description: "place imaging order",
      parameters: {
        type: "object",
        properties: {
          model: {
            type: "string",
            "enum": ["x-ray wrist", "x-ray hand", "x-ray chest"],
            description: "imaging order for x-rays",
          },
        },
        required: ["model"],
      },
      returns: {
        type: "object",
        properties: {
          stock: {
            type: "integer",
            description: "An integer containing how many of the model are in currently in stock."
          }
        }
      }
    },
  },
  {
    type: "function",
    function: {
      name: "sendEduLinks",
      description: "send patient education links",
      parameters: {
        type: "object",
        properties: {
          model: {
            type: "string",
            "enum": ["high-blood-pressure", "wrist-exercise", "hand-exercise"],
            description: "send patient education links",
          },
        },
        required: ["model"],
      },
      returns: {
        type: "object",
        properties: {
          stock: {
            type: "integer",
            description: "An integer containing how many of the model are in currently in stock."
          }
        }
      }
    },
  }
];

module.exports = tools;
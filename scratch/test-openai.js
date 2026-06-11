const OpenAI = require("openai");
const client = new OpenAI({ apiKey: "test-key" });
console.log("Client properties:", Object.keys(client));
if (client.responses) {
  console.log("client.responses properties:", Object.keys(client.responses));
} else {
  console.log("client.responses is NOT available in this version of the SDK.");
}

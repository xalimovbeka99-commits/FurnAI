const OpenAI = require("openai");
const client = new OpenAI({ apiKey: "test-key" });
console.log("Responses client prototype methods:");
let obj = client.responses;
while (obj) {
  console.log(Object.getOwnPropertyNames(obj));
  obj = Object.getPrototypeOf(obj);
}

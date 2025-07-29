const path = require("path")
const dotenv = require("dotenv")
const {SystemMessage,HumanMessage,AIMessage} =require("@langchain/core/messages")

const {ChatAnthropic,} =require("@langchain/anthropic")
const { createFileinDateFolder } = require("../Google")

dotenv.config({path: path.resolve(__dirname, "../.env")})

async function ask_cluade(question) {

    // await sendStatuses("Executing Script Generator with question: ", question)
const model = new ChatAnthropic({
  modelName: "claude-3-7-sonnet-latest",
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  maxTokens: 1024,
  temperature: 0.7,
});

const messages=[
    new SystemMessage("You are an helpful assistant, who is able to write a script to be used to make a video, return normal text and interpret the Markdown format"),
    new HumanMessage({content:question})
]

console.log(messages);

try {
    const response = await model.invoke(messages);

    console.log(response.content)

    await createFileinDateFolder(response.content)
        return response.content
    
} catch (error) {
    console.log(error.message);
    return error.message
}
   
}
async function ask_cluade1(question) {
const model = new ChatAnthropic({
  modelName: "claude-3-7-sonnet-latest",
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  maxTokens: 1024,
  temperature: 0.7,
});

const messages=[
    new SystemMessage("You are an helpful assistant"),
    new HumanMessage({content:question})
]

console.log(messages);

try {
    const response = await model.invoke(messages);

    console.log(response.content)
        return response.content
    
} catch (error) {
    console.log(error.message);
    return error.message
}
   
}

module.exports={ask_cluade, ask_cluade1}
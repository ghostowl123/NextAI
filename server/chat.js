import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { RetrievalQAChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { PromptTemplate } from "langchain/prompts";

import { PDFLoader } from "langchain/document_loaders/fs/pdf";

//prompt 其实就是母版
// NOTE: change this default filePath to any of your default file name
const chat = async (filePath = "./uploads/CEG_4166B_Tuesday_AM_Team_6_-_Sprint_2_Deliverable_4_v2.3.1-1.pdf", query) => {
  // step 1: document loading
  const loader = new PDFLoader(filePath);

  // await = promise + .then wait this line finished
  // 整个就是变成了一个async function
  const data = await loader.load();

  // step 2: splitting 这里数字可以改掉的
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500, //  (in terms of number of characters)
    chunkOverlap: 0,
  });

  const splitDocs = await textSplitter.splitDocuments(data); // chunks of text

  // step 3 ：embeddings : text change into vector this process called embeddings
  //embedding cost money
  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.REACT_APP_OPENAI_API_KEY,
  });

  const vectorStore = await MemoryVectorStore.fromDocuments(
    splitDocs,
    embeddings
  );

  // step 4: retrieval(optional), you can check relevant splits it retrieved
  
  // const relevantDocs = await vectorStore.similaritySearch(
  // "What is task decomposition?"
  // );

  // step 5: qa w/ customzie the prompt
  const model = new ChatOpenAI({
    modelName: "gpt-3.5-turbo",
    openAIApiKey: process.env.REACT_APP_OPENAI_API_KEY,
  });

  const template = `Use the following pieces of context to answer the question at the end.
If you don't know the answer, just say that you don't know, don't try to make up an answer.
Use three sentences maximum and keep the answer as concise as possible.

{context}
Question: {question}
Helpful Answer:`;

  const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever(), {
    prompt: PromptTemplate.fromTemplate(template),
    // returnSourceDocuments: true,
  });

  const response = await chain.call({
    query,
  });

  return response;
};

export default chat;

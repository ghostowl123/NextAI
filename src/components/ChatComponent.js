import React, { useState, useEffect } from "react"; // Import useState
import axios from "axios";
import { Button, Input } from "antd";
import { AudioOutlined } from "@ant-design/icons";
// we customize a hook
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import Speech from "speak-tts";

const { Search } = Input;

//之后后端部署好了可以放后端部署好的url
const DOMAIN = "http://localhost:8080";

const searchContainer = {
  display: "flex",
  justifyContent: "center",
};

// 把用户的问题存储下来 发送给后端 之后返回给前端答案
const ChatComponent = (props) => {
const { handleResp, isLoading, setIsLoading } = props;
// Define a state variable to keep track of the search value
const [searchValue, setSearchValue] = useState("");
const [isChatModeOn, setIsChatModeOn] = useState(false);
const [isRecording, setIsRecording] = useState(false);
//需要调用后端API 我们需要把用户说的内容存下来
const [speech, setSpeech] = useState();// this is used to speak the AI content


// speech recognation i.e. STT

const{
  transcript,
  listening,
  resetTranscript,
  browserSupportsSpeechRecognition,
  isMicrophoneAvailable,

} = useSpeechRecognition();
//自动检测停顿
useEffect(() => {
  // text to speech的初始化 放在useEffect()这里是为了它每次只跑一遍
  const speech = new Speech();
  speech
    .init({
      volume: 1,
      lang: "en-US",
      rate: 1,
      pitch: 1,
      voice: "Google US English",
      splitSentences: true,
    })
    .then((data) => {
      // The "data" object contains the list of available voices and the voice synthesis params
      console.log("Speech is ready, voices are available", data);
      // block speech
      setSpeech(speech);
    })
    .catch((e) => {
      console.error("An error occured while initializing : ", e);
    });
}, []);
// // 每个useEffect只做一个事情 单一性原则 single purpose
// useEffect(() => {
// // 两个 ！！ 是Boolean代表true     0个！ transcript就是 string
//   if (!listening && !!transcript) {
//     (async () => await onSearch(transcript))();// 寻找 answer
//     setIsRecording(false);
//   }
// }, [listening, transcript]);
useEffect(() => {
  if (!listening && !!transcript) {
    (async () => await onSearch(transcript))();
    setIsRecording(false);
  }
}, [listening, transcript]);
// AI start to talk 
const talk = (what2say) => {
  speech
    .speak({
      text: what2say,
      queue: false, // current speech will be interrupted,
      listeners: {
        onstart: () => {
          console.log("Start utterance");
        },
        onend: () => {
          console.log("End utterance");
        },
        onresume: () => {
          console.log("Resume utterance");
        },
        onboundary: (event) => {
          console.log(
            event.name +
              " boundary reached after " +
              event.elapsedTime +
              " milliseconds."
          );
        },
      },
    })
    .then(() => {
      // if everyting went well, start listening again
      console.log("Success !");
      userStartConvo();
    })
    .catch((e) => {
      console.error("An error occurred :", e);
    });
};
// user start to talk AI listening
const userStartConvo = () => {
  SpeechRecognition.startListening();
  setIsRecording(true);
  resetEverything();
};

const resetEverything = () => {
  resetTranscript();
};

const chatModeClickHandler = () => {
  setIsChatModeOn(!isChatModeOn);
  // case 1: before you click the button, it's recording
  // case 2: before you click the buttom. it's not recording
  setIsRecording(false);
  SpeechRecognition.stopListening();
};

const recordingClickHandler = () => {
  if (isRecording) {
    setIsRecording(false);
    SpeechRecognition.stopListening();
  } else {
    setIsRecording(true);
    SpeechRecognition.startListening();
  }
};


  const onSearch = async (question) => {
    // Clear the search input
    setSearchValue("");
    setIsLoading(true);
    //AXIOS 给后端发请求的 上一个项目用的 fetch
    try {
      const response = await axios.get(`${DOMAIN}/chat`, {
        params: {
          question,
        },
      });
      handleResp(question, response.data);
      if (isChatModeOn) {
        talk(response.data);
      }
    } catch (error) {
      console.error(`Error: ${error}`);
      handleResp(question, error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    // Update searchValue state when the user types in the input box
    setSearchValue(e.target.value);
  };

  // ant design input search 国内用ant 多
  //老美：https://mui.com/material-ui/ 这个用的多
  return (
    <div style={searchContainer}>
      {!isChatModeOn && (
        <Search
          placeholder="input search text"
          enterButton="Ask"
          size="large"
          onSearch={onSearch}
          loading={isLoading}
          value={searchValue} // Control the value
          onChange={handleChange} // Update the value when changed
        />
      )}
      <Button
        type="primary"
        size="large"
        danger={isChatModeOn}
        onClick={chatModeClickHandler}
        style={{ marginLeft: "5px" }}
      >
        Chat Mode: {isChatModeOn ? "On" : "Off"}
      </Button>
      {isChatModeOn && (
        <Button
          type="primary"
          icon={<AudioOutlined />}
          size="large"
          danger={isRecording}
          onClick={recordingClickHandler}
          style={{ marginLeft: "5px" }}
        >
          {isRecording ? "Recording..." : "Click to record"}
        </Button>
      )}
    </div>
  );
};

export default ChatComponent;
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
// import { Button } from "@/components/ui/button"; // Assuming you have a Button component from shadcn/ui

// Helper to generate a UUID (from Volcengine docs example)
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

interface TranscriptionResult {
  text: string;
  isPartial: boolean;
}

export default function RealtimeTranscriber() {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [transcription, setTranscription] = useState<string>("");
  const [interimTranscription, setInterimTranscription] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const socketRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const connectIdRef = useRef<string>(generateUUID()); // For X-Api-Connect-Id

  const appKey = process.env.NEXT_PUBLIC_VOLC_APP_KEY;
  const accessKey = process.env.NEXT_PUBLIC_VOLC_ACCESS_KEY;
  const resourceId = process.env.NEXT_PUBLIC_VOLC_RESOURCE_ID || "volc.bigasr.sauc.duration";

  const stopRecordingAndCloseSocket = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    if (mediaRecorderRef.current?.stream) {
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      console.log("Sending finish message and closing WebSocket.");
      sendFinishMessage(socketRef.current);
    } else if (socketRef.current && socketRef.current.readyState !== WebSocket.CLOSED && socketRef.current.readyState !== WebSocket.CLOSING) {
        socketRef.current.close(1000, "Client initiated stop before full open or after error");
    }

    setIsRecording(false);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!appKey || !accessKey) {
      setError("API keys are not configured. Please set NEXT_PUBLIC_VOLC_APP_KEY and NEXT_PUBLIC_VOLC_ACCESS_KEY in your .env.local file.");
    }
    // Stable sendFinishMessage reference for cleanup
    const currentSendFinishMessage = sendFinishMessage; 

    return () => {
      if (socketRef.current && (socketRef.current.readyState === WebSocket.OPEN || socketRef.current.readyState === WebSocket.CONNECTING) ) {
        console.log("Closing WebSocket connection on unmount");
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            if(socketRef.current.readyState === WebSocket.OPEN) currentSendFinishMessage(socketRef.current);
        }
        socketRef.current.close(1000, "Component unmounted");
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      if (mediaRecorderRef.current?.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps 
  }, [appKey, accessKey, stopRecordingAndCloseSocket]); // sendFinishMessage removed as it's stable or should be made stable if it causes re-runs

  function sendFinishMessage(socket: WebSocket) {
    const headerByte1 = 0b00010001;
    const headerByte2 = 0b00100010; // Note the flags for last packet
    const headerByte3 = 0b00000000;
    const reservedByte = 0x00;
    const payloadSize = 0;
    const buffer = new ArrayBuffer(4 + 4);
    const view = new DataView(buffer);
    view.setUint8(0, headerByte1);
    view.setUint8(1, headerByte2);
    view.setUint8(2, headerByte3);
    view.setUint8(3, reservedByte);
    view.setUint32(4, payloadSize, false); // Big Endian
    if (socket.readyState === WebSocket.OPEN) {
        console.log("Sending finish message");
        socket.send(buffer);
    } else {
        console.warn("Could not send finish message, socket not open. State: ", socket.readyState);
    }
  }

  function sendAudioData(socket: WebSocket, data: ArrayBuffer) {
    const headerByte1 = 0b00010001;
    const headerByte2 = 0b00100000;
    const headerByte3 = 0b00000000;
    const reservedByte = 0x00;
    const payloadSize = data.byteLength;
    const buffer = new ArrayBuffer(4 + 4 + payloadSize);
    const view = new DataView(buffer);
    view.setUint8(0, headerByte1);
    view.setUint8(1, headerByte2);
    view.setUint8(2, headerByte3);
    view.setUint8(3, reservedByte);
    view.setUint32(4, payloadSize, false);
    new Uint8Array(buffer, 8).set(new Uint8Array(data));
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(buffer);
    } else {
      console.error("WebSocket not open. Cannot send audio data.");
      setError("WebSocket connection lost. Please try restarting.");
      stopRecordingAndCloseSocket();
    }
  }

  async function startRecording() {
    if (!appKey || !accessKey || !resourceId) {
      setError("API keys or Resource ID are not configured.");
      console.error("API keys or Resource ID missing:", { appKey, accessKey, resourceId });
      return;
    }
    if (isRecording || isLoading) return;

    setTranscription("");
    setInterimTranscription("");
    setError(null);
    setIsLoading(true);
    connectIdRef.current = generateUUID();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream); // { mimeType: "audio/webm;codecs=opus" } - removed for wider compatibility initially, but PCM is needed.
      audioChunksRef.current = [];

      const wsUrl = "wss://openspeech.bytedance.com/api/v3/sauc/bigmodel";
      console.log(`Attempting to connect to WebSocket: ${wsUrl}`);
      socketRef.current = new WebSocket(wsUrl);
      socketRef.current.binaryType = "arraybuffer"; // Important for receiving binary messages

      socketRef.current.onopen = () => {
        console.log("WebSocket connected.");
        setIsLoading(false);
        setIsRecording(true);

        const initialRequestPayload = {
          header: {
            appid: appKey,
            cluster: "volc.sauc.common",
            custom_request_header: { 
                "X-Api-App-Key": appKey,
                "X-Api-Access-Key": accessKey,
                "X-Api-Resource-Id": resourceId,
                "X-Api-Connect-Id": connectIdRef.current,
            }
          },
          payload: {
            reqid: connectIdRef.current,
            appid: appKey,
            uid: "browser-user-" + generateUUID().substring(0,8),
            cluster: "volc.sauc.common",
            config: {
              workflow: "audio_in,resample,partition,vad,fe,decode,itn,text_post_process",
              audio: {
                format: "raw", // This implies we *must* send PCM data
                sample_rate: 16000,
                bits: 16,
                channel: 1,
                language: "zh-CN",
                frame_ms: 200,
              },
              request: {
                max_speech_duration: 30000,
                result_type: "both",
                show_utterances: true,
                punctuation: "true",
              },
            },
          }
        };
        const jsonPayload = JSON.stringify(initialRequestPayload);
        const headerByte1 = 0b00010001;
        const headerByte2 = 0b00010000;
        const headerByte3 = 0b00010000; // JSON, No Gzip
        const reservedByte = 0x00;
        const payloadBytes = new TextEncoder().encode(jsonPayload);
        const payloadSize = payloadBytes.byteLength;
        const buffer = new ArrayBuffer(4 + 4 + payloadSize);
        const view = new DataView(buffer);
        view.setUint8(0, headerByte1);
        view.setUint8(1, headerByte2);
        view.setUint8(2, headerByte3);
        view.setUint8(3, reservedByte);
        view.setUint32(4, payloadSize, false);
        new Uint8Array(buffer, 8).set(payloadBytes);
        if(socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            console.log("Sending initial Full Client Request:", initialRequestPayload);
            socketRef.current.send(buffer);
        } else {
            console.error("Failed to send initial request, socket not open.");
            setError("Failed to initialize connection with server.");
            setIsLoading(false);
            stopRecordingAndCloseSocket();
            return;
        }

        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.ondataavailable = async (event) => {
                if (event.data.size > 0 && socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
                    const arrayBuffer = await event.data.arrayBuffer();
                    console.log(`Sending audio chunk: ${arrayBuffer.byteLength} bytes. Format might be incorrect (expecting PCM).`);
                    sendAudioData(socketRef.current, arrayBuffer);
                }
            };
            mediaRecorderRef.current.start(200); // Slice data every 200ms
        }
      };

      socketRef.current.onmessage = (event) => {
        if (event.data instanceof ArrayBuffer) {
            const dataView = new DataView(event.data);
            const messageType = (dataView.getUint8(1) & 0xF0) >> 4;
            const serializationMethod = (dataView.getUint8(2) & 0xF0) >> 4;
            let payloadOffset = 4;

            if (messageType === 0b1111) { // Error response
                const errorCode = dataView.getUint32(payloadOffset, false);
                payloadOffset += 4;
                const payloadSize = dataView.getUint32(payloadOffset, false);
                payloadOffset += 4;
                const errorMsgBytes = new Uint8Array(event.data, payloadOffset, payloadSize);
                const errorMsg = new TextDecoder().decode(errorMsgBytes);
                console.error(`Server error: Code ${errorCode}, Message: ${errorMsg}`);
                setError(`Server error (${errorCode}): ${errorMsg}`);
                stopRecordingAndCloseSocket();
                return;
            }

            if (messageType === 0b1001) { // Full server response
                payloadOffset +=4; // Skip sequence (assuming 4 bytes)
                const payloadSize = dataView.getUint32(payloadOffset, false);
                payloadOffset += 4;
                const payloadData = new Uint8Array(event.data, payloadOffset, payloadSize);
                if (serializationMethod === 0b0001) { // JSON
                    try {
                        const messageText = new TextDecoder("utf-8").decode(payloadData);
                        const message = JSON.parse(messageText);
                        console.log("Received message from server:", message);
                        if (message.header && message.header.status !== 20000000 && message.header.message) {
                           setError(`Server error (${message.header.status}): ${message.header.message}`);
                           stopRecordingAndCloseSocket();
                           return;
                        }
                        if (message.payload && message.payload.result && message.payload.result.length > 0) {
                            let currentSentence = "";
                            let isFinalSegment = false;
                            message.payload.result.forEach((res: any) => {
                                currentSentence += res.text;
                                if (res.type === "final" || (message.payload.message_type_specific_flags & 0b0010)) {
                                    isFinalSegment = true;
                                }
                            });
                            if (isFinalSegment) {
                                setTranscription(prev => prev + currentSentence + " ");
                                setInterimTranscription("");
                            } else {
                                setInterimTranscription(currentSentence);
                            }
                        }
                        if (message.payload && message.payload.message_type_specific_flags === 0b0011 ) {
                            console.log("Received final transcription from server for the stream.");
                            // Consider if UI should auto-stop or allow further recordings in same session.
                        }
                    } catch (e) {
                        console.error("Failed to parse JSON response:", e);
                        setError("Failed to parse server response.");
                    }
                } else {
                    console.warn("Received non-JSON message or unknown serialization.");
                }
            } else {
                console.log("Received unhandled message type from server:", messageType.toString(2));
            }
        } else {
             console.log("Received non-binary message (e.g. text) from server:", event.data);
        }
      };

      socketRef.current.onerror = (wsEvent) => {
        console.error("WebSocket error:", wsEvent);
        setError("WebSocket connection error. Check console and API/network settings.");
        setIsLoading(false);
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
            mediaRecorderRef.current.stop();
        }
        if (mediaRecorderRef.current?.stream) {
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
        setIsRecording(false);
      };

      socketRef.current.onclose = (event) => {
        console.log("WebSocket closed:", event.code, event.reason);
        if (!error) setIsLoading(false);
        setIsRecording(false);
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
            mediaRecorderRef.current.stop();
        }
        if (mediaRecorderRef.current?.stream) {
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
        if (event.code !== 1000 && !error) {
             const closeReason = event.reason || "No reason provided";
             setError(`WebSocket closed: ${closeReason} (Code: ${event.code})`);
        }
      };

    } catch (err: any) {
      console.error("Error starting recording:", err);
      setError(`Failed to start recording: ${err.message || "Check microphone permissions and console."}`);
      setIsLoading(false);
      setIsRecording(false);
    }
  }

  function handleStopRecording() {
    stopRecordingAndCloseSocket();
  }

  return (
    <div className="flex flex-col items-center space-y-6 p-4 bg-gray-900 text-white rounded-lg shadow-xl max-w-2xl mx-auto">
      <div className="w-full p-6 bg-gray-800 rounded-md min-h-[150px] text-lg font-mono whitespace-pre-wrap overflow-y-auto">
        <span className="text-gray-400">{transcription}</span>
        <span className="text-blue-400">{interimTranscription}</span>
        {!transcription && !interimTranscription && !isRecording && !isLoading && (
          <p className="text-gray-500">Click "Start Recording" to begin.</p>
        )}
         {isLoading && !isRecording && (
          <p className="text-yellow-400">Connecting to transcription service...</p>
        )}
         {isRecording && (
          <p className="text-green-400 animate-pulse">Recording audio...</p>
        )}
      </div>

      {error && <p className="text-red-400 bg-red-900 p-3 rounded-md w-full text-sm">Error: {error}</p>}

      <div className="flex space-x-4">
        <button
          onClick={startRecording}
          disabled={isRecording || isLoading}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading && !isRecording ? "Connecting..." : isRecording? "Recording..." : "Start Recording"}
        </button>
        <button
          onClick={handleStopRecording}
          disabled={!isRecording && !isLoading}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Stop Recording
        </button>
      </div>
       <div className="mt-4 text-xs text-gray-500 w-full text-left">
        <p><strong>Status:</strong> {isRecording ? "Recording" : isLoading ? "Connecting..." : error ? "Error" : "Idle"}</p>
        <p><strong>App Key:</strong> {appKey ? `${appKey.substring(0, 5)}...` : "Not set"}</p>
        <p><strong>Access Key:</strong> {accessKey ? "Set (hidden)" : "Not set"}</p>
        <p><strong>Resource ID:</strong> {resourceId || "Not set"}</p>
        <p><strong>Connect ID:</strong> {connectIdRef.current}</p>
        <p className="mt-2 text-yellow-600">
            <strong>Important:</strong> This component attempts to send audio data directly from MediaRecorder.
            The Volcengine API expects raw PCM (16-bit, 16kHz, mono). MediaRecorder often outputs WebM/Opus.
            For reliable transcription, you MUST implement client-side audio conversion to PCM format before sending it via WebSocket.
            This typically involves using the Web Audio API (AudioContext, ScriptProcessorNode, or AudioWorkletNode).
        </p>
         <p className="mt-1 text-yellow-600">
            WebSocket authentication in browsers cannot directly set custom HTTP headers for the initial handshake.
            The current implementation sends auth details in the first WebSocket message post-connection. If the server strictly requires handshake headers, a backend proxy is necessary.
        </p>
      </div>
    </div>
  );
} 
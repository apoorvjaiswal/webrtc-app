import './style.css'
import firebase from 'firebase/app';
import 'firebase/firestore';
// document.querySelector('#app').innerHTML = `
//   <h1>Hello Vite!</h1>
//   <a href="https://vitejs.dev/guide/features.html" target="_blank">Documentation</a>
// `
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBVrCC0fmZ364Q4fPBpP-jpCn4f1TlkKJk",
  authDomain: "webrtc-project-ac68b.firebaseapp.com",
  projectId: "webrtc-project-ac68b",
  storageBucket: "webrtc-project-ac68b.appspot.com",
  messagingSenderId: "991614403539",
  appId: "1:991614403539:web:6ad879c7562df917b76526",
  measurementId: "G-1F6HQ5V6RZ"
};
if(!firebase.apps.length)
{
  firebase.initializeApp(firebaseConfig);
}
const firestore = firebase.firestore();
const servers={
iceServers: [
  {
    urls: ['stun"stun1.1.google.com.19302','stun.stun2.1.google.com:19302'],
  },
],
};
let pc=new RTCPeerConnection(servers);
let localStream=null;
let videoStream=null;

const webcamButton=document.getElementById('webcamButton');
const wecamVideo=document.getElementById('webcamVideo');
const callButton=document.getElementById('callButton');
const answerButton=document.getElementById('answerButton');
const callInput=document.getElementById('callInput');
const remoteVideo=document.getElementById('remoteVideo');
const hangupButton=document.getElementById('hangupButton');

webcamButton.onclick=async () => {
  localStream = await navigator.mediaDevices.getUserMedia({video: true, audio:"true"});
  remoteStream = new MediaStream();

  localStream.getTracks().forEach((track)=>{
    pc.addTrack(track, localStream);
  })
  pc.ontrack=event=>{
    event.strams[0].getTracks.forEach(track=>{
      remoteStream.addTrack(track);
    });
  };
  webcamVideo.srcObject=localStream;
  remoteVideo.srcObject=remoteStream;
};

callButton.onclick=async=>{
  const callDoc=firestore.collection('calls').doc();
const offerCandidates =callDoc.collection('offerCandidates');
const answerCandidates=callDoc.collection('answerCandidates');

callInput.value = callDoc.id;

pc.onicecandidate =event => {
  event.candidate && offerCandidates.add(event.candidate.toJSON());
};

const offerDescription=await pc.createOffer();
await pc.setLocalDescription(offerDescription);

const offer ={
  sdp : offerDescription.sdp,
  type: offerDescription.type,
};

await.callDoc.set({ offer });

callDoc.onSnapshot((snapshot) => {
  const data=snapshot.data();
  if(!pc.currentRemoteDescription&& data?.answer){
const answerDescription = new RTCSessionDescription(data.answer);
pc.setRemoteDescription(answerDescription);
  }
});

answerCandidates.onSnapshot(snapshot =>{
  snapshot.docChanges().forEach((change) => {
if(change.type==='added'){
    const candidate=new RTCIceCandidate(change.doc.data());
    pc.addIceCandidate(candidate);
}
  });
});
};
answerButton.onclick=async()=>{
  const callId=callInput.value;
  const callDoc=firestore.collection('calls').doc(callId);
  const answerCandidates  = callDoc.collection('answerCandiates');

  pc.onicecandidate=event=>{
    event.candidate&& answerCandidates.add(event.candidate.toJSON());
  };

  const callData=(await callDoc.get()).data();
  const offerDescription=callData.offer;
  await pc.setRemoteDescription(new RTCSessionDescription(offerDescription));

  const answerDescription = awaitpc.createAnswer();
  await pc.setLocalDescription(answerDescription);

  const answer = {
    type: answerDescription.type,
    sdp: answerDescription.sdp,
  };

  await callDoc.update({answer});

  offerCandidates.onSnapshot((snapshot) => {
    snapshot.docChanges().forEach((change)=>{
      console.log(change);
        if (change.type==='added') {
          let data = change.doc.data();
          pc.addIceCandidate(new RTCIceCandidate(data));
        }
    });
  }
  );
};
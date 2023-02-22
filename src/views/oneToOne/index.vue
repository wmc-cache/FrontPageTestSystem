<template>
    <ul v-for="(item, index) in roomUserList" :key="index">
        <el-tag size="small" @click="getStats" type="success">{{ '用户' + item.nickname }}</el-tag>

        <el-tag v-if="userInfo.userId === item.userId" type="danger" size="small"
            @click="changeBitRate()">增加比特率</el-tag>

        <el-button size="small" type="primary" v-if="userInfo.userId !== item.userId" @click="call(item)">通话</el-button>

        <el-button v-if="userInfo.userId === item.userId" size="small" type="danger"
            @click="openVideoOrNot">切换</el-button>
    </ul>

    <el-form :model="formInline" label-width="250px" class="demo-form-inline">
        <el-form-item label="发送消息">
            <el-input v-model="formInline.rtcmessage" placeholder="消息"></el-input>
        </el-form-item>
        <el-form-item label="远端消息">
            <div>{{ formInline.rtcmessageRes }}</div>
        </el-form-item>

        <el-form-item>
            <el-button type="primary" size="small" @click="sendMessageUserRtcChannel">点击发送</el-button>
        </el-form-item>
    </el-form>

    <video style="width:200px;height:200px" @click="streamInfo('localdemo01')" id="localdemo01" autoplay controls
        muted></video>
    <video style="width:500px;height:500px" @click="streamInfo('remoteVideo01')" id="remoteVideo01" autoplay controls
        muted></video>
</template>

<script lang="ts" setup>
import {
    onMounted,
    reactive
} from "vue";
import {
    getParams,
    getLocalUserMedia
} from "./utils/index"
import {
    io
} from "socket.io-client";

interface UserInfo {
    userId: string | null,
    roomId: string | null,
    nickname: string | null
}

// @ts-ignore
const PeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;

onMounted(() => {
    if (getParams("userId")) {
        init(getParams("userId"), getParams("roomId"), getParams('userId'))
    }
})

let userInfo = reactive<UserInfo>({
    userId: '',
    roomId: '',
    nickname: ''
})
let linkSocket: any
let roomUserList = reactive<UserInfo[]>([])
let channel: any
let formInline = reactive({
    rtcmessage: '',
    rtcmessageRes: [''], //响应
})
let mapSender //发送的媒体
/**
 * 本地实例化后的PeerConnection实例
 */
let localRtcPc: any

/**
 * 点击远程呼叫
 * @param e 
 */
async function onCall(e: {
    data: {
        [x: string]: string;
    }
}) {
    console.log("远程呼叫：", e)
    await initCalleeInfo(e.data['targetUid'], e.data['userId'])
}

//初始化socket连接
function init(userId: string | null, roomId: string | null, nickname: string | null) {
    userInfo.userId = userId
    userInfo.roomId = roomId
    userInfo.nickname = nickname
    // @ts-ignore
    linkSocket = io(window.serverSocketUrl, {
        reconnectionDelayMax: 10000,
        transports: ["websocket"],
        query: {
            "userId": userId,
            "roomId": roomId,
            "nickname": nickname
        }
    });
    linkSocket.on("connect", (e: any) => {
        console.log("server init connect success", linkSocket)
    })
    linkSocket.on("roomUserList", (e: UserInfo[]) => {
        roomUserList.length = 0
        roomUserList.push(...e)
        console.log("roomUserList", roomUserList)
    })
    linkSocket.on("msg", async (e: any) => {
        console.log("msg", e)
        if (e['type'] === 'join' || e['type'] === 'leave') {
            setTimeout(() => {
                let params = {
                    "roomId": getParams('roomId')
                }
                linkSocket.emit('roomUserList', params)
            }, 1000)
        }
        if (e['type'] === 'call') {
            await onCall(e)
        }
        if (e['type'] === 'offer') {
            await onRemoteOffer(e['data']['userId'], e['data']['offer'])
        }
        if (e['type'] === 'answer') {
            await onRemoteAnswer(e['data']['userId'], e['data']['answer'])
        }
        if (e['type'] === 'candidate') {
            localRtcPc.addIceCandidate(e.data.candidate)
        }
    })
    linkSocket.on("error", (e: any) => {
        console.log("error", e)
    })
}

function call(item: UserInfo) {
    initCallerInfo(getParams('userId'), item.userId)
    let params = {
        "userId": getParams('userId'),
        "targetUid": item.userId
    }
    linkSocket.emit('call', params)
}

/**
 * 设置VideoStream
 * @param domId 
 * @param newStream 
 */
async function setDomVideoStream(domId: string, newStream: void | MediaStream) {
    let video: any = document.getElementById(domId)
    let stream = video.srcObject
    if (stream) {
        stream.getAudioTracks().forEach((e: any) => {
            stream.removeTrack(e)
        })
        stream.getVideoTracks().forEach((e: any) => {
            stream.removeTrack(e)
        })
    }
    video.srcObject = newStream
    video.muted = true
}
/**
 * 设置RemoteVideoStream
 * @param domId 
 * @param track 
 */
function setRemoteDomVideoStream(domId: string, track: MediaStreamTrack) {
    let video: any = document.getElementById(domId)
    let stream = video.srcObject
    if (stream) {
        stream.addTrack(track)
    } else {
        let newStream = new MediaStream()
        newStream.addTrack(track)
        video.srcObject = newStream
        video.muted = true
    }
}

/**
 * 查看MediaStream信息
 * @param domId
 */
function streamInfo(domId: string) {
    let video: any = document.getElementById(domId)
    console.log(video.srcObject)
}

/**
 * 
 * @param pc 
 * @param localUid 
 * @param remoteUid 
 */
function onPcEvent(pc: any, localUid: string | null, remoteUid: string | null) {
    channel = pc.createDataChannel("chat");
    //监听远程媒体轨道即远端音视频信息
    pc.ontrack = function (event: {
        track: MediaStreamTrack
    }) {
        console.log(event)
        setRemoteDomVideoStream("remoteVideo01", event.track)
    };

    pc.onnegotiationneeded = function (e: any) {
        console.log("重新协商", e)
    }
    // 创建datachannel后监听回调以及 p2p消息监听
    pc.ondatachannel = function (ev: {
        channel: {
            onopen: () => void; onmessage: (data: any) => void; onclose: () => void;
        };
    }) {
        console.log('Data channel is created!');
        ev.channel.onopen = function () {
            console.log('Data channel ------------open----------------');
        };
        ev.channel.onmessage = function (data) {
            console.log('Data channel ------------msg----------------', data);
            formInline.rtcmessageRes.push(data.data)
        };
        ev.channel.onclose = function () {
            console.log('Data channel ------------close----------------');
        };
    };
    // ICE 候选监听
    pc.onicecandidate = (event: {
        candidate: any
    }) => {
        if (event.candidate) {
            linkSocket.emit('candidate', {
                'targetUid': remoteUid,
                "userId": localUid,
                "candidate": event.candidate
            })
        } else {
            /* 在此次协商中，没有更多的候选了 */
            console.log("在此次协商中，没有更多的候选了")
        }
    }
}

/**
 * 呼叫端的过程
 * @param callerId 
 * @param calleeId 
 */
async function initCallerInfo(callerId: string | null, calleeId: string | null) {
    mapSender = []
    //初始化pc
    localRtcPc = new PeerConnection()
    //获取本地媒体并添加到pc中
    let localStream = await getLocalUserMedia({
        audio: true,
        video: true
    })
    // @ts-ignore
    for (const track of localStream.getTracks()) {
        mapSender.push(localRtcPc.addTrack(track));
    }
    // 本地dom渲染
    await setDomVideoStream("localdemo01", localStream)
    //回调监听
    onPcEvent(localRtcPc, callerId, calleeId)
    //创建offer
    let offer = await localRtcPc.createOffer({
        iceRestart: true
    });
    //设置offer未本地描述
    await localRtcPc.setLocalDescription(offer)
    //发送offer给被呼叫端
    let params = {
        "targetUid": calleeId,
        "userId": callerId,
        "offer": offer
    }

    linkSocket.emit("offer", params)
}

/**
 * 被呼叫端的过程
 * @param localUid 
 * @param fromUid 
 */
async function initCalleeInfo(localUid: string, fromUid: string) {
    //初始化pc
    localRtcPc = new PeerConnection()
    //初始化本地媒体信息
    let localStream = await getLocalUserMedia({
        audio: true,
        video: true
    })
    // @ts-ignore
    for (const track of localStream.getTracks()) {
        localRtcPc.addTrack(track);
    }
    // dom渲染
    await setDomVideoStream("localdemo01", localStream)
    //监听
    onPcEvent(localRtcPc, localUid, fromUid)

}

/**
 * 处理远程的Offer
 * @param fromUid 
 * @param offer 
 */
async function onRemoteOffer(fromUid: string, offer: any) {
    localRtcPc.setRemoteDescription(offer)
    let answer = await localRtcPc.createAnswer();
    await localRtcPc.setLocalDescription(answer);
    let params = {
        "targetUid": fromUid,
        "userId": getParams("userId"),
        "answer": answer
    }
    linkSocket.emit("answer", params)
}
/**
 * 处理远程的Answer
 * @param fromUid 
 * @param answer 
 */
async function onRemoteAnswer(fromUid: string, answer: any) {
    await localRtcPc.setRemoteDescription(answer);
}

function getStats() {

}

/**
 * 发送文字信息
 */
function sendMessageUserRtcChannel() {
    if (!channel) {
        alert("请先建立webrtc连接")
    }
    channel.send(formInline.rtcmessage)
    formInline.rtcmessage = ""
}
/**      
 *  增加比特率（单位时间内传送的比特（bit）数）
 */
function changeBitRate() {
    const senders = localRtcPc.getSenders();
    const send = senders.find((s: any) => s.track.kind === 'video')
    const parameters = send.getParameters();
    parameters.encodings[0].maxBitrate = 1 * 1000 * 1024;
    send.setParameters(parameters);
}
/**
 * 打开或关闭摄像头
 */
function openVideoOrNot() {
    const senders = localRtcPc.getSenders();
    const send = senders.find((s: any) => s.track.kind === 'video')
    send.track.enabled = !send.track.enabled //控制视频显示与否
}
</script>

<template>
    Janus
</template>



<script setup>

import Janus from "@/utils/Janus.js";
import { onMounted } from "vue";
import adapter from 'webrtc-adapter';

let janus, videoCallPluginHandle

function initJanus() {
    Janus.init({
        debug: true,
        dependencies: Janus.useDefaultDependencies({
            adapter: adapter
        }),
        callback: () => {
            if (!Janus.isWebrtcSupported()) {
                Janus.log('is not Supported Webrtc!');
                return;
            }
        }
    });
    //客户端唯一标识
    let opaqueId = "videocall-" + Janus.randomString(12);
    console.log("opaqueId", opaqueId)
    // 注册：
    janus = new Janus({
        server: 'http://localhost:18088/janus',
        apisecret: 'wumengcheng',
        success: function () {
            Janus.log("初始化成功")
        },
        error: function (cause) {
            Janus.log("初始化失败", cause)
        },
        destroyed: function () {
            Janus.log("destroyed")
        }
    });
}

function initVideoCallPlugin() {
    janus.attach({
        plugin: "janus.plugin.videocall",
        success(pluginHandle) {
            //插件初始化成功后 pluginHandle 就是全局句柄，通过 pluginHandle可以操作当前
            //会话的所有功能
            videoCallPluginHandle = pluginHandle
            console.log("视频呼叫插件初始化成功", videoCallPluginHandle)
        },
        error() {
            //插件初始化失败
        },
    });
}

onMounted(() => {
    initJanus()

    setTimeout(() => {
        initVideoCallPlugin()
    }, 5000);

})
</script>
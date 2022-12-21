export function handleError(error: Error) {
    // alert("摄像头无法正常使用，请检查是否占用或缺失")
    console.error('navigator.MediaDevices.getUserMedia error: ', error.message, error.name);
}

export function getParams(queryName: string) {
    let url = window.location.href
    let query = decodeURI(url.split('?')[1]);
    let vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if (pair[0] === queryName) {
            return pair[1];
        }
    }
    return null;
}

/**
 * 获取设备 stream
 * @param constraints
 * @returns {Promise<MediaStream>}
 */
export async function getLocalUserMedia(constraints: MediaStreamConstraints) {
    return await navigator.mediaDevices.getUserMedia(constraints).catch(handleError)
}
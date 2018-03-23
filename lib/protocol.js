/**
 * Created by chenlizan on 2017/8/19.
 */

const HEADER = 5;

const bt2Str = (byteArray, start, end) => {
    let result = "";
    for (let i = start; i < byteArray.length && i < end; i++) {
        result = result + String.fromCharCode(byteArray[i]);
    }
    return result;
}

class Protocol {
    constructor() {
    }

    /**
     * pomele client encode. socketIo current support string
     * @param id message id
     * @param route message route
     * @param msg message body
     */
    encode(id, route, msg) {
        let msgStr = JSON.stringify(msg);
        if (route.length > 255) {
            throw new Error('route maxlength is overflow');
        }
        let byteArray = new Uint16Array(HEADER + route.length + msgStr.length);
        let index = 0;
        byteArray[index++] = (id >> 24) & 0xFF;
        byteArray[index++] = (id >> 16) & 0xFF;
        byteArray[index++] = (id >> 8) & 0xFF;
        byteArray[index++] = id & 0xFF;
        byteArray[index++] = route.length & 0xFF;
        for (let i = 0; i < route.length; i++) {
            byteArray[index++] = route.charCodeAt(i);
        }
        for (let i = 0; i < msgStr.length; i++) {
            byteArray[index++] = msgStr.charCodeAt(i);
        }
        return bt2Str(byteArray, 0, byteArray.length);
    }

    /**
     * pomele client decode
     * @param msg String data
     * @returns {{id: number, route, body}}
     */
    decode(msg) {
        let idx, len = msg.length, arr = new Array(len);
        for (idx = 0; idx < len; ++idx) {
            arr[idx] = msg.charCodeAt(idx);
        }
        let index = 0;
        let buf = new Uint16Array(arr);
        let id = ((buf[index++] << 24) | (buf[index++]) << 16 | (buf[index++]) << 8 | buf[index++]) >>> 0;
        let routeLen = buf[HEADER - 1];
        let route = bt2Str(buf, HEADER, routeLen + HEADER);
        let body = bt2Str(buf, routeLen + HEADER, buf.length);
        return {id: id, route: route, body: body};
    };
}

module.exports = new Protocol();
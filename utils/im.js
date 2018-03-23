/**
 * Created by chenlizan on 2018/3/23.
 */

const Pomelo = require('../lib/pomelo.js');
const pomelo = new Pomelo();

// pomelo.on('onChat', function (data) {
// 接收消息
// });
// pomelo.on('onAdd', function (data) {
// 用户上线
// });
// pomelo.on('onLeave', function (data) {
// 用户下线
// });

const queryEntry = (uid, callback) => {
    const route = 'gate.gateHandler.queryEntry';
    pomelo.init({
        host: '127.0.0.1',
        port: 3014,
        log: true
    }, function () {
        pomelo.request(route, {
            uid: uid
        }, function (data) {
            pomelo.disconnect();
            if (data.code === 500) {
                pomelo.disconnect();
                return;
            }
            callback(data.host, data.port);
        });
    });
};

class IM {
    constructor() {
        this.pomelo = pomelo;
    }

    loginIm = (uid) => {
        queryEntry(uid, function (host, port) {
            pomelo.init({
                host: host,
                port: port,
                log: true
            }, function () {
                const route = "connector.entryHandler.enter";
                pomelo.request(route, {
                    username: uid,
                    rid: 'ybl'
                }, function (data) {
                    if (data.error) {
                        console.log(data.error);
                        return false;
                    }
                    return true;
                });
            });
        });
    };

    sendIm = (from, target, msg) => {
        try {
            const route = "chat.chatHandler.send";
            pomelo.request(route, {
                rid: 'ybl',
                content: msg,
                from: from,
                target: target
            }, function (data) {
                if (data.error) {
                    console.log(data.error);
                    return false;
                }
                return true;
            });
        }
        catch (err) {
            return err;
        }
    };

}

module.exports = new IM();

/**
 * Created by chenlizan on 2017/8/19.
 */

const EventEmitter = require('./events').EventEmitter;
const Socket = require('./socket').default;
const Protocol = require('./protocol');

class Pomelo extends EventEmitter {
    constructor() {
        super();
        this.id = 1;
        this.params = null;
        this.socket = null;
        this.callbacks = {};
    }

    init(params, cb) {
        const _this = this;
        this.params = params;
        params.debug = true;
        var host = params.host;
        var port = params.port;

        var url = 'wss://' + host;
        if (port) {
            url += ':' + port;
        }

        this.socket = Socket(url, {'force new connection': true, reconnect: false});

        this.socket.on('connect', function () {
            console.log('[pomeloclient.init] websocket connected!');
            if (cb) {
                cb(this.socket);
            }
        });

        this.socket.on('reconnect', () => {
            console.log('reconnect');
        });

        this.socket.on('message', (data) => {
            if (typeof data === 'string') {
                data = JSON.parse(data);
            }
            if (data instanceof Array) {
                _this.processMessageBatch(this, data);
            } else {
                _this.processMessage(this, data);
            }
        });

        this.socket.on('error', (err) => {
            console.log(err);
        });

        this.socket.on('disconnect', (reason) => {
            _this.emit('disconnect', reason);
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    request(route) {
        if (!route) {
            return;
        }
        let msg = {};
        let cb;
        const args = Array.prototype.slice.apply(arguments);
        if (args.length === 2) {
            if (typeof args[1] === 'function') {
                cb = args[1];
            } else if (typeof args[1] === 'object') {
                msg = args[1];
            }
        } else if (args.length === 3) {
            msg = args[1];
            cb = args[2];
        }
        msg = this.filter(msg, route);
        this.id++;
        this.callbacks[this.id] = cb;
        const sg = Protocol.encode(this.id, route, msg);
        this.socket.emit('message', sg);
    }

    notify(route, msg) {
        this.request(route, msg);
    }

    processMessage(pomelo, msg) {
        if (msg.id) {
            //if have a id then find the callback function with the request
            const cb = this.callbacks[msg.id];

            delete this.callbacks[msg.id];
            if (typeof cb !== 'function') {
                console.log('[pomeloclient.processMessage] cb is not a function for request ' + msg.id);
                return;
            }

            cb(msg.body);
            return;
        }

        //if no id then it should be a server push message
        const processCall = (msg) => {
            const route = msg.route;
            if (!!route) {
                if (!!msg.body) {
                    let body = msg.body.body;
                    if (!body) {
                        body = msg.body;
                    }
                    pomelo.emit(route, body);
                } else {
                    pomelo.emit(route, msg);
                }
            } else {
                pomelo.emit(msg.body.route, msg.body);
            }
        }

        // server push message or old format message
        processCall(msg);
    }

    processMessageBatch(pomelo, msgs) {
        for (let i = 0, l = msgs.length; i < l; i++) {
            this.processMessage(pomelo, msgs[i]);
        }
    };

    filter(msg, route) {
        if (route.indexOf('area.') === 0) {
            msg.areaId = pomelo.areaId;
        }

        msg.timestamp = Date.now();
        return msg;
    }
}

module.exports = Pomelo;

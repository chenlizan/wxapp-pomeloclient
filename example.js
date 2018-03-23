/**
 * Created by chenlizan on 2018/3/23.
 */

import IM from './utils/im.js'

IM.pomelo.on('onChat', function (data) {
    console.log('onChat \n' + JSON.stringify(data));
});

// app.js
App({
    onLaunch: function () {
        IM.loginIm('wxapp');
        this.globalData.IM = IM
    },

    globalData: {},
});

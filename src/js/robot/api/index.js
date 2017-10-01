import io from 'socket.io-client';
import contacts from '../../stores/contacts';
import chat from '../../stores/chat';
import helper from 'utils/helper';

const SOCKET_IO_URL = 'http://127.0.0.1:3009';

const API = {
    init: () => {
        const socket = io(SOCKET_IO_URL);
        socket.on('news', function(msg) {
            console.log('get msg from manager:', msg);
            var _msg = JSON.parse(msg);
            var list = contacts.memberList;
            list = list.filter(e => helper.isChatRoom(e.UserName));
            // batchSend(msg);
            batchSend(list, _msg);
        });
    },
};

// async function batchSend(msg) {
//     // await stores.contacts.getContats();
//     var list = contacts.memberList;
//     await Promise.all(
//         list.filter(e => helper.isChatRoom(e.UserName)).map(async e => {
//             console.log('get chat room:' + e.UserName, e, e.NickName);
//             // TODO test data
//             if (e.NickName === 'One') {
//                 let res = await chat.sendMessage(e, {
//                     content: JSON.stringify(msg),
//                     type: 1,
//                 }, true);
//                 if (!res) {
//                     console.log('Send message failed. to:', e.NickName);
//                 }
//             }
// 
//             return true;
//         })
//     );
// }
async function batchSend(list, msg) {
    var files = msg.files;

    dealFiles(files, (windowFiles) => {
        console.log('---size:', windowFiles.length);
        var fileMessages = {};
        list.map(async user => {
            windowFiles.map(async(file, index) => {
                if (fileMessages[index]) {
                    await chat.sendMessage(user, fileMessages[index], true)
                        .catch(ex => console.log(`Send message to ${user.NickName} is failed!`));
                } else {
                    // Do not repeat upload file, forward the message to another user
                    fileMessages[index] = await chat.process(file, user);
                    if (fileMessages[index] === false) {
                        console.log(`Send message to ${user.NickName} is failed!`);
                    }
                }
            });
            if (msg.texts && msg.texts.length >= 1) {
                msg.texts.map(async text => {
                    let res = await chat.sendMessage(user, {
                        content: text,
                        type: 1,
                    }, true);
                    if (!res) {
                        console.log('Send message failed. to:', user.NickName);
                    }
                });
            }
            // if (true || user.NickName === 'One' || user.NickName === 'Test') {
            // }
            return true;
        });
    });
}
function dealFiles(files, cb) {
    var dealCount = 0;
    var resFiles = [];
    if (files && files.length >= 1) {
        files.map(async file => {
            var xhr = new window.XMLHttpRequest();
            xhr.open('get', file.path, true);
            xhr.responseType = 'blob';
            xhr.onload = function() {
                dealCount++;
                if (this.status === 200) {
                    var blob = this.response;
                    let parts = [
                        blob
                    ];
                    // NOTE: 第二个参数filename. 现传值 file.path
                    let wFile = new window.File(parts, file.path, {
                        lastModified: new Date(),
                        type: 'image/png'
                    });
                    resFiles.push(wFile);
                }
                if (dealCount === files.length) {
                    cb(resFiles);
                }
            };
            xhr.send();
        });
    } else {
        cb(resFiles);
    }
}

export default API;

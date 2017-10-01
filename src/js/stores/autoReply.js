
import { observable, action } from 'mobx';

import storage from 'utils/storage';
import helper from 'utils/helper';
import tuling from './tuling';
import chat from './chat';

class AutoReply {
    @observable openAutoReply = false;
    @observable autoReplyUsers = {
        'friends': [],
        'groups': [],
    };

    @action setOpenAutoReply(openAutoReply) {
        self.openAutoReply = openAutoReply;
        self.save();
    }

    @action setAutoReplyUsersFriends(users) {
        self.autoReplyUsers.friends = users;
        self.save();
    }

    @action async addFriendUser(user) {
        var list = [user, ...self.autoReplyUsers.friends.filter(e => e.UserName !== user.UserName)];
        self.autoReplyUsers.friends = list;

        await storage.set('autoReplyUsers', self.autoReplyUsers);
    }

    @action async addGroupUser(user) {
        var list = [user, ...self.autoReplyUsers.groups.filter(e => e.UserName !== user.UserName)];
        self.autoReplyUsers.groups = list;

        await storage.set('autoReplyUsers', self.autoReplyUsers);
    }

    @action async delFriendUser(user) {
        var list = self.autoReplyUsers.friends.filter(e => e.UserName !== user.UserName);
        self.autoReplyUsers.friends = list;

        await storage.set('autoReplyUsers', self.autoReplyUsers);
    }

    @action async delGroupUser(user) {
        var list = self.autoReplyUsers.groups.filter(e => e.UserName !== user.UserName);
        self.autoReplyUsers.groups = list;

        await storage.set('autoReplyUsers', self.autoReplyUsers);
    }

    @action setAutoReplyUsersGroups(users) {
        self.autoReplyUsers.groups = users;
        self.save();
    }

    @action getAutoReplyFriends(users) {
        return self.autoReplyUsers.friends;
    }

    @action getAutoReplyGroups(users) {
        return self.autoReplyUsers.groups;
    }

    @action autoReply(user) {
        return !!self.autoReplyUsers.groups.find(e => e.UserName === user.UserName) || !!self.autoReplyUsers.friends.find(e => e.UserName === user.UserName);
    }

    @action async init() {
        var autoReply = await storage.get('autoReply');
        var { openAutoReply, autoReplyUsers } = self;

        if (autoReply && Object.keys(autoReply).length) {
            // Use !! force convert to a bool value
            self.openAutoReply = !!autoReply.openAutoReply;
            self.autoReplyUsers = autoReply.autoReplyUsers || {};
        } else {
            await storage.set('autoReply', {
                openAutoReply,
                autoReplyUsers,
            });
        }

        self.save();
        return autoReply;
    }

    @action do(user, message) {
        var messageContent = helper.getMessageContent(message) || '未知';

        // if (messageContent === 'members' && helper.isChatRoom(user.UserName) {
        //     user.MemberList.map(e => {                
        //     })
        // }
        var isReCall = message.MsgType === 10002;
        if (!isReCall && self.autoReply(user)) {
            var mUserId = message.FromUserName.toString().replace('@', '');
            tuling.cloudAI(mUserId, messageContent, (data) => {
                if (data && data.code === 100000) {
                    messageContent = data.text;
                } else if (data) {
                    messageContent = 'AI 异常';
                } else {
                    messageContent = '网络异常';
                }
                chat.sendMessage(user, {
                    content: messageContent,
                    type: 1,
                });
            });
        }
    }

    save() {
        var { openAutoReply, autoReplyUsers } = self;

        storage.set('autoReply', {
            openAutoReply,
            autoReplyUsers,
        });
    }
}

const self = new AutoReply();
export default self;

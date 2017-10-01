
import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';

import Search from './Search';
import classes from './style.css';

@inject(stores => ({
    autoReplyUsers: stores.autoReply.autoReplyUsers,
    delUser: (user, isFriend = false) => {
        if (isFriend) {
            stores.autoReply.delFriendUser(user);
        } else {
            stores.autoReply.delGroupUser(user);
        }
    },
    clear: (e) => {
        e.preventDefault();
        e.stopPropagation();

        stores.search.clearHistory();
        stores.search.reset();
    }
}))
@observer
export default class AutoReply extends Component {
    timer;

    renderUser(user, isFriend) {
        return (
            <div className={classes.user} onClick={e => this.props.delUser(user, isFriend)} data-userid={user.UserName}>
                <img src={user.HeadImgUrl} />

                <div className={classes.info}>
                    <p className={classes.username} dangerouslySetInnerHTML={{__html: user.RemarkName || user.NickName}} />

                    <span className={classes.signature} dangerouslySetInnerHTML={{__html: user.Signature || 'No Signature'}} />
                </div>
            </div>
        );
    }

    renderList(list, title) {
        if (!list.length) return false;

        return (
            <div>
                <header>
                    <h3>{title}</h3>
                </header>
                {
                    list.map((e, index) => {
                        return (
                            <div key={index}>
                                {this.renderUser(e, title.toLowerCase() === 'friend')}
                            </div>
                        );
                    })
                }
            </div>
        );
    }

    render() {
        var { autoReplyUsers } = this.props;

        var friends = autoReplyUsers.friends;
        var groups = autoReplyUsers.groups;

        return (
            <div className={classes.container}>
                <div className={classes.column}>
                    <Search />
                </div>
                <div className={classes.column}>
                    <div className={classes.userList}>
                        <header>
                            <h3>Auto Reply List</h3>
                        </header>
                        <div>
                            {this.renderList(friends, 'Friend')}
                            {this.renderList(groups, 'Group')}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

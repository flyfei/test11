
/* eslint-disable no-eval */
import axios from 'axios';
import { action } from 'mobx';

class TuLing {
    syncKey;

    @action async cloudAI(userid, info, callback) {
        var response = await axios.post('http://www.tuling123.com/openapi/api', {
            key: 'ce10f3fa65e6e62f896ad69b30b2d2b3',
            info: info,
            userid: userid,
        });

        Promise.resolve(response.data).then(function(data) {
            callback(data);
        });
    }
}

const self = new TuLing();
export default self;

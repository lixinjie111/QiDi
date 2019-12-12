/**
 * 日期时间格式化
 */
class TDate {
    constructor(){

    }
    static formatTime(value,type='yy-mm-dd hh:mm:ss'){
        let tDate = value ? new Date(value) : new Date();
        const year = tDate.getFullYear();
        const month = this.formatNum(tDate.getMonth() + 1);
        const day = this.formatNum(tDate.getDate());
        const hour = this.formatNum(tDate.getHours());
        const minutes = this.formatNum(tDate.getMinutes());
        const seconds = this.formatNum(tDate.getSeconds());
        const millisecond = this.formatNum(tDate.getMilliseconds());
        if(type == 'yy-mm-dd'){
            return year + '-' + month + '-' + day;
        }else if(type == 'yy-mm-dd hh:mm:ss'){
            return year + '-' + month + '-' + day + ' ' + hour + ':' + minutes + ':' + seconds;
        }else if(type == 'yy-mm-dd hh:mm:ss:ms'){
            return year + '-' + month + '-' + day + ' ' + hour + ':' + minutes + ':' + seconds + '.' + millisecond;
        }else if(type == 'hh:mm:ss:ms'){
            return  hour + ':' + minutes + ':' + seconds + '.' + millisecond;
        }else {
            return year + '-' + month + '-' + day + ' ' + hour + ':' + minutes + ':' + seconds;
        }
    }
    static formatNum(value){
        return value < 10 ? '0' + value : value;
    }
    static dateToMs (date) {//日期转时间戳
        let result = new Date(date).getTime();
        return result;
    }
}

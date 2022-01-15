/**
 * ====================================================================
 * Hachiware_Server_module_log
 * 
 * Log output module of web server package "hachiware_server".
 * 
 * Author : Nakatsuji Masato 
 * ====================================================================
 */
 
const fs = require("fs");
const tool = require("hachiware_tool");
const path0 = require("path");

module.exports = function(conf, modules){

    /**
     * defaultConvert
     * @param {*} strs 
     * @param {*} date 
     * @param {*} conf 
     * @returns 
     */
    const defaultConvert = function(strs, date, conf){

        strs = strs.replace("{DATETIME}", tool.getDateFormat("{DATETIME}",date));
        strs = strs.replace("{DATE}", tool.getDateFormat("{DATE}",date));
        strs = strs.replace("{TIME}", tool.getDateFormat("{TIME}",date));
        strs = strs.replace("{YYYY}", tool.getDateFormat("{YYYY}",date));
        strs = strs.replace("{MM}", tool.getDateFormat("{MM}",date));
        strs = strs.replace("{M}", tool.getDateFormat("{M}",date));
        strs = strs.replace("{DD}", tool.getDateFormat("{DD}",date));
        strs = strs.replace("{D}", tool.getDateFormat("{D}",date));
        strs = strs.replace("{HH}", tool.getDateFormat("{HH}",date));
        strs = strs.replace("{H}", tool.getDateFormat("{H}",date));
        strs = strs.replace("{mm}", tool.getDateFormat("{mm}",date));
        strs = strs.replace("{m}", tool.getDateFormat("{m}",date));
        strs = strs.replace("{ss}", tool.getDateFormat("{ss}",date));
        strs = strs.replace("{s}", tool.getDateFormat("{s}",date));
        strs = strs.replace("{HOST}", conf.host);
        strs = strs.replace("{PORT}", conf.port);

        if(conf.ssl){
            var ssl = true;
            var url = "https://" + conf._host;
        }
        else{
            var ssl = false;
            var url = "http://" + conf._host;
        }

        strs = strs.replace("{SSL}", ssl);
        strs = strs.replace("{LISTEN_URI}", url);
        strs = strs.replace("{CONF_FILE}", path0.basename(conf._file));

        return strs;
    };

    /**
     * defaultMkDir
     * @param {*} logPath 
     */
    const defaultMkDir = function(logPath){

        if(!fs.existsSync(logPath)){
            var logDirs = logPath.split("/");

            if(logDirs.length > 1){
                var _dirPath = "";
                for(var n = 0 ; n < logDirs.length - 1 ; n++){
                    _dirPath += logDirs[n] + "/";
                    try{
                        fs.mkdirSync(_dirPath);						
                    }catch(err){}
                }	
            }	
        }

    };

    /**
     * fookStartEnd
     * @param {*} mode 
     * @returns 
     */
    const fookStartEnd = function(mode){

        if(!tool.objExists(conf,"logs.startEnd")){
            return;
        }

        var startEnd = conf.logs.startEnd;

        if(!startEnd.enable){
            return;
        }

        var logPath = "logs/startEnd/startEnd.log";
        if(startEnd.path){
            logPath = startEnd.path;
        }

        var contents = "[{DATETIME}] MODE={MODE} HOST={HOST} PORT={PORT} SSL={SSL} CONF={CONF_FILE}";
        if(startEnd.contents){
            contents = startEnd.contents;
        }

        var d = new Date();

        logPath = defaultConvert(logPath, d, conf);
        contents = defaultConvert(contents, d, conf);

        defaultMkDir(logPath);

        var url = conf._host;

        if(mode){
            mode = "START";
        }
        else{
            mode = "END";
        }

        if(conf.ssl){
            url = "https://" + url;
        }
        else{
            url = "http://" + url;
        }
        contents = contents.replace("{MODE}", mode);

        if(startEnd.callback){
            var buff = startEnd.callback(contents, conf);
            if(buff){
                contents = buff;
            }
        }

        fs.appendFileSync(logPath, contents + "\n");

    };

    /**
     * fookStart
     */
    this.fookStart = function(){
        fookStartEnd(true);
    };

    /**
     * fookEnd
     */
    this.fookEnd = function(){
        fookStartEnd(false);
    };

    /**
     * fookAccess
     * @param {*} resolve 
     * @param {*} req 
     * @param {*} res 
     */
    this.fooKAccess = function(resolve, req, res){

        if(!tool.objExists(conf,"logs.access")){
            return;
        }

        var access = conf.logs.access;

        if(!access.enable){
            return;
        }

        var logPath = "logs/access/access-{YYYY}-{MM}.log";
        if(access.path){
            logPath = access.path;
        }

        var contents = "[{DATETIME}] METHOD={METHOD} REQUEST_URI={REQUEST_URL} REMOTE_IP={REMOTE_IP} RESPONSE_CODE={RESPONSE_CODE}";
        if(access.contents){
            contents = access.contents;
        }

        var d = new Date();

        logPath = defaultConvert(logPath, d, conf);
        contents = defaultConvert(contents, d, conf);

        defaultMkDir(logPath);

        var method = req.method;
        var requestUrl = req.url;
        var responseCode = res.statusCode;
        var remoteIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        var query = req.query;

        contents = contents.replace("{METHOD}", method);
        contents = contents.replace("{REQUEST_URL}", requestUrl);
        contents = contents.replace("{RESPONSE_CODE}", responseCode);
        contents = contents.replace("{REMOTE_IP}", remoteIp);
        contents = contents.replace("{REQUEST_QUERY}", JSON.stringify(query));

        if(access.callback){
            var buff = access.callback(contents, conf, req, res);
            if(buff){
                contents = buff;
            }
        }

        fs.appendFileSync(logPath, contents + "\n");
        
        resolve();
    };

    /**
     * fookError
     * @param {*} resolve 
     * @param {*} error 
     * @param {*} req 
     * @param {*} res 
     */
    this.fookError = function(resolve, errorException, req, res){

        if(!tool.objExists(conf,"logs.error")){
            return;
        }

        var errLog = conf.logs.error;

        if(!errLog.enable){
            return;
        }

        var logPath = "logs/error/error-{YYYY}-{MM}.log";
        if(errLog.path){
            logPath = errLog.path;
        }

        var contents = "[{DATETIME}] METHOD={METHOD} REQUEST_URI={REQUEST_URL} REMOTE_IP={REMOTE_IP} RESPONSE_CODE={RESPONSE_CODE} ERROR_EXP={ERROR_EXCEPTION} ERROR_STACK={ERROR_STACK}";
        if(errLog.contents){
            contents = errLog.contents;
        }

        var d = new Date();

        logPath = defaultConvert(logPath, d, conf);
        contents = defaultConvert(contents, d, conf);

        defaultMkDir(logPath);

        var method = req.method;
        var requestUrl = req.url;
        var responseCode = res.statusCode;
        var remoteIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        var query = req.query;
        var body = req.body;

        contents = contents.replace("{METHOD}", method);
        contents = contents.replace("{REQUEST_URL}", requestUrl);
        contents = contents.replace("{RESPONSE_CODE}", responseCode);
        contents = contents.replace("{REMOTE_IP}", remoteIp);
        contents = contents.replace("{REQUEST_QUERY}", JSON.stringify(query));
        contents = contents.replace("{REQUEST_BODY}", JSON.stringify(body));
        
        contents = contents.replace("{ERROR_EXCEPTION}", errorException);

        var errStack = "";
        if(errorException.stack){
            errStack = errorException.stack;
        }
        contents = contents.replace("{ERROR_STACK}", errStack);

        if(errLog.callback){
            var buff = errLog.callback(contents, errorException, conf, req, res);
            if(buff){
                contents = buff;
            }
        }

        fs.appendFileSync(logPath, contents + "\n");
        
        resolve();
    };

};
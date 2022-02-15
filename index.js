/**
 * ====================================================================
 * Hachiware_Server_module_log
 * 
 * Log output module of web server package "hachiware_server".
 * 
 * License : MIT License. 
 * Since   : 2022.01.15
 * Author  : Nakatsuji Masato
 * Email   : nakatsuji@teastalk.jp
 * HP URL  : https://hachiware-js.com/
 * GitHub  : https://github.com/masatonakatsuji2021/Hachiware_Server_module_log
 * npm     : https://www.npmjs.com/package/Hachiware_Server_module_log
 * ====================================================================
 */
 
const fs = require("fs");
const tool = require("hachiware_tool");
const { Http2ServerRequest } = require("http2");
const path0 = require("path");

module.exports = function(conf){

    /**
     * defaultConvert
     * @param {string} strs Log content
     * @param {Date} date Today's date object
     * @param {Conf} conf Server section configuration data
     * @returns {string} Log content with all values replaced
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
        strs = strs.replace("{SSNAME}", path0.basename(conf.rootPath));
        strs = strs.replace("{PID}",process.pid);

        return strs;
    };

    /**
     * defaultMkDir
     * @param {string} logPath Destination log file path
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
     * fookAccess
     * Hook executed when a request is received to the server
     * @param {serverRequest} req Server request object
     * @param {serverResponse} res Server response object
     */
    this.fookAccess = function(req, res){

        if(!tool.objExists(conf,"logs.access")){
            return;
        }

        var access = conf.logs.access;

        if(!access.enable){
            return;
        }

        var logPath = conf.rootPath + "/logs/access/access-{YYYY}-{MM}.log";
        if(access.path){
            logPath =  conf.rootPath + "/" + access.path;
        }

        var contents = "[{DATETIME}] PID={PID} METHOD={METHOD} REQUEST_URI={REQUEST_URL} REMOTE_IP={REMOTE_IP} RESPONSE_CODE={RESPONSE_CODE} SSNAME={SSNAME}";
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
    };

    /**
     * fookError
     * Hook executed when an error occurs on a server request.
     * @param {errorException} error Error information
     * @param {serverRequest} req Server request object
     * @param {serverResponse} res Server response object
     */
    this.fookError = function(errorException, req, res){

        if(!tool.objExists(conf,"logs.error")){
            return;
        }

        var errLog = conf.logs.error;

        if(!errLog.enable){
            return;
        }

        var logPath = conf.rootPath + "/logs/error/error-{YYYY}-{MM}.log";
        if(errLog.path){
            logPath = conf.rootPath + "/" + errLog.path;
        }

        var contents = "[{DATETIME}] PID={PID} METHOD={METHOD} REQUEST_URI={REQUEST_URL} REMOTE_IP={REMOTE_IP} RESPONSE_CODE={RESPONSE_CODE} ERROR_EXP={ERROR_EXCEPTION} ERROR_STACK={ERROR_STACK} SSNAME={SSNAME}";
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
    };

};
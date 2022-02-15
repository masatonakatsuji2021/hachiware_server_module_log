# hachiware_server_module_log

<a href="https://github.com/masatonakatsuji2021/hachiware_server_module_log/blob/master/LICENSE"><img alt="GitHub license" src="https://img.shields.io/github/license/masatonakatsuji2021/hachiware_server_module_log"></a>
<img alt="GitHub package.json version" src="https://img.shields.io/github/package-json/v/masatonakatsuji2021/hachiware_server_module_log">
<img alt="GitHub top language" src="https://img.shields.io/github/languages/top/masatonakatsuji2021/hachiware_server_module_log">
<img alt="Libraries.io dependency status for GitHub repo" src="https://img.shields.io/librariesio/github/masatonakatsuji2021/hachiware_server_module_log">
<img src="https://img.shields.io/badge/author-Nakatsuji%20Masato-brightgreen" alt="author Nakatsuji Masato">
<img src="https://img.shields.io/badge/made%20in-Japan-brightgreen" alt="made in japan">

Log output module of web server package "hachiware_server".

It is a dedicated server module of the web server application "hachiware_server".  
To use it, you must first install and configure ``hachiware_server``.

You can install hachiware_server with the following command.

```
npm i hachiware_server
```

The server module can be installed with the following npm command.

```
npm i hachiware_server_module_log
```

After installation, you will need the hachiware server configuration file.
See [here](https://github.com/masatonakatsuji2021/hachiware_server) for the procedure for using hachiware_server.

---

### # Setting method

Open the configuration file ``conf/conf.js`` etc. on the hachiware server and open it.
Confirm that ``hachiware_server_module_log`` is added in ``modules``.

```javascript
modules: [
    ...
    "hachiware_server_module_log",
    ...
],
```

Then specify ``logs`` as shown below.   
The following is a setting example. Details of the settings will be explained later.

```javascript
...
logs: {

	// startup write log
	startUp: {
        enable: true,
        path: "logs/startup/startup-{YYYY}.log",
        contents: "[{DATETIME}] {MODE} {HOST}:{PORT} URL= {LISTEN_URI} CONF= {CONF_FILE}",
	},

	// access write log
	access: {
        enable: true,			
        path: "logs/access/access-{YYYY}-{MM}.log",
        contents: "[{DATETIME}] {METHOD} {REQUEST_URL} {REMOTE_IP} {RESPONSE_CODE}",
	},

    // error write log
    error: {
        enable: true,
        path: "logs/error/error-{YYYY}-{MM}.log",
        contents: "[{DATETIME}] {METHOD} {REQUEST_URL} {REMOTE_IP} {RESPONSE_CODE} {ERROR_EXCEPTION} {ERROR_STACK}",
    },
},
...
```

## # Life Cycle

The life cycle of this server module is as follows:

```code
(server listen start)
    |
(request)
    |
load fook access                        <= Output access log.
    |
    ......
        |   * If an error occurs
        |
    load fook error                     <= Output error log.
            |
    error callback action
    ...
    |
    | * Quit the server
    |
(server listen exit)
```

* "load fook access" executes the access hook of each sserver module.  
* "load fook error" executes the error hook of the server module.

---

## # Log output when request is received

If you want to output the log when the request is received by the server, specify ``access`` in ``logs``.

```javascript
logs: {
    ...
    // access write log
    access: {
        enable: true,			
        path: "logs/access/access-{YYYY}-{MM}.log",
        contents: "[{DATETIME}] {METHOD} {REQUEST_URL} {REMOTE_IP} {RESPONSE_CODE}",
	},
    ...
},
```

|colum|overview|
|:--|:--|
|enable|Specify here whether to enable / disable log output when receiving a server request.|
|path|Specify the path of the log output destination.<br>If no path is specified, ``logs/access/access-{YYYY}-{MM}.log`` is output by default.<br>Specify the path as a relative path.<br>If the directory in the path does not exist, it will be created automatically.<br>Dynamic format placement (DFP) can be used for the path name. [Click here for details](#dfp)|
|contents|Specify the content to be logged.<br>If no content is specified, it is output as ``[{DATETIME}] METHOD={METHOD} REQUEST_URI={REQUEST_URL} REMOTE_IP={REMOTE_IP} RESPONSE_CODE={RESPONSE_CODE}`` by default.<br>You can use Dynamic Format Placement (DFP) for your content [Click here for details](#dfp)|
|callback|Callback to execute when a request is received.<br>Arguments are context, server settings, request object, response object, and set the log output contents in the return value..<br>If no return value is specified, the default content will be output.|

---

## # Log output when an error occurs

If you want to output the log when an error occurs in the request from the server, specify ``error`` in ``logs``.

```javascript
logs: {
    ...
    // error write log
    error: {
        enable: true,
        path: "logs/error/error-{YYYY}-{MM}.log",
        contents: "[{DATETIME}] {METHOD} {REQUEST_URL} {REMOTE_IP} {RESPONSE_CODE} {ERROR_EXCEPTION} {ERROR_STACK}",
    },
     ...
},
```

|colum|overview|
|:--|:--|
|enable|Specify here whether to enable / disable log output when an error occurs after receiving a server request.|
|path|Specify the path of the log output destination.<br>If no path is specified, ``logs/error/error-{YYYY}-{MM}.log`` is output by default.<br>Specify the path as a relative path.<br>If the directory in the path does not exist, it will be created automatically.<br>Dynamic format placement (DFP) can be used for the path name. [Click here for details](#dfp)|
|contents|Specify the content to be logged.<br>If no content is specified, it is output as ``[{DATETIME}] METHOD={METHOD} REQUEST_URI={REQUEST_URL} REMOTE_IP={REMOTE_IP} RESPONSE_CODE={RESPONSE_CODE} ERROR_EXP={ERROR_EXCEPTION} ERROR_STACK={ERROR_STACK}`` by default.<br>You can use Dynamic Format Placement (DFP) for your content [Click here for details](#dfp)|
|callback|Callback to be executed when an error occurs after receiving a request.<br>The arguments are context, server settings, error information, request object, response object and set the contents of the log output to the return value.<br>If no return value is specified, the default content will be output.|

---

<a id="dfp"></a>

## # Dynamic format placement (DFP)

By embedding the error output path and error content as a short code, log information can be dynamically output to any location.

For example, logs can be divided by month, year, etc., making it easier to organize output logs.  
There is no need to prepare the batch program required for log collection.

The shortcodes of each format and their output results are as follows.

|Short code|access|error|Output result|
|:--|:-|:--|:--|
|{DATETIME}|〇|〇|Log output date and time.<br>{YYYY}/{MM}/{DD} {HH}:{mm}:{ss}|
|{DATE}|〇|〇|Log output date.<br>{YYYY}/{MM}/{DD}|
|{TIME}|〇|〇|Log output time.<br>{HH}:{mm}:{ss}|
|{YYYY}|〇|〇|Log output year|
|{MM}|〇|〇|Log output month|
|{DD}|〇|〇|Log output day|
|{HH}|〇|〇|Log output hour|
|{mm}|〇|〇|Log output minutes|
|{ss}|〇|〇|Log output second|
|{HOST}|〇|〇|Host name|
|{PORT}|〇|〇|Port Number|
|{SSL}|〇|〇|SSL enabled/disabled|
|{LISTEN_URI}|〇|〇|Requestable URL|
|{SSNAME}|〇|〇|Target server section name|
|{METHOD}|〇|〇|Request method|
|{REQUEST_URL}|〇|〇|Requested URL|
|{RESPONSE_CODE}|〇|〇|Response code number|
|{REMOTE_IP}|〇|〇|Source IP address information|
|{REQUEST_QUERY}|〇|〇|Query information(GET)|
|{REQUEST_BODY}|〇|〇|Request body|
|{ERROR_EXCEPTION}|-|〇|Error message|
|{ERROR_STACK}|-|〇|Error details|

---

hachiware_server_module_log

Log output module of web server package "hachiware_server".
 
License : MIT License.   
Author  : Nakatsuji Masato  
HP URL  : [https://hachiware-js.com/](https://hachiware-js.com/)  
GitHub  : [https://github.com/masatonakatsuji2021/hachiware_server_module_log](https://github.com/masatonakatsuji2021/hachiware_server_module_log)  
npm     : [https://www.npmjs.com/package/hachiware_server_module_log](https://www.npmjs.com/package/hachiware_server_module_log)
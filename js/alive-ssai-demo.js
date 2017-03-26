//We will load this values form URL vars 
//Example:
//https://www.myserver.com/ssai-demo.html?env=qa/st/pr&apikey=abcedfghijklmopq&app=abc63274623846246237864&jobid=abcd1234abcd1234abcd1234abcd1234

var apiKey = "";
var jobId = "";
var appName = "";

var playbackurl = "";

//PROD base url
var baseUrl = "https://api.bcovlive.io/v1";

function onLoadPage() {
    var url_vars = getUrlVars();

    console.log("URL detected vars = " + JSON.stringify(url_vars));

    //Use QA/ST env if is explicitly specified
    if ("env" in url_vars) {
        if (url_vars.env == "qa")
            baseUrl = "https://api-qa.a-live.io/v1";
        else if (url_vars.env == "st")
            baseUrl = "https://api-st.a-live.io/v1";
    }

    if ( (!("apikey" in url_vars)) || (!("apikey" in url_vars)) || (!("app" in url_vars)) ) {
        showInputParamsAlert();
    }
    else {
        apiKey = url_vars.apikey;
        jobId = url_vars.jobid;
        appName = url_vars.app;

        console.log("Detected params ApiUrl: " + baseUrl + ",apiKey: " + apiKey + ", JobId: " + jobId + ", App:" + appName);

        refreshJobIdApp();

        getJobData();
    }
}

function getUrlVars() {
    var vars = {};
    window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
      vars[key] = value;
    });

    return vars;
}

function showInputParamsAlert() {
    showError("A problem has been occurred reading required data from querystring.Remember the URL format to use this page is:<br>MYSERVER.abc/ssai-demo.html?env=qa/st/pr&apikey=abcedfghijklmopq&app=abc63274623846246237864&jobid=abcd1234abcd1234abcd1234abcd1234");
}

function showError (msg) {
    console.error(msg);

    document.getElementById("errMsg").innerHTML = msg;
    $('#errorAlert').fadeIn('slow');
}

function refreshJobIdApp () {
    document.getElementById("jobId").innerHTML = "Job id: " + jobId;
    document.getElementById("appId").innerHTML = "App: " + appName;
}

function refreshPlaybackUrl(url) {
    document.getElementById("playbackUrl").innerHTML = "Playback URL: " + url;
}

function injectAdBreak() {
    enableAdBreakinInjection(false);

    var adBreakDur_s = document.getElementById("adbreakDur").value;

    sendInjectAdBreak(adBreakDur_s);
}

function enableAdBreakinInjection(b) {
    document.getElementById("injectAdBreak").disabled = !b;
}

function sendInjectAdBreak(adBreakDur_s) {
    var url = baseUrl + "/jobs/" + jobId + "/cuepoint";

    var injectTime = Date.now();

    var data = {duration: adBreakDur_s};

    console.log("Sending to: " + baseUrl + ": " + JSON.stringify(data));

    $.ajax({
        url: url,
        method: 'POST',
        dataType: 'json',
        timeout: 20000,
        headers: {
            'x-api-key': apiKey,
            'Content-Type': 'application/json'
        },
        data: JSON.stringify({duration: adBreakDur_s}),

        success: function(data) {
            if ("errorType" in data) {
                return showError("Received from sending adbreak" + JSON.stringify(data.errorMessage));
            }
            else {
                addAdBreakToList(injectTime, adBreakDur_s);
            }

            enableAdBreakinInjection(true);
        },
        error: function(msg) {
            return showError("Error sending adBreak: " + JSON.stringify(msg));
            enableAdBreakinInjection(true);
        }
    });
}

function getJobData() {
    var url = baseUrl + "/jobs/" + jobId;

    $.ajax({
        url: url,
        method: 'GET',
        dataType: 'json',
        timeout: 20000,
        headers: {
            'x-api-key': apiKey,
            'Content-Type': 'application/json'
        },
        data: "",

        success: function(data) {
            if ("errorType" in data) {
                return showError("Received from getting job data" + JSON.stringify(data.errorMessage));
            }

            if ( !("job" in data) || !("ssai_playback_urls" in data.job))
                return showError("getting ssai_playback_urls from job");

            if (appName == "") {
                console.log("Getting the default (first) app object");
                appName = Object.keys(data.job.ssai_playback_urls)[0];
            }

            if ( !(appName in data.job.ssai_playback_urls) )
                return showError("getting ssai playback url for app: " + appName);

            var app_data = data.job.ssai_playback_urls[appName];

            if ( !("playback_url" in app_data))
                return showError("getting playback url inside the app object: " + JSON.stringify(app_data));

            //Workaround to make it work in HTTPS
            playbackurl = translateHttps(app_data.playback_url);

            refreshPlaybackUrl(playbackurl);

            loadVideo(playbackurl, true);

            enableAdBreakinInjection(true);
        },
        error: function(msg) {
            return showError("Error getting job data: " + JSON.stringify(msg));

        }
    });
}

function isNumber(evt) {
    evt = (evt) ? evt : window.event;
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
        return false;
    }
    return true;
}

function addAdBreakToList(time, duration_s) {
    var injected_list = document.getElementById('injected_list');

    var newAdBreak = injected_list.insertRow(-1);

    var newAdBreak_text = newAdBreak.insertCell(0);

    newAdBreak_text.innerHTML = "Injected at: " + new Date(time).toISOString() + " (" + duration_s + ")";

    injected_list.appendChild(newAdBreak);
}

function loadVideo(url, play) {

    player.src({
        type: "application/x-mpegURL",
        src: url
    });
    console.log("Loaded playlist: " + url);

    if (play == true) {
        player.play();
        console.log("Play!");
    }
    else {
        player.pause();
    }
}

function translateHttps (url) {
    return url.replace(/^http:/,'https:')
}
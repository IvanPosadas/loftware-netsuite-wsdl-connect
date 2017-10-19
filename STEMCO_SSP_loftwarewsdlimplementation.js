/**
 * STEMCO_SSP_loftwarewsdlimplementation.js
 * @Developer  Ivan M. Posadas Herrera
 * @Email  ivanmposadas@gmail.com
 * @NApiVersion 2.0
 * @Version alpha
 */

 define(['N/http','N/xml'],

function(http,xml) {

    var WSDL_ENDPOINT = 'http://www.domain.com/services/LoftwarePrintWS.LoftwarePrintWSHttpSoap11Endpoint/';
    var USER="user";
    var PASSWORD="password";
    var DOMAIN="any";
    var TOKEN = "";

  	function getDataByTag(srt,tagIn,tagOut,headers){
      	var pointer = 0;
        var st = 0;
      	var np = 0;
        var tagSub = "";
        var results =[];
        var token = [];
        var itemsWithTokens = [];

      	while(pointer < srt.length){
          st   = srt.indexOf(tagIn,pointer) + tagIn.length ;
          np   = srt.indexOf(tagOut,pointer);
          tagSub = srt.substring(st,np).trim();
          results = tagSub.split(",");
          token = {};
          for(var i=0; i<results.length;i++){
            token[headers[i]] = results[i];
          }
          itemsWithTokens.push(token);

          pointer = np + tagOut.length;
        }

      return itemsWithTokens;
    }

    function makeToken()
    {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for( var i=0; i < 32; i++ )
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    }

    function postRequestWS(request) {

      var response = http.request({
          method: http.Method.POST,
          body: request,
          url: WSDL_ENDPOINT
      });

      return response;
    }

    function endUserLogin() {

      TOKEN = makeToken();

      var authRequest = "<x:Envelope xmlns:x=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:ser=\"http://services.loftware.com\">\n" +
                        "    <x:Header/>\n" +
                        "    <x:Body>\n" +
                        "        <ser:endUserLogin>\n" +
                        "            <ser:userName>"+USER+"</ser:userName>\n" +
                        "            <ser:password>"+PASSWORD+"</ser:password>\n" +
                        "            <ser:domain>"+DOMAIN+"</ser:domain>\n" +
                        "            <ser:lwaUsername>"+DOMAIN+"/"+USER+"</ser:lwaUsername>\n" +
                        "            <ser:lwaSessionID>"+TOKEN+"</ser:lwaSessionID>\n" +
                        "            <ser:lwaUIServerIP>10.13.31.01</ser:lwaUIServerIP>\n" +
                        "        </ser:endUserLogin>\n" +
                        "    </x:Body>\n" +
                        "</x:Envelope>";

      var securityString = postRequestWS(authRequest).body;
      securityString = securityString.substring(204,securityString.lastIndexOf("Assertion>")+10);

      return securityString;
    }

    function endUserLogout(securityString){

      var desAuthRequest =  "<x:Envelope xmlns:x=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:ser=\"http://services.loftware.com\">"+
                            "   <x:Header/>\n"+
                            "   <x:Body>\n"+
                            "       <ser:endUserLogout>\n"+
                            "            <ser:securityObject>"+securityString+"</ser:securityObject>\n"+
                            "            <ser:lwaUsername>None/iposadas</ser:lwaUsername>\n"+
                            "            <ser:lwaSessionID>"+TOKEN+"</ser:lwaSessionID>\n"+
                            "            <ser:lwaUIServerIP>10.13.31.01</ser:lwaUIServerIP>\n"+
                            "        </ser:endUserLogout>\n"+
                            "   </x:Body>\n"+
                            "</x:Envelope>\n";

      return postRequestWS(desAuthRequest);
    }

    function sendJobNoWaitWS(printerNum,printerName,labelName,quantity,duplicates,parameters){

     labelName = labelName.replace(/\\/g,'\\\\');

     var securityString = endUserLogin();
     var jobData = '<?xml version="1.0" encoding="utf-8" ?>'+
                   '<!DOCTYPE labels SYSTEM "C:\\Program Files\\Loftware Labeling\\Batch\\label.dtd">'+
                   '<labels _FORMAT="'+labelName+'" _QUANTITY="'+quantity+'" _DUPLICATES="'+duplicates+'">'+
                   '<label>';

    for(var parameter in parameters){
       jobData += '<variable name="'+parameter+'">'+parameters[parameter]+'</variable>';
    }

         jobData +='</label>'+
                   '</labels>';
     jobData = xml.escape({ xmlText : jobData});
     var sendPrintWS = "<x:Envelope xmlns:x=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:ser=\"http://services.loftware.com\">\n" +
                       "    <x:Header/>\n" +
                       "    <x:Body>\n" +
                       "        <ser:sendJobNoWaitWS>\n" +
                       "            <ser:securityObject>" + securityString + "</ser:securityObject>\n" +
                       "            <ser:printerNum>"+printerNum+"</ser:printerNum>\n" +
                       "            <ser:printerName>"+printerName+"</ser:printerName>\n" +
                       "            <ser:labelName>C:\\Program Files (x86)\\Loftware Labeling\\labels\\"+labelName+"</ser:labelName>\n" +
                       "            <ser:jobData>" + jobData + "</ser:jobData>\n" +
                       "        </ser:sendJobNoWaitWS>\n" +
                       "    </x:Body>\n" +
                       "</x:Envelope>";
     var response = postRequestWS(sendPrintWS);

     endUserLogout(securityString);

     return response;
    }

    function sendJobWaitWS(printerNum,printerName,labelName,quantity,duplicates,parameters){

     labelName = labelName.replace(/\\/g,'\\\\');

     var securityString = endUserLogin();
     var jobData = '<?xml version="1.0" encoding="utf-8" ?>'+
                   '<!DOCTYPE labels SYSTEM "C:\\Program Files\\Loftware Labeling\\Batch\\label.dtd">'+
                   '<labels _FORMAT="'+labelName+'" _QUANTITY="'+quantity+'" _DUPLICATES="'+duplicates+'">'+
                   '<label>';

    for(var parameter in parameters){
       jobData += '<variable name="'+parameter+'">'+parameters[parameter]+'</variable>';
    }

         jobData +='</label>'+
                   '</labels>';
     jobData = xml.escape({ xmlText : jobData});
     var sendPrintWS = "<x:Envelope xmlns:x=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:ser=\"http://services.loftware.com\">\n" +
                       "    <x:Header/>\n" +
                       "    <x:Body>\n" +
                       "        <ser:sendJobWaitWS>\n" +
                       "            <ser:securityObject>" + securityString + "</ser:securityObject>\n" +
                       "            <ser:printerNum>"+printerNum+"</ser:printerNum>\n" +
                       "            <ser:printerName>"+printerName+"</ser:printerName>\n" +
                       "            <ser:labelName>C:\\Program Files (x86)\\Loftware Labeling\\labels\\"+labelName+"</ser:labelName>\n" +
                       "            <ser:jobData>" + jobData + "</ser:jobData>\n" +
                       "        </ser:sendJobWaitWS>\n" +
                       "    </x:Body>\n" +
                       "</x:Envelope>";
     var response = postRequestWS(sendPrintWS);

     endUserLogout(securityString);

     return response;
    }

    function getDeviceList(sortXML,filterXML){

       var securityString = endUserLogin();

       var sendPrintWS = "<x:Envelope xmlns:x=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:ser=\"http://services.loftware.com\">\n" +
                         "    <x:Header/>\n" +
                         "    <x:Body>\n" +
                         "        <ser:getDeviceList>\n" +
                         "            <ser:securityObject>" + securityString + "</ser:securityObject>\n" +
                         "            <ser:sortXML>" + sortXML + "</ser:sortXML>\n" +
                         "            <ser:filterXML>" + filterXML +"</ser:filterXML>\n" +
                         "        </ser:getDeviceList>\n" +
                         "    </x:Body>\n" +
                         "</x:Envelope>";

       var response = postRequestWS(sendPrintWS);

       endUserLogout(securityString);

       var str = response.body;

       var startPosGral = str.indexOf("<ns:get") + '<ns:getDeviceListResponse xmlns:ns="http://services.loftware.com">'.length;
       var endPos = str.indexOf("</ns:get");

       var resultBody = str.substring(startPosGral,endPos).trim();

       var headers = [
            "number",
            "model",
            "ip",
            "driver",
            "name"
        ];

       return getDataByTag(resultBody,'<ns:return>','</ns:return>',headers);
    }

  	function getLabelList(sortXML,filterXML){

       var securityString = endUserLogin();

       var sendPrintWS = "<x:Envelope xmlns:x=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:ser=\"http://services.loftware.com\">\n" +
                         "    <x:Header/>\n" +
                         "    <x:Body>\n" +
                         "        <ser:getLabelList>\n" +
                         "            <ser:securityObject>" + securityString + "</ser:securityObject>\n" +
                         "            <ser:sortXML>" + sortXML + "</ser:sortXML>\n" +
                         "            <ser:filterXML>" + filterXML +"</ser:filterXML>\n" +
                         "        </ser:getLabelList>\n" +
                         "    </x:Body>\n" +
                         "</x:Envelope>";

       var response = postRequestWS(sendPrintWS);

       endUserLogout(securityString);

       var str = response.body;

       var startPosGral = str.indexOf("<ns:get") + '<ns:getLabelListResponse xmlns:ns="http://services.loftware.com">'.length;
       var endPos = str.indexOf("</ns:get");

       var resultBody = str.substring(startPosGral,endPos).trim();

       var headers = [
            "name",
            "driver",
            "template"
        ];

       return getDataByTag(resultBody,'<ns:return>','</ns:return>',headers);

    }

    return {
        sendJobNoWaitWS:sendJobNoWaitWS,
        sendJobWaitWS:sendJobWaitWS,
        getDeviceList:getDeviceList,
        getLabelList:getLabelList
    };

});

public with sharing class PayPalController {
@AuraEnabled(Cacheable=true)
public static void  createNewPayments(String contId, String orderId){
    String jsonobj;
    List<sObject>objlst;
    Contact cont = [SELECT Id, Name, Email, MailingAddress FROM Contact WHERE Id = :contId LIMIT 1];
    jsonobj=json.serializePretty(cont);
   Custom_Order__c order = [SELECT Id, Quantity__c, Status__c, Unit_Price__c,Type_of_payment__c FROM Custom_Order__c LIMIT 1];
   jsonobj=jsonobj+','+json.serializePretty(order);
   objlst=new list<sObject >();
   objlst=(list<sObject>)json.deserialize(jsonobj,list<sObject >.class);
   processPayments(objlst);
  
}
public static void processPayments(List<SObject> objlst){
    Http http = new Http();
    HttpResponse response = new HttpResponse();
    HttpRequest request = generateRequest(objlst);
    response = http.send(request);
    String rawResponse = response.getBody();
}
public static HttpRequest generateRequest(List<SObject> objlst) {
    String purl = 'sandbox.paypal.com';
    String user = 'phoneshoplwc@gmail.com';
    String pass = 'Q1w2e3r4t5y6';
    String sign = 'AYhigAozNLfbM9tmIH-ngqtxCFKu5nSgO3WWZ6gaKXUxz1uMjsEM5Whxj329wdGurff7hEU9FVA_UOpH';
    HttpRequest req = new HttpRequest();
    String url = 'https://api-3t.' + purl + '/2.0';
    String requestBody =  generateMsgBody(objlst, user, pass, sign);
    req.setEndpoint(url);
    req.setMethod('POST');
    req.setHeader('Content-length', requestBody.length().format());
    req.setBody(requestBody); 
    req.setHeader('Host','api-aa.' + purl);
    req.setTimeout(60000);

    return req;
}
public static String generateMsgBody(List<SObject> objlst, String user, String pass, String sign)
{
    String soapRequestBody;
        soapRequestBody  = '<soap:Envelope xmlns:soap=\'http://schemas.xmlsoap.org/soap/envelope/\' xmlns:xsi=\'http://www.w3.org/2001/XMLSchema-instance\' xmlns:xsd=\'http://www.w3.org/2001/XMLSchema\'>';
        soapRequestBody += '<soap:Header><RequesterCredentials xmlns="urn:ebay:api:PayPalAPI"><Credentials xmlns="urn:ebay:apis:eBLBaseComponents">';
        soapRequestBody += '<Username>' + user + '</Username><ebl:Password xmlns:ebl="urn:ebay:apis:eBLBaseComponents">' + pass + '</ebl:Password><Signature>' + sign + '</Signature>';
        soapRequestBody += '</Credentials></RequesterCredentials></soap:Header>';
        soapRequestBody += '<soap:Body>';
        soapRequestBody += '<MassPayReq xmlns="urn:ebay:api:PayPalAPI">';
        soapRequestBody += '<MassPayRequest xmlns="urn:ebay:apis:eBLBaseComponents">';
        soapRequestBody += '<Version xmlns="urn:ebay:apis:eBLBaseComponents">84.00</Version>';
        soapRequestBody += '<EmailSubject xsi:type="xs:string">Payment from Greenlight</EmailSubject>';
        soapRequestBody += '<ReceiverType recieverinfocode="EmailAddress"/>';

        for(SObject paymentObj: objlst)
        {
            soapRequestBody += '<MassPayItem xsi:type="ebl:MassPayItemType">';
            soapRequestBody += '<UniqueId>' + paymentObj.Id + '</UniqueId>';
            soapRequestBody += '</MassPayItem>';

        }
        soapRequestBody += '</MassPayRequest></MassPayReq>';
        soapRequestBody += '</soap:Body></soap:Envelope>';
       
        return soapRequestBody;
}
}
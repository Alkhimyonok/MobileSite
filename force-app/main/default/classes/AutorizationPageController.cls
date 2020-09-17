public with sharing class AutorizationPageController {

    public String inputLoginValue { get; set; }
    public String inputPasswordValue { get; set; }
    public static String currentUser { get; set; }

    @AuraEnabled
 public static List<Contact> getAutorization(String inputLoginValue, String inputPasswordValue) {
        List<Contact> contList = [SELECT Login__c, Password__c, Name FROM Contact WHERE Login__c = :inputLoginValue AND Password__c = :inputPasswordValue LIMIT 1];
        currentUser = contList[0].Name;
        system.debug(contList);
        return contList;
    }
}
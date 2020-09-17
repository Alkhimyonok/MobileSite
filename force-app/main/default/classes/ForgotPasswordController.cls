public with sharing class ForgotPasswordController {
    public static String currentUser { get; set; }

    @AuraEnabled
    public static Boolean restorePassword(String emailValue) {
        Boolean bool = false;
        if (emailValue != null) {
            List<Contact> contactListForAutorization = [SELECT Email, Login__c, Password__c FROM Contact WHERE Email = :emailValue];
            if (contactListForAutorization.size() != null) {
                bool = true;
                Messaging.SingleEmailMessage email = new Messaging.SingleEmailMessage();
                email.setToAddresses(new String[]{
                        UserInfo.getUserEmail()
                });
                email.setPlainTextBody('Your login is: ' + contactListForAutorization[0].Login__c);
                email.setPlainTextBody('Your password is: ' + contactListForAutorization[0].Password__c);
                Messaging.SendEmailResult [] result = Messaging.sendEmail(new Messaging.SingleEmailMessage[]{
                        email
                });
            }
        }
         return bool;
    }
    @AuraEnabled
    public static List<Contact> autorizationUser(String loginValue, String passwordValue) {
        system.debug('inputLoginValue'+ loginValue);
        system.debug('inputPasswordValue'+ passwordValue);
        List<Contact> contList = [SELECT Login__c, Password__c, Name FROM Contact WHERE Login__c = :loginValue AND Password__c = :passwordValue LIMIT 1];
        currentUser = contList[0].Name;
        system.debug(contList);
        return contList;
    }
}
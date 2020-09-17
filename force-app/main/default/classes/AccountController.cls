public with sharing class AccountController {
  @AuraEnabled(cacheable=true)
  public static Account getAccount(Id recordId) {
    Account accountToReturn = [
      SELECT
        Name,
        Description,
        Logo__c,
        Working_hours__c,
        Email__c,
        Phone,
        BillingAddress,
        BillingStreet,
        BillingCity
      FROM Account
      WHERE ID = :recordId
    ];
    System.debug('accountToReturn' + accountToReturn);

    return accountToReturn;
  }
}

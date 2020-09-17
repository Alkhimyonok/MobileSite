public with sharing class CaseController {
  @AuraEnabled(cacheable=true)
  public static List<Case> getCases(String contactId) {
    List<Case> cases = [
      SELECT Id, CaseNumber, Status, Custom_OrderId__c, CreatedDate
      FROM Case
      WHERE ContactId = :contactId
    ];
    return cases;
  }

  @AuraEnabled(cacheable=true)
  public static List<Case> getCasesById(String caseId) {
    List<Case> cases = [
      SELECT Id, Custom_OrderId__c
      FROM Case
      WHERE Id = :caseId
    ];
    return cases;
  }
}
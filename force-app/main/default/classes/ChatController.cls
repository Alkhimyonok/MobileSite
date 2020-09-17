public with sharing class ChatController {
  @AuraEnabled
  //   (cacheable=true)
  public static List<Chat_Message__c> getTodayMessages() {
    List<Chat_Message__c> messageList;
    try {
      messageList = [
        SELECT
          Id,
          Content__c,
          CreatedDate,
          Contact__r.MediumPhotoUrl__c,
          Contact__r.Name
        FROM Chat_Message__c
        WHERE CreatedDate = today
        ORDER BY CreatedDate DESC
      ];
    } catch (Exception e) {
      System.debug(e.getMessage());
      return null;
    }
    system.debug(messageList);
    return messageList;
  }

  @AuraEnabled(cacheable=true)
  public static List<Contact> getActiveChatUsers() {
    List<Contact> userList;
    try {
      userList = [
        SELECT Id, CreatedDate, Name, MediumPhotoUrl__c
        FROM Contact
        WHERE Chat_Active__c = TRUE
      ];
    } catch (Exception e) {
      System.debug(e.getMessage());
      return null;
    }
    return userList;
  }

  @AuraEnabled
  public static Contact setUserChatActive(String userId) {
    system.debug('userId' + userId);
    Contact userToUpdate;
    try {
      userToUpdate = [
        SELECT Id, Chat_Active__c
        FROM Contact
        WHERE Id = :userId
      ];
      userToUpdate.Chat_Active__c = true;
      update userToUpdate;
    } catch (DmlException e) {
      System.debug('An unexpected error has occurred: ' + e.getMessage());
    }
    return userToUpdate;
  }

  @AuraEnabled
  public static Contact setUserChatInactive(String userId) {
    system.debug('userId' + userId);
    Contact userToUpdate;
    try {
      userToUpdate = [
        SELECT Id, Chat_Active__c
        FROM Contact
        WHERE Id = :userId
      ];
      system.debug('userToUpdate1' + userToUpdate);
      userToUpdate.Chat_Active__c = false;
      system.debug('userToUpdate2' + userToUpdate);
      update userToUpdate;
    } catch (DmlException e) {
      System.debug('An unexpected error has occurred: ' + e.getMessage());
    }
    return userToUpdate;
  }
}
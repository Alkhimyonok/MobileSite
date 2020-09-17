public with sharing class HomePageController {
    @AuraEnabled
 public static Contact getContact(String searchUserName){
return ([SELECT Id, Name FROM Contact WHERE Name LIKE :searchUserName]);
 }
}
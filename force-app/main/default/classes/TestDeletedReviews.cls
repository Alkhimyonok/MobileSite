@isTest
private with sharing class TestDeletedReviews{
	@TestSetup
	static void makeData(){
		List<Product2> testProducts = new List<Product2>();
		for (Integer i = 0; i < 20; i++){
			testProducts.add(new Product2(Name = 'TestProduct' + i));
		}
		insert testProducts;
		List<Mobile_Review__c> testReviews = new List<Mobile_Review__c>();
		for (Integer i = 0; i < 20; i++){
			testReviews.add(new Mobile_Review__c(Name = 'TestProduct' + i));
		}
		insert testReviews;
		for (Integer i = 0; i < 20; i++){
			testProducts.get(i).Mobile_Review__c = testReviews.get(i).Id;
		}
		update testProducts;
	}

	@isTest
	static void testMethod1(){
		List<Product2> mobiles = [SELECT Id
		                          FROM Product2];
		delete mobiles;
		List<Mobile_Review__c> reviews = [SELECT Id
		                                  FROM Mobile_Review__c];
		System.assertEquals(0, reviews.size());
	}
}
public with sharing class MobileDataService{
	@AuraEnabled(cacheable = true)
	public static List<Product2> getMobilesList(Integer offset, Integer pageSize, List<String> selectedBrand, String bySort, String searchKey, Integer maxPrice, List<String> selectedOs){
		String query = 'SELECT Name, Description, Picture__c, Price__c, Brand__c, Rating__c, Reviews_Count__c, Operating_System__c FROM Product2';
		if (selectedBrand.size() > 0){
			query += ' WHERE Brand__c IN :selectedBrand';
		}
		if (!searchKey.equals('')){
			if (query.contains('WHERE')){
				query += ' AND Name LIKE \'%' + searchKey + '%\'';
			} else{
				query += ' WHERE Name LIKE \'%' + searchKey + '%\'';
			}
		}
		if (maxPrice != 0){
			if (query.contains('WHERE')){
				query += ' AND Price__c<= :maxPrice';
			} else{
				query += ' WHERE Price__c<= :maxPrice';
			}
		}
		if (selectedOs.size() > 0){
			if (query.contains('WHERE')){
				query += ' AND Operating_System__c IN :selectedOs';
			} else{
				query += ' WHERE Operating_System__c IN :selectedOs';
			}
		}
		if (bySort.equals('priceDesc')){
			query += ' ORDER BY Price__c DESC';
		} else if (bySort.equals('priceAsc')){
			query += ' ORDER BY Price__c ASC';
		} else if (bySort.equals('rating')){
			query += ' ORDER BY Rating__c DESC';
		}
		query += ' LIMIT :pageSize OFFSET :offset';
		try{
			return Database.query(query);
		} catch (DMLException e){
			System.debug(e.getMessage());
			return new List<Product2>();
		}
	}

	@AuraEnabled
	public static List<Mobile_Review__c> getAllReviews(Id mobileId){
		return [SELECT Id, Name, Comment__c, Rating__c, LastModifiedDate, CreatedDate, Contact__c, Contact__r.Name
		        FROM Mobile_Review__c 
		        WHERE Product__c = :mobileId
		        ORDER BY CreatedDate DESC];
	}

	@AuraEnabled
	public static Integer totalRecords(){
		return [SELECT COUNT()
		        FROM Product2 ];
	}

	@AuraEnabled(cacheable = true)
	public static Integer getNext(Integer offset, Integer pageSize){
		offset += pageSize;
		return offset;
	}

	@AuraEnabled(cacheable = true)
	public static Integer getPrevious(Integer offset, Integer pageSize){
		offset -= pageSize;
		return offset;
	}

	@AuraEnabled
	public static void updateRating(Id mobileId, Id reviewId){
		Product2 product = [SELECT Id, Rating__c, Reviews_Count__c, Rating_Amount__c
		                    FROM Product2 
		                    WHERE Id = :mobileId];
		Double mobileRating = product.Rating__c;
		Double reviewsCount = product.Reviews_Count__c;
		Double ratingAmount = product.Rating_Amount__c;
		Mobile_Review__c review = [SELECT Id, Rating__c
		                           FROM Mobile_Review__c 
		                           WHERE Id = :reviewId];
		Double reviewRating = review.Rating__c;
		++reviewsCount;
		ratingAmount += reviewRating;
		product.Reviews_Count__c = reviewsCount;
		product.Rating_Amount__c = ratingAmount;
		update product;
	}

	@AuraEnabled(cacheable = true)
	public static List<FatchValueWrapper> getMobilesPicklist(sObject objInfo, string picklistFieldApi){
		Schema.DescribeSObjectResult objDescribe = objInfo.getSObjectType().getDescribe();
		map<String, Schema.SObjectField> fieldMap = objDescribe.fields.getMap();
		list<Schema.PicklistEntry> values = fieldMap.get(picklistFieldApi).getDescribe().getPickListValues();
		list<FatchValueWrapper> objWrapper = new list<FatchValueWrapper>();
		for (Schema.PicklistEntry a : values){
			FatchValueWrapper oFatchValueWrapper = new FatchValueWrapper();
			oFatchValueWrapper.slabel = a.getLabel();
			oFatchValueWrapper.svalue = a.getValue();
			objWrapper.add(oFatchValueWrapper);
		}
		return objWrapper;
	}

	public with sharing class FatchValueWrapper{
		@auraEnabled
		public string slabel{ get; set; }

		@auraEnabled
		public string svalue{ get; set; }
	}

	@AuraEnabled(cacheable = true)
	public static List<Basket__c> getBasketsInOrder(String orderId){
		return [SELECT Id, UnitPrice__c, Quantity__c, TotalPrice__c, ProductId__r.Id, ProductId__r.Picture__c, ProductId__r.Name
		        FROM Basket__c 
		        WHERE CustomOrderId__c = :orderId];
	}
}
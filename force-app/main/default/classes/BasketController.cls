public with sharing class BasketController {
  @AuraEnabled(cacheable=true)
  public static List<Basket__c> getBasketList(Id contactId) {
    List<Basket__c> baskets = [
      SELECT
        Name,
        UnitPrice__c,
        TotalPrice__c,
        Quantity__c,
        ProductStatus__c,
        ProductId__c,
        ProductId__r.Name,
        ProductId__r.Description,
        ProductId__r.Price__c,
        ProductId__r.Picture__c,
        ProductId__r.Total_Quantity__c
      FROM Basket__c
      WHERE ContactId__c = :contactId AND CustomOrderId__r.Name = 'DraftOrder'
      //AND CustomOrderId__r.Name =: orderId
    ];

    return baskets;
  }

  @AuraEnabled
  public static void saveOrder(Id contactId, Id orderId) {
    List<Basket__c> basketsToOrder = [
      SELECT
        Name,
        UnitPrice__c,
        TotalPrice__c,
        Quantity__c,
        ProductStatus__c,
        CustomOrderId__c,
        ContactId__c,
        ProductId__c,
        ProductId__r.Name,
        ProductId__r.Description,
        ProductId__r.Price__c,
        ProductId__r.Picture__c
      FROM Basket__c
      WHERE
        ContactId__c = :contactId
        AND CustomOrderId__r.Name = 'DraftOrder'
        //AND CustomOrderId__r.Name = : orderId
        AND ProductStatus__c = TRUE
    ];

    for (Basket__c basket : basketsToOrder) {
      basket.CustomOrderId__c = orderId;
    }

    try {
      update basketsToOrder;
    } catch (Exception e) {
      System.debug('The following exception has occurred: ' + e.getMessage());
    }
  }

  @AuraEnabled
  public static void editQuantity(Basket__c basketId, Integer quantity) {
    Basket__c basketToChange = [
      SELECT Quantity__c, ProductId__r.Total_Quantity__c
      FROM Basket__c
      WHERE Id = :basketId.Id
      LIMIT 1
    ];

    basketToChange.Quantity__c = quantity;

    try {
      update basketToChange;
    } catch (Exception e) {
      System.debug('The following exception has occurred: ' + e.getMessage());
    }
  }

  @AuraEnabled
  public static void editCheckboxValue(Basket__c basketId, Boolean checkbox) {
    Basket__c basketToChange = [
      SELECT ProductStatus__c
      FROM Basket__c
      WHERE Id = :basketId.Id
      LIMIT 1
    ];

    try {
      basketToChange.ProductStatus__c = checkbox;
      update basketToChange;
    } catch (Exception e) {
      System.debug('The following exception has occurred: ' + e.getMessage());
    }
  }

  @AuraEnabled
  public static void deleteBasket(Basket__c basketId) {
    List<Basket__c> basketToDelete = [
      SELECT Id
      FROM Basket__c
      WHERE Id = :basketId.Id
    ];

    Database.DeleteResult[] drList = Database.delete(basketToDelete, false);
    // Iterate through each returned result
    for (Database.DeleteResult dr : drList) {
      if (dr.isSuccess()) {
        // Operation was successful, so get the ID of the record that was processed
        System.debug('Successfully deleted Basket with ID: ' + dr.getId());
      } else {
        // Operation failed, so get all errors
        for (Database.Error err : dr.getErrors()) {
          System.debug('The following error has occurred.');
          System.debug(err.getStatusCode() + ': ' + err.getMessage());
          System.debug(
            'Basket fields that affected this error: ' + err.getFields()
          );
        }
      }
    }
  }
}

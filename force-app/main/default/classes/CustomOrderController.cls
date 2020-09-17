public with sharing class CustomOrderController {
  @AuraEnabled(cacheable=true)
  public static List<Custom_Order__c> getOrders(String contactId) {
    List<Custom_Order__c> orders = [
      SELECT
        Id,
        Order_Number__c,
        Status__c,
        Delivery_date__c,
        Delivery_address__c,
        Type_of_payment__c,
        Description__c,
        Total_Amount__c
      FROM Custom_Order__c
      WHERE ContactId__c = :contactId
    ];

    if (orders.isEmpty()) {
      throw new AuraHandledException('Forced error');
    }

    return orders;
  }

  @AuraEnabled(cacheable=true)
  public static List<Custom_Order__c> getOrdersById(String orderId) {
    List<Custom_Order__c> orders = [
      SELECT
        Id,
        Order_Number__c,
        Status__c,
        Delivery_date__c,
        Type_of_payment__c
      FROM Custom_Order__c
      WHERE Id = :orderId
    ];

    // if (orders.isEmpty()) {
    //   throw new AuraHandledException('Forced error');
    // }

    return orders;
  }

  @AuraEnabled
  public static void deleteOrder(String orderId) {
    Savepoint sp = Database.setSavepoint();
    try {
      System.debug('deleteOrder');

      List<Custom_Order__c> orders = getOrdersById(orderId);

      delete orders;
    } catch (Exception e) {
      System.debug('deleteOrder catch ');

      Database.rollback(sp);
      System.debug(e.getMessage());
    }
  }

  @AuraEnabled
  public static void formOrder(
    Date deliveryDate,
    String typeOfPayment,
    String orderId,
    String id,
    String description,
    Boolean isHideDeliveryDate
  ) {
    System.debug('formOrder');

    Savepoint sp = Database.setSavepoint();
    try {
      // if (isHideDeliveryDate) {
      //   List<DeliveryAdress__c> addresses = ContactController.getDeliveryAdressById(
      //     id
      //   );

      //   for (DeliveryAdress__c a : addresses) {
      //     a.Custom_OrderId__c = orderId;
      //   }
      //   update addresses;
      // }

      List<Custom_Order__c> orders = getOrdersById(orderId);

      for (Custom_Order__c o : orders) {
        o.Delivery_date__c = deliveryDate;
        o.Type_of_payment__c = typeOfPayment;
        o.Description__c = description;
        if (isHideDeliveryDate) {
          List<DeliveryAdress__c> addresses = ContactController.getDeliveryAdressById(
            id
          );
          o.Delivery_address__c = addresses[0].Adress__c;
        }
      }
      update orders;
    } catch (Exception e) {
      System.debug('formOrder catch ');

      Database.rollback(sp);
      System.debug(e.getMessage());
    }
  }

  @AuraEnabled(cacheable=true)
  public static List<SelectOption> getTypesOfPaymentOptions() {
    List<SelectOption> options = new List<SelectOption>();
    for (PicklistEntry entry : Constants.TYPE_OF_PEYMENT) {
      options.add(new SelectOption(entry.getLabel(), entry.getValue()));
    }
    return options;
  }

  @AuraEnabled(cacheable=true)
  public static List<DeliveryAdress__c> getDeliveryAdressByOrderId(
    String orderId
  ) {
    List<DeliveryAdress__c> deliveryAdress = [
      SELECT
        Id,
        Country__c,
        State__c,
        City__c,
        Street__c,
        PostalCode__c,
        Adress__c,
        Custom_OrderId__c
      FROM DeliveryAdress__c
      WHERE Custom_OrderId__c = :orderId
      LIMIT 1
    ];

    // if (deliveryAdress.isEmpty()) {
    //   throw new AuraHandledException('Forced error');
    // }
    return deliveryAdress;
  }
}

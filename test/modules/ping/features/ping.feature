Feature: Ping

  Scenario: El endpoint de ping retorna pong con timestamp
    Given el servicio está disponible
    When se ejecuta el caso de uso ping
    Then la respuesta tiene message "pong"
    And la respuesta tiene un timestamp

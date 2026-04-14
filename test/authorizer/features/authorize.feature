# language: es
Característica: Autorización de petición entrante

  Esquema del escenario: Use case extrae el rawAuth desde los headers
    Dado que los headers entrantes son "<descripcion_headers>"
    Cuando el use case ejecuta con esos headers
    Entonces el servicio de autorización recibe el rawAuth "<rawAuth_esperado>"

    Ejemplos:
      | descripcion_headers               | rawAuth_esperado   |
      | Authorization: Bearer token-value | Bearer token-value |
      | authorization: Bearer token-value | Bearer token-value |
      | sin headers                       |                    |

  Escenario: Authorization tiene prioridad sobre authorization en minúsculas
    Dado que los headers contienen "Authorization" con "Bearer upper" y "authorization" con "Bearer lower"
    Cuando el use case ejecuta con esos headers
    Entonces el servicio recibe el rawAuth "Bearer upper"

  Esquema del escenario: AuthorizerService rechaza la autorización
    Dado una petición con rawAuth de tipo "<tipo_rawAuth>"
    Cuando se invoca authorize con ese rawAuth
    Entonces se lanza el error con código AUTH-003

    Ejemplos:
      | tipo_rawAuth         |
      | sin prefijo Bearer   |
      | vacío                |
      | con jti en blacklist |

  Escenario: Autorización concedida
    Dado un JWT válido cuyo jti no está en la blacklist
    Cuando se invoca authorize con ese token
    Entonces se retorna el payload con sub, email y jti

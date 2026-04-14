# language: es
Característica: Login de usuario

  Esquema del escenario: Login rechazado
    Dado que la IP "<ip>" tiene "<intentos>" intentos fallidos y el usuario existe "<usuario_existe>"
    Cuando hace login con email "<email>" y contraseña "<password>"
    Entonces se lanza el error con código "<codigo_error>"

    Ejemplos:
      | ip      | intentos | usuario_existe | email             | password       | codigo_error |
      | 1.2.3.4 | 5        | sí             | user@test.com     | Test1234!      | AUTH-002     |
      | 1.2.3.4 | 0        | no             | noexiste@test.com | Test1234!      | AUTH-001     |
      | 1.2.3.4 | 0        | sí             | user@test.com     | WrongPassword! | AUTH-001     |

  Escenario: Login exitoso
    Dado que la IP "1.2.3.4" no ha superado el rate limit y el usuario existe con credenciales válidas
    Cuando hace login con las credenciales correctas
    Entonces se retorna accessToken, refreshToken y expiresIn
    Y el refresh token queda almacenado en base de datos

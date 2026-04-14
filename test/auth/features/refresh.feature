# language: es
Característica: Rotación de refresh token

  Esquema del escenario: Refresh rechazado por estado del token
    Dado un refresh token con estado "<estado_token>"
    Cuando se invoca refresh con ese tokenId
    Entonces se lanza el error con código "<codigo_error>"

    Ejemplos:
      | estado_token  | codigo_error |
      | no encontrado | AUTH-003     |
      | revocado      | AUTH-004     |
      | expirado      | AUTH-003     |

  Escenario: Usuario del token no existe
    Dado un refresh token válido cuyo usuario no existe en base de datos
    Cuando se invoca refresh con ese tokenId
    Entonces se lanza el error con código AUTH-005

  Escenario: Refresh exitoso
    Dado un refresh token válido con usuario existente
    Cuando se invoca refresh con ese tokenId
    Entonces se retorna un nuevo accessToken y refreshToken diferentes al anterior
    Y el token anterior queda rotado en base de datos

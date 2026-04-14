# language: es
Característica: Cierre de sesión

  Escenario: Logout exitoso
    Dado un access token JWT válido y un refreshToken vigente
    Cuando se invoca logout con ambos tokens
    Entonces el refresh token es revocado en base de datos
    Y el jti del access token es agregado a la blacklist con TTL residual
    Y se retorna el mensaje "Sesión cerrada correctamente"

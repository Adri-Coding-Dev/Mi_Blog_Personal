# Información de la Máqina
    ## Nombre: Borazuwarahctf
    ## Tipo: DockerLabs
    ## IP: 172.17.0.2
    ## Objetivo: Acceso al sistema por SSH

# 1.- Despliege
## Desplegamos el contendor de docker con el siguiente comando:
```bash
sudo bash auto_deploy.sh borazuwarahctf.tar
```
![Despliegue](Despliege_Contenedor.png)
## Nos da la ip 172.17.0.2, asi que probamos la conectividad:
![conectividad](Conectividad_maquina_Ctf.png)
### (Conectividad con la maquina)

# 2.- Fase de Reconocimiento
## En esta fase buscamos ver que puertos estan abiertos, por lo que usando nmap procedemos a hacer el escaneo de puertos, concretamente uso este:
```bash
nmap -p- --open -sV --min-rate 5000 -vvv -n 172.17.0.2
``` 
![escaneo](Fase_Reconocimiento_Puertos.png)
### Vemos que tenemos el puerto 22 abierto, que corresponde a SSH; y el puerto 80 que corresponde a un dominio web, asi que primero vamos a observar la pagina:
![pagina](Dominio_web.png)
### vemos una imagen, por lo que decido descargarla y analizarla:
![imagen1](metadatos_1_imagen.png)
### Miramos el contenido de secreto.txt (no nos dice nada) y volvemos a analizar mas detenidamente:
![imagen2](metadatos_2_imagen.png)

# 3.- Usuarios encontrados
Gracias a analizar la imagen, vemos que dentro de los metadatos de la imagen se esconde un usuario, por lo que probamos fuerza bruta para analizar alguna contraseña correspondida:
![hydra](fuerza_bruta.png)
### encontramos la contraseña 123456 asociada al usuario, por lo que lanzamos una ssh con las credenciales que ya tenemos:
![ssh](ssh_completado.png)
### De forma exitosa podemos acceder al sistema, con el usuario borazuwarahctf, asi que cvamos a buscar binarios potenciales con permisos administrativos:
![binarios](binarios_potenciales.png)
### Encontramos que la bash la podemos ejecutar como administrador sin credenciales, por lo que si ejecutamos la bash y hacemos whoami, podremos ver el usuario root actuando:
![root](root.png)
## MAQUINA TERMINADA!!!

# Conclusiones
>> Dentro del dominio web hay una imagen con metadatos sensibles.

>> Conseguimos por fuerza bruta la contraseña vulnerable del usuario.

>> El binario bash se puede ejecutar sin credenciales, por lo que podemos acceder como root sin contraseña.

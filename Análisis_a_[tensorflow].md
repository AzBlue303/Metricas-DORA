# Análisis metricas DORA en tensorflow (2023)

## Deployment Frecuency

Tensorflow tuvo 8 despliegues estables durante el 2023, esto implica que el equipo de desarrollo tuvo un nivel bajo de despliegues a produccion. Esto se puede resolver haciendo despliegues mas pequeños, esto permite hacer mas sencillo el testeo, despliegue y la solucion de errores, ya que es mas sencillo encontrar estos en puntos pequeños de codigo.
Sin embargo en 2024 fue peor aun teniendo aun menos despliegues, lo que muestra una baja en el rendimiento del equipo.

## Lead Time For Changes

En 2023 el equipo de Tensorflow se tardo en promedio 1.75 dias en resolver errores y enviarlos a produccion, esto implica que el equipo tuvo un alto nivel de adaptacion a estos.
Sin embargo en el año 2024 su nivel se redujo de manera no muy alta pasando a tardarse 6.5 dias en resolver sus despliegues.

El siguiente grafico de curva muestra como fue la velocidad de despliegue del equipo en cuanto a dias del año 2023.

![Calculo LTFC Sobre Tensorflow 2023](./CalculoLTFC.png)

El siguiente muestra la velocidad de despliegue en el año 2024

![Calculo LTFC Sobre Tensorflow 2023](./CalculoLTFC2.png)

## Change Failure Rate 

El porcentaje de despliegues con fallos de Tensorflow en el 2023 fue de un 52.94%, lo que dice que la mitad de los despliegues del equipo venian con fallos. Esto dice que el equipo tuvo un rendimiento bajo en cuanto a despliegues exitosos.

En 2024 se redujo este porcentaje a un 50%, lo que sigue siendo demasiado alto, demostrando el bajo rendimiento del equipo.

## Mean Time to Recovery

En promedio el equipo de desarrollo de Tensorflow en 2023 se tardo 26.89 dias en recuperarse de los errores, esto mostro que el equipo tiene una baja capacidad para recuperarse de los errores, esto posiblemente por su bajo nivel de frecuencia de despliegues, esto porque al ser despliegues mas grandes es mas complejo encontrar las fuentes de errores.

Este promedio aumento en 2024, esto al igual que 2023 se debe la baja frecuencia de despliegues.
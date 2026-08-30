Por que usar Cancel antes que hacer un DELETE crudo.

Contexto y decision.
Dado que el metodo DELETE se usa habitualmente para eliminar completamente cualquier registro, se ha decicido utilizar la transicion hacia un estado terminal CANCELLED, permitiendo que dicho registro se mantenga "vivo" y en consecuencia, posibilitar el control de solicitudes anteriores.

Consecuencias: 

* Al implementar el estado de cancelacion antes que el DELETE crudo, se pierde la simplicidad que implica aplicar un metodo de eliminacion crudo, sin mas. En consecuencia, a pesar de limitar la sencillez, al aplicarse el metodo de cancelacion, se adquiere la posibilidad de mantener un historial auditable en el tiempo. Dicho esto, la implementacion del estado de cancelacion agrega como nuevos comportamientos la necesidad de filtrar la solicitud, por ende, implica incorporar nuevas reglas de negocio. 
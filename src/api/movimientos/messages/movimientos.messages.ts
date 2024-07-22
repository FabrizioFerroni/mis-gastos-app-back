export enum MovimientoMensaje {
  MOVEMENT_UPDATED = 'Movimiento actualizado con éxito',
  MOVEMENT_OK = 'Nuevo movimiento creado.',
  MOVEMENT_DELETED = 'Se ha borrado el movimiento con éxito',
  MOVEMENT_RESTORED = 'Se ha restaurado el movimiento con éxito',
}

export enum MovimientoErrorMensaje {
  MOVEMENT_NOT_SAVED = 'Ups... Hubo un error al crear o editar el movimiento. Por favor, inténtelo de nuevo más tarde',
  MOVEMENT_NOT_DELETED = 'Ups... Hubo un error al eliminar el movimiento. Por favor, inténtelo de nuevo más tarde',
  MOVEMENT_NOT_RESTORED = 'Ups... Hubo un error al restaurar el movimiento. Por favor, inténtelo de nuevo más tarde',
  MOVEMENT_NOT_FOUND = 'No se ha encontrado un movimiento.',
  MOVEMENT_NRO_CUENTA_EXIST = 'El movimiento con ese número de cuenta ya esta registrada, por favor ingrese otra',
  MOVEMENT_NOMBRE_EXIST = 'El movimiento con ese nombre ya esta registrada, por favor ingrese otro',
}

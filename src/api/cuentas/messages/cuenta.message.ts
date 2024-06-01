export enum CuentaMensaje {
  ACCOUNT_UPDATED = 'Cuenta actualizada con éxito',
  ACCOUNT_OK = 'Cuenta creada con éxito',
  ACCOUNT_DELETED = 'Cuenta eliminada con éxito',
  ACCOUNT_RESTORED = 'Cuenta restaurada con éxito',
}

export enum CuentaErrorMensaje {
  ACCOUNT_NOT_SAVED = 'Ups... Hubo un error al crear o editar la cuenta. Por favor, inténtelo de nuevo más tarde',
  ACCOUNT_NOT_DELETED = 'Ups... Hubo un error al eliminar la cuenta. Por favor, inténtelo de nuevo más tarde',
  ACCOUNT_NOT_RESTORED = 'Ups... Hubo un error al restaurar la cuenta. Por favor, inténtelo de nuevo más tarde',
  ACCOUNT_NOT_FOUND = 'No se ha encontrado una cuenta.',
  ACCOUNT_NRO_CUENTA_EXIST = 'La cuenta con ese número de cuenta ya esta registrada, por favor ingrese otra',
  ACCOUNT_NOMBRE_EXIST = 'La cuenta con ese nombre ya esta registrada, por favor ingrese otro',
}

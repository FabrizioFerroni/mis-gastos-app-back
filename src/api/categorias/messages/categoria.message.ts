export enum CategoriaMensaje {
  CATEGORY_UPDATED = 'Categoria actualizada con éxito',
  CATEGORY_OK = 'Categoria creada con éxito',
  CATEGORY_DELETED = 'Categoria eliminada con éxito',
  CATEGORY_RESTORED = 'Categoria restaurada con éxito',
}

export enum CategoriaErrorMensaje {
  CATEGORY_NOT_SAVED = 'Ups... Hubo un error al crear o editar la categoria. Por favor, inténtelo de nuevo más tarde',
  CATEGORY_NOT_DELETED = 'Ups... Hubo un error al eliminar la categoria. Por favor, inténtelo de nuevo más tarde',
  CATEGORY_NOT_RESTORED = 'Ups... Hubo un error al restaurar la categoria. Por favor, inténtelo de nuevo más tarde',
  CATEGORY_NOT_FOUND_LOG = 'No se ha encontrado una categoria con el id ingresado en nuestra base de datos.',
  CATEGORY_NOT_FOUND = 'No se ha encontrado una categoria',
  CATEGORY_NOMBRE_EXIST = 'La categoria con ese nombre ya esta registrada, por favor ingrese otro',
}

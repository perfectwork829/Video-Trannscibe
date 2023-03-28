export const ROLE = {
  OWNER: 'owner',
  ADMIN: 'admin',
  VIEWER: 'viewer',
  EDITOR: 'editor',
};

export const PERMISSION = {
  // Organisation
  CREATE_ORGANISATION: 'create_organisation',
  READ_ORGANISATION: 'read_organisation',
  UPDATE_ORGANISATION: 'update_organisation',
  DELETE_ORGANISATION: 'delete_organisation',

  // Project
  CREATE_PROJECT: 'create_project',
  READ_PROJECT: 'read_project',
  UPDATE_PROJECT: 'update_project',
  DELETE_PROJECT: 'delete_project',

  // User
  CREATE_USER: 'create_user',
  READ_USER: 'read_user',
  UPDATE_USER: 'update_user',
  DELETE_USER: 'delete_user',
};

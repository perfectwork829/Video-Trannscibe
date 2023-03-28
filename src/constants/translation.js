export const PAGES = {
  LOGIN: 'Login',
  SIGNUP: 'Signup',
  PROJECT: 'Project',
  TRANSCRIPT: 'AVID FILES',
  PAPER_LIST: 'Paper List',
  PAPER_EDIT: 'Rough Cut',
  MEDIA_FILES: 'Media Files',
  SEARCH: 'Search',
  SETTINGS: 'Settings',
  // DASHBOARD: 'Dashboard',
};

export const FOLDER_TABS = {
  TRANSCRIPT: {
    value: 'Folder tab transcript',
    label: 'Transcript',
  },
  PAPER_EDITS: {
    value: 'Folder tab paper edits',
    label: 'Paper Edits',
  },
  MEDIA_FILES: {
    value: 'Folder tab media files',
    label: 'Media Files',
  },
};

export const TRANSCRIPT_TABS = [
  { value: 'transcript_tab', label: 'Transcript' },
  { value: 'paperedit_tab', label: 'Paper Edits' },
  { value: 'search_tab', label: 'Search' },
  { value: 'settings_tab', label: 'Settings' },
];

export const TRANSCRIPT_VIEW_MODE = {
  TRANSCRIPT_EDIT: 'Transcritp Edit',
  PAPER_EDIT: 'Paper Edit',
};

export const PAPER_SUB_PAGE = {
  LIST: 'Paper List',
  PAPER_EDIT: 'Paper Edit',
};

export const starIconStr = `<svg
  aria-hidden="true"
  focusable="false"
  data-prefix="fas"
  data-icon="star"
  role="img"
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 576 512"
  class="svg-star svg-inline--fa fa-star fa-w-18"
  >
  <path  
	fill="currentColor"
	d="M259.3 17.8L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0z"
  ></path>
  </svg>`;

export const silentIconStr = `<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="stop-circle" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="svg-inline--fa fa-stop-circle fa-w-16"><path data-v-f7dda52c="" fill="currentColor" d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm96 328c0 8.8-7.2 16-16 16H176c-8.8 0-16-7.2-16-16V176c0-8.8 7.2-16 16-16h160c8.8 0 16 7.2 16 16v160z" class=""></path></svg>`;

export const SEARCH_CONDTION_TYPE = {
  TITLE: {
    label: 'Title',
    value: 'title',
  },
  DESCRIPTION: {
    label: 'Description',
    value: 'description',
  },
  PARTICIPANTS: {
    label: 'Participants',
    value: 'participants',
  },
  CREATED_AT: {
    label: 'Created At',
    value: 'createdAt',
  },
};

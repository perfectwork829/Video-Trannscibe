import avbFilePng from '../images/new/AVBFile.png';
import folderPng from '../images/new/Folder.png';
import mediFilesPng from '../images/new/MediFiles.png';
import paperEditPng from '../images/new/PaperEdit.png';

export const getResource = (resString) => {
  // if (process.env.VUE_APP_BUILD_MODE === 'APP') return resString;
  if (process.env.VUE_APP_BUILD_MODE === '') return resString;
  else {
    switch (resString) {
      case 'res:/PNG/#163':
        return avbFilePng;
      case 'res:/PNG/#159':
        return mediFilesPng;
      case 'res:/PNG/#158':
        return folderPng;
      case 'res:/PNG/#166':
        return paperEditPng;
      default:
        return '';
    }
  }
};

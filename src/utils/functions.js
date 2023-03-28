export const getFullPath = (transcriptInfo) => {
    const projectTitle = transcriptInfo.curProjectName;
    const projectSubTitle = transcriptInfo.curProjectSubName;
    const clipName = transcriptInfo.transcriptItemData.title;
    if (transcriptInfo.direct_media) return `${projectTitle} / ${clipName}`;
    const clipParentId = transcriptInfo.transcriptItemData.parent_id;
    const clipParent = transcriptInfo.transcriptData.filter(it => it.id === clipParentId)[0].title;
    const path = `${projectTitle} / ${projectSubTitle} / ${clipParent} / ${clipName}`;
    return path;
}
export const getFullPath2 = (item) =>  {
    let path =
      item.projectName +
      "/" +
      item.projectSubName +
      "/" +
      item.parentTitle +
      "/" +
      item.title;
    return path;
}

export const getThumbnailUrl = (gsPath) => {
    const manifestUrl =
      gsPath.replace("gs://", "https://storage.googleapis.com/") +
      "small-sprite-sheet0000000000.jpeg";
    return manifestUrl;
}

export const removeHtmlTags = (element) => {
    return element.replace(/<[^>]*>/g, "")
}

export const replaceHtmlCharacters = (element) => {
    // return element.replace(/\u00a0/g, " "); // remove &nbsp;
    return element.replace(/&nbsp;/g," ");
}

export const  hexToRgb = (hex) => {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      red: parseInt(result[1], 16)/255,
      green: parseInt(result[2], 16)/255,
      blue: parseInt(result[3], 16)/255
    } : null;
  }
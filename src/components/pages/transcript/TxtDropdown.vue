<template>
  <div
    class="edmon-btn-dropdown-wrapper txt-dropdown-wrapper"
    v-click-outside="hideDropdown"
  >
    <button
      class="btn btn-primary edmon-dropdown-anchorbtn"
      @click="
        (event) => {
          event.preventDefault();
          open = !open;
        }
      "
    >
      <fa-icon :icon="['fas', 'share']" />
    </button>
    <ul :class="`edmon-dropdown-menu ${open ? 'open' : ''}`">
      <li class="item" @click="exportText">Text (.txt)</li>
      <li class="item" @click="exportPDF">Pdf (.pdf)</li>
    </ul>
  </div>
</template>

<script>
import { formatTime } from 'app/utils';
import { mapGetters } from 'vuex';
import jsPDF from 'jspdf';
import { createGoogleDocAPI, EditGoogleDocAPI, getGoogleAccessToken } from 'app/api';
import { getFullPath, removeHtmlTags, replaceHtmlCharacters, hexToRgb } from 'app/utils';

export default {
  name: 'TxtDropdown',
  data: function () {
    return {
      open: false,
    };
  },
  computed: {
    ...mapGetters(['transcriptInfo']),
  },
  methods: {
    hideDropdown: function () {
      this.open = false;
    },
    getStartTime: function (monologuesItem) {
      let sTime = 0;
      let checked = false;
      if (Object.keys(monologuesItem).indexOf('elements') >= 0) {
        monologuesItem.elements.forEach((itemElem) => {
          if (checked) return;
          if (itemElem.ts) {
            sTime = itemElem.ts;
            checked = true;
          }
        });
        return {
          startTime: sTime,
        };
      }
      return {
        startTime: 0
      };
    },
    exportText: function(){
      let str = '';

      this.transcriptInfo.transcriptItemData.content.monologues.forEach((monologue) => {
        const elements = monologue.elements;
        if (elements && elements.length) {
          const time = this.getStartTime(monologue);
          const speaker = isNaN(monologue.speaker)
                ? monologue.speaker
                : 'Speaker ' + (parseInt(monologue.speaker) + 1);
          str += `${speaker}:\t${formatTime(time.startTime)}\n`;
          elements.forEach(element => {
            // str += `${element.value.replace(/<[^>]*>/g, "")}` // remove html tags
            str += replaceHtmlCharacters(removeHtmlTags(element.value))
          })
          str+='\n\n';
        }
      });

      let blob = new Blob([ str ], { "type" : "text/plain" });
      let link = document.createElement('a')
      link.href = window.URL.createObjectURL(blob)
      link.download = this.getTranscriptName() + '.txt'
      link.click()
    },
    exportPDF: function () {
      this.convertHTMLToPDF();
      const temp = true;
      if (temp) return;
      var pageWidth = 8.5,
        pageHeight = 11.5,
        lineHeight = 1.2,
        margin = 0.5,
        maxLineWidth = pageWidth - margin * 2,
        metaFontSize = 12,
        fontSize = 13,
        titleFontSize = 14,
        metaFontName = "Arial",
        fontName = "Open Sans",
        ptsPerInch = 72,
        // metaOneLineHeight = (metaFontSize * lineHeight) / ptsPerInch, 
        oneLineHeight = (fontSize * lineHeight) / ptsPerInch,
        doc = new jsPDF({
          unit: "in",
          lineHeight: lineHeight
        })
        .setProperties({ title: this.getTranscriptName() });
        const path = getFullPath(this.transcriptInfo) + '\n' + '\n' + '\n';
        const maxRows = pageHeight/oneLineHeight;
        let currentLine = 0;
        
        doc
          // .setTextColor(255, 0, 0)
          .setFont(metaFontName, "bold")
          .setFontSize(titleFontSize)
          .text(
            path,
            margin,
            margin + oneLineHeight * currentLine
        );
        currentLine += 2;
        this.transcriptInfo.transcriptItemData.content.monologues.forEach((monologue, index) => {
          let elements = monologue.elements;
          
          if (elements && elements.length) {
            const time = this.getStartTime(monologue);
            const speaker = isNaN(monologue.speaker)
                ? monologue.speaker
                : 'Speaker ' + (parseInt(monologue.speaker) + 1);
            const meta =  `${speaker}:\t${formatTime(time.startTime)}\n\n`;
            let str = '';
            elements.forEach(element => {
              str += `${replaceHtmlCharacters(removeHtmlTags(element.value))}` // remove html tags
            })
            str= str + '\n';

            var textLines = doc
              .setFont(fontName, "normal")
              .setFontSize(fontSize)
              .splitTextToSize(str, maxLineWidth);
            if (currentLine + textLines.length + 1 > maxRows) {
              doc.addPage();
              currentLine = 0;
            }
            doc
            .setFont(metaFontName, "italic")
            .setFontSize(metaFontSize)
            .text(
              meta,
              margin,
              margin + oneLineHeight * currentLine
            );
            currentLine +=  metaFontSize/fontSize;
            doc
              .setFont(fontName, "normal")
              .setFontSize(fontSize)
            doc.text(textLines, margin, margin + oneLineHeight * currentLine)
            currentLine += textLines.length;
          }
        });
        // console.log('currentLine', currentLine)
      doc.save(this.getTranscriptName() + '.pdf');
    },
    exportGoogleDoc: async function () {
      console.log('here')
      if (!this.transcriptInfo.transcriptItemData.content.monologues.length) {
        alert('You don\'t have any contents to export');
      } else {
        let access_token = '';
        if (process.env.VUE_APP_BUILD_MODE === 'APP') {
          const ElectronGoogleOAuth2 = require('@getstation/electron-google-oauth2').default;
          const myApiOauth = new ElectronGoogleOAuth2(
            process.env.VUE_APP_GOOGLE_CLIENT_ID,
            process.env.VUE_APP_GOOGLE_CLIENT_SECRET,
            ['https://www.googleapis.com/auth/drive'],
            { successRedirectURL: 'https://docs.google.com/document/u/0/?tgif=d' }
          );
          access_token = await new Promise((resolve, reject) => {
            myApiOauth.openAuthWindowAndGetTokens()
            .then(token => {
              // use your token.access_token
              resolve(token.access_token)
            }).catch(err => {
              reject(err)
            })
            ;
          })
        } else {
          console.log('web google auth')
          const authCode = await this.$gAuth.getAuthCode();
          console.log('auth code', authCode);
          const res = await getGoogleAccessToken(authCode);
          if (res.status === 200) access_token = res.data.access_token;
        }
        const title = this.getTranscriptName();
        const res = await createGoogleDocAPI(access_token, title);
        const documentID = res.data.documentId;
        // const documentID = '1m-sIopS5eivFIhS0dTLmswjBcDFDJcQ5Lxo_k7GZ5sg';
        const path = getFullPath(this.transcriptInfo) + '\n' + '\n' + '\n';
        // const path = 'Mpeg2 / Other / YCombinator Bin.avb / Elon Musk.mp4' + '\n' + '\n' + '\n';
        const path_array = path.split(' / ');
        let avb_index = 0;
        let avb_length = 0;
        path_array.forEach(it => {
          if (it.substr(it.length-4) === '.avb') {
            avb_index = path.indexOf(it);
            avb_length = it.length
          }
        })
        
        const requests = [];
        let location = 1;
        requests.push(
          {
            insertText: {
              text: path,
              location: {
                index: location,
              },
            }
          }
        );
        requests.push({
          updateTextStyle: {
            textStyle: {
              bold: false,
              italic: true,
              weightedFontFamily: {
                fontFamily: 'Arial'
              },
              
              fontSize: {
                magnitude: 9,
                unit: "PT",
              },
            },
            fields: "bold,italic,fontSize, weightedFontFamily",
            range: {
              startIndex: location,
              endIndex: location + path.length,
            },
          },
        })
        if (avb_index) {
          requests.push({
            updateTextStyle: {
              textStyle: {
                bold: true,
                italic: true,
                weightedFontFamily: {
                  fontFamily: 'Arial'
                },
                fontSize: {
                  magnitude: 9,
                  unit: "PT",
                },
              },
              fields: "bold,italic,fontSize, weightedFontFamily",
              range: {
                startIndex: location + avb_index,
                endIndex: location + avb_index + avb_length,
              },
            },
          })
        }
        
        location += path.length;
        this.transcriptInfo.transcriptItemData.content.monologues.forEach((monologue, index) => {
            let elements = monologue.elements;
            if (elements && elements.length) {
              const speaker = isNaN(monologue.speaker)
                ? monologue.speaker
                : 'Speaker ' + (parseInt(monologue.speaker) + 1);
              const time = this.getStartTime(monologue);
              if (!time.startTime) return;
              const meta =  `${speaker}:\t${formatTime(time.startTime)}\n`;
              requests.push(
                {
                  insertText: {
                    text: meta,
                    location: {
                      index: location,
                    },
                  }
                }
              );
              requests.push({
                updateTextStyle: {
                  textStyle: {
                    bold: false,
                    italic: true,
                    weightedFontFamily: {
                      fontFamily: 'Arial'
                    },
                    fontSize: {
                      magnitude: 9,
                      unit: "PT",
                    },
                  },
                  fields: "bold,italic,fontSize, weightedFontFamily",
                  range: {
                    startIndex: location,
                    endIndex: location + meta.length,
                  },
                },
              })
              location += meta.length;
              let str = '';
              // isStartStarItem: function(itemSpan, idx) {
              //   if (idx == 0) {
              //     return this.isStarItem(itemSpan);
              //   }
              //   else return !this.isStarItem(this.items.elements[idx -1]) && this.isStarItem(itemSpan);
              // },
              // isEndStarItem: function (itemSpan, idx) {
              //   if (idx == this.items.elements.length -1) return this.isStarItem(itemSpan)
              //   else return !this.isStarItem(this.items.elements[idx + 1]) && this.isStarItem(itemSpan)
              // },
              elements.forEach((element, idx) => {
                // str += `${replaceHtmlCharacters(removeHtmlTags(element.value))}` // remove html tags
                let sub_str = `${idx ==0 ? '- ': ''}${replaceHtmlCharacters(removeHtmlTags(element.value))}`;
                if (element.tag_type === 'strong'){
                  if (this.isStartStarItem(elements, element, idx)) sub_str = "\u2605" + sub_str;
                  if (this.isEndStarItem(elements, element, idx)) sub_str = sub_str + "\u2605";
                  // sub_str = "\u2605" + sub_str + "\u2605" // add star
                }
                if (sub_str.length) {
                  requests.push(
                  {
                    insertText: {
                      text: sub_str,
                      location: {
                        index: location,
                      },
                    }
                  }
                  );
                  const textStyle = {
                    bold: false,
                    italic: false,
                    weightedFontFamily: {
                      fontFamily: 'Courier New'
                    },
                    fontSize: {
                      magnitude: 11,
                      unit: "PT",
                    },
                  }
                  if (element.tag_type === 'strike') {
                    textStyle.strikethrough = true;
                  }
                  if (element.tag_type === 'color') {
                    textStyle.backgroundColor = {
                      color: {
                        rgbColor: hexToRgb(element.attr)
                      }
                    }
                  }
                  
                  requests.push({
                    updateTextStyle: {
                      textStyle: textStyle,
                      fields: "bold,italic,fontSize, weightedFontFamily, strikethrough, backgroundColor",
                      range: {
                        startIndex: location,
                        endIndex: location + sub_str.length,
                      },
                    },
                  })
                  location += sub_str.length;
                }
                // str += sub_str;
              })
              const text = str + '\n' + '\n';
              requests.push(
                {
                  insertText: {
                    text: text,
                    location: {
                      index: location,
                    },
                  }
                }
              );
              requests.push({
                updateTextStyle: {
                  textStyle: {
                    bold: false,
                    italic: false,
                    weightedFontFamily: {
                      fontFamily: 'Courier New'
                    },
                    fontSize: {
                      magnitude: 11,
                      unit: "PT",
                    },
                  },
                  fields: "bold,italic,fontSize, weightedFontFamily",
                  range: {
                    startIndex: location,
                    endIndex: location + text.length,
                  },
                },
              })
              location += text.length;
            }
          });
        await EditGoogleDocAPI(documentID, access_token, requests);
        const docLink = `https://docs.google.com/document/d/${documentID}/edit`;
        console.log('docLink', docLink)
        if (process.env.VUE_APP_BUILD_MODE === 'APP') require("electron").shell.openExternal(docLink);
        else window.open(docLink, '_blank')
      }
    },
    getTranscriptName: function() {
      let name = this.transcriptInfo.transcriptItemData.title;
      return name;
    },
    convertHTMLToPDF: function() {
      var doc = new jsPDF('l', 'mm', [841, 1189]);
      // var doc = new jsPDF()
      var pdfjs = document.querySelector('.script_content');
      console.log('pdfjs', pdfjs)
      doc.html(pdfjs, {
          callback: function(doc) {
              doc.save("output.pdf");
          },
          x: 10,
          y: 10
      });

      // doc.output('dataurlnewwindow');
    },
    isStarItem: function (itemSpan) {
      return (
        (itemSpan.type === 'text' || itemSpan.type === 'punct') &&
        itemSpan.tag_type === 'strong'
      );
    },
    isStartStarItem: function(elements, itemSpan, idx) {
      if (idx == 0) {
        return this.isStarItem(itemSpan);
      }
      else return !this.isStarItem(elements[idx -1]) && this.isStarItem(itemSpan);
    },
    isEndStarItem: function (elements, itemSpan, idx) {
      if (idx == elements.length -1) return this.isStarItem(itemSpan)
      else return !this.isStarItem(elements[idx + 1]) && this.isStarItem(itemSpan)
    },
  },
};
</script>
<style lang="scss" scoped>
.txt-dropdown-wrapper {
  display: inline-block;
  .edmon-dropdown-anchorbtn {
    .svg-inline--fa {
      width: 16px;
      height: 16px;
      margin-right: 6px;
    }
  }
  .edmon-dropdown-menu {
    overflow: hidden;
    right: 0;
  }
}
</style>

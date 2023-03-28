export const formatTime = (time) => {
  var sec_num = Math.floor(time); // don't forget the second param
  var hours = Math.floor(sec_num / 3600);
  var minutes = Math.floor((sec_num - hours * 3600) / 60);
  var seconds = sec_num - hours * 3600 - minutes * 60;
  seconds += time - sec_num;
  seconds = seconds.toFixed(2);

  if (hours < 10) {
    hours = '0' + hours;
  }
  if (minutes < 10) {
    minutes = '0' + minutes;
  }
  if (seconds < 10) {
    seconds = '0' + seconds;
  }
  return hours + ':' + minutes + ':' + seconds;
};

export const formatYYYYMMDD = (dateParam) => {
  const dateOne = new Date(dateParam);
  let month = '' + (dateOne.getMonth() + 1);
  let day = '' + dateOne.getDate();
  const year = dateOne.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;
  return [year, month, day].join('-');
};

export const currentTimestamp = () => new Date().valueOf();

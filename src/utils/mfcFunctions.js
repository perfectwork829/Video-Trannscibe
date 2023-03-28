export const callMFCFunction = async (param1, param2) => {
  if (process.env.VUE_APP_BUILD_MODE !== 'APP') return '';
  const res = await window.external.JStoMFC(param1, param2);
  return res;
};

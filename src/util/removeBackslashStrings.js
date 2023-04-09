
export const removeBackslashStrings = (str) => {
  if (!str) return '';
  const regex = /```[\s\S]*?```/g;
  const backquoteRegex = /`/g;
  return str.replace(regex, '').replace(backquoteRegex, '');

  // const regex = /`{3}.*?`{3}/gs;  
  // return str.replace(regex, '');  
  
}

// function removeBackquoteStrings(str) {
//   const regex = /```[\s\S]*?```/g;
//   const backquoteRegex = /`/g;
//   return str.replace(regex, '').replace(backquoteRegex, '');
// }
'user strict';

function replaceAll (str, original, replaced) {
  let match = true;
  let out = str;
  while (match) {
    match = out.match(original, replaced);
    if (match) {
      out = out.replace(original, replaced);
    }
  }
  return out;
}

exports.replaceAll = replaceAll;

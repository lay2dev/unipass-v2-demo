export default {
  query(obj: string | { [key: string]: unknown }) {
    if (typeof obj === 'string') {
      const result = {};
      let start = obj.indexOf('?');
      let end = obj.indexOf('#');
      if (start === -1) {
        start = 0;
      } else {
        start += 1;
      }
      if (end === -1) {
        end = obj.length;
      }
      obj = obj.slice(start, end);
      if (obj) {
        for (const e of obj.split('&')) {
          const arr = e.split('=');
          result[arr[0]] = decodeURIComponent(arr[1]) || '';
        }
      }
      return result;
    } else {
      const arr = [];
      for (const key in obj) {
        const val = obj[key];
        arr.push([key, val].join('='));
      }
      let s = '';
      if (arr.length) {
        s = arr.join('&');
      }
      return s;
    }
  }
};
/**
 * get ckb address by pubkey
 * @param pubkey
 */
